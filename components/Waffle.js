
// BUG :: DOES NOT RE-RENDER WAFFLE ON PASTE WHEN LAST ROW IS VISIBLE

// -- WIP --
// TODO :: SUPPORT VARIALBE COL WIDTHS

// -- NICE TO HAVE --
// TODO :: MAKE HIGHLIGHT A FIST CLASS CONCEPT WHEN RENDERING, OPTION TO SHOW/HiDE; NEED OPTION TO CLEAR IT FROM CACHE TO NOT RENDER

//import debounce from 'debounce'
import React, { Component } from 'react'

const CELL_WIDTH = 100
const CELL_HEIGHT = 30
const COLUMN_HEADER_HEIGHT = 42
const HEADER_HEIGHT = 65
const MOUSE_DOWN_INTERVAL = 70
const ROW_NUMBER_WIDTH = 56
const SCROLL_TRACK_HEIGHT = 20
const SCROLL_TRACK_WIDTH = 20

export default class Waffle extends Component {

    constructor (props) {

        super(props) 

        // Properties
        this._focus = undefined
        this._highlight = undefined
        this._mouseDownInterval = undefined

        // Methods
        this.clearMouseDownInterval = this.clearMouseDownInterval.bind(this)
        this.drawWaffle = this.drawWaffle.bind(this)
        this.onClickCanvas = this.onClickCanvas.bind(this)
        this.onKeyDownWindow = this.onKeyDownWindow.bind(this)
        this.onKeyPressWindow = this.onKeyPressWindow.bind(this)
        this.onMouseDownInterval = this.onMouseDownInterval.bind(this)
        this.onPasteWindow = this.onPasteWindow.bind(this)
//        this.onWheelCanvas = debounce(this.onWheelCanvas.bind(this), 10)
        this.onWheelCanvas = this.onWheelCanvas.bind(this)
        this.scrollDown = this.scrollDown.bind(this)
        this.scrollLeft = this.scrollLeft.bind(this)
        this.scrollRight = this.scrollRight.bind(this)
        this.scrollUp = this.scrollUp.bind(this)
        this.stashInput = this.stashInput.bind(this)
        this.updateViewport = this.updateViewport.bind(this)
    }

    componentDidMount () {

        const { content } = this.props

        this._canvas = this.refs.canvas
        this._cellInput = this.refs.cellInput
        this._ctx = this._canvas.getContext('2d')
        this._scrollbarX = this.refs.scrollbarX
        this._scrollbarXButtonLeft = this.refs.scrollbarXButtonLeft
        this._scrollbarXButtonRight = this.refs.scrollbarXButtonRight
        this._scrollbarXThumb = this.refs.scrollbarXThumb
        this._scrollbarXTrack = this.refs.scrollbarXTrack
        this._scrollbarY = this.refs.scrollbarY
        this._scrollbarYButtonDown = this.refs.scrollbarYButtonDown
        this._scrollbarYButtonUp = this.refs.scrollbarYButtonUp
        this._scrollbarYThumb = this.refs.scrollbarYThumb
        this._scrollbarYTrack = this.refs.scrollbarYTrack
        this._waffle = this.refs.waffle
        this._waffleOrigin = { x: 0, y: 0 }

        const { devicePixelRatio } = window
    
        // Auto scale to retina
        // TODO :: ADD FURTHER RETINA SUPPORT
        this._ctx.scale(devicePixelRatio, devicePixelRatio)

        // Events
        window.addEventListener('resize', this.updateViewport, false)
        window.addEventListener('keydown', this.onKeyDownWindow, false)
        window.addEventListener('keypress', this.onKeyPressWindow, false)
        window.addEventListener('paste', this.onPasteWindow, false)

        // Fit content to viewport
        this.updateViewport()
    }

    componentWillUnmount () {

        window.removeEventListener('resize', this.updateViewport, false)
        window.removeEventListener('keydown', this.onKeyDownWindow, false)
        window.removeEventListener('keypress', this.onKeyPressWindow, false)
        window.removeEventListener('paste', this.onPasteWindow, false)
    }

    render () {

        const { onSetCellValue } = this.props

        return (
            <div className='waffle' ref='waffle'>
                <canvas 
                    onClick={this.onClickCanvas}
                    onWheel={this.onWheelCanvas}
                    /*
                    onWheel={e => {
                        e.persist()
                        this.onWheelCanvas(e)
                    }}
                    */
                    ref='canvas' 
                />
                <input 
                    className='cellInput' 
                    onChange={e => onSetCellValue(
                        (this._highlight.originY - COLUMN_HEADER_HEIGHT) / CELL_HEIGHT, 
                        (this._highlight.originX - ROW_NUMBER_WIDTH) / CELL_WIDTH, e.target.value
                    )}
                    ref='cellInput' 
                    type='text' 
                />
                <div className='scrollbarX' ref='scrollbarX'>
                    <div 
                        className='scrollbarXButtonLeft' 
                        onMouseDown={() => this.onMouseDownInterval(this.scrollLeft)}
                        onMouseOut={this.clearMouseDownInteLeft}
                        onMouseUp={this.clearMouseDownInterval}
                        ref='scrollbarXButtonLeft' 
                    />
                    <div 
                        className='scrollbarXButtonRight' 
                        onMouseDown={() => this.onMouseDownInterval(this.scrollRight)}
                        onMouseOut={this.clearMouseDownInteLeft}
                        onMouseUp={this.clearMouseDownInterval}
                        ref='scrollbarXButtonRight' 
                    />
                    <div className='scrollbarXTrack' ref='scrollbarXTrack'>
                        <div className='scrollbarXThumb' ref='scrollbarXThumb' />
                    </div>
                </div>
                <div className='scrollbarY' ref='scrollbarY'>
                    <div 
                        className='scrollbarYButtonUp' 
                        onMouseDown={() => this.onMouseDownInterval(this.scrollUp)}
                        onMouseOut={this.clearMouseDownInteLeft}
                        onMouseUp={this.clearMouseDownInterval}
                        ref='scrollbarYButtonUp' 
                    />
                    <div 
                        className='scrollbarYButtonDown' 
                        onMouseDown={() => this.onMouseDownInterval(this.scrollDown)}
                        onMouseOut={this.clearMouseDownInteLeft}
                        onMouseUp={this.clearMouseDownInterval}
                        ref='scrollbarYButtonDown' 
                    />
                    <div className='scrollbarYTrack' ref='scrollbarYTrack'>
                        <div className='scrollbarYThumb' ref='scrollbarYThumb' />
                    </div>
                </div>
            </div>
        )
    }

    clearMouseDownInterval () {
        if (this._mouseDownInterval) {
            clearInterval(this._mouseDownInterval)
            this._mouseDownInterval = undefined
        }
    }

    drawWaffle () {

        const { content } = this.props
        const { columns } = content

        const renderColumnHeader = (idx, offset) => {

            this._ctx.beginPath()

            this._ctx.lineWidth = 1
            this._ctx.strokeStyle = '#e0e0e0'

            this._ctx.rect((CELL_WIDTH * idx) + ROW_NUMBER_WIDTH, 0, CELL_WIDTH, COLUMN_HEADER_HEIGHT)

            this._ctx.fillStyle = '#f6f6f6'
            this._ctx.fill()

            this._ctx.font = '12pt Arial'
            this._ctx.fillStyle = '#212121'
            this._ctx.textAlign = 'center'

            this._ctx.fillText(columns[offset].label, (CELL_WIDTH * idx) + (CELL_WIDTH / 2) + ROW_NUMBER_WIDTH, 28)

            this._ctx.stroke()

        }
        const renderRowNumber = (idx, offset, limit) => {

            this._ctx.beginPath()

            this._ctx.lineWidth = 1
            this._ctx.strokeStyle = '#e0e0e0'

            this._ctx.rect(0, (CELL_HEIGHT * idx) + COLUMN_HEADER_HEIGHT, ROW_NUMBER_WIDTH, CELL_HEIGHT)

            this._ctx.fillStyle = '#f6f6f6'
            this._ctx.fill()

            this._ctx.font = '12pt Arial'
            this._ctx.fillStyle = '#212121'
            this._ctx.textAlign = 'center'

            this._ctx.fillText(offset + 1, ROW_NUMBER_WIDTH / 2, (CELL_HEIGHT * idx) + (CELL_HEIGHT / 2) + COLUMN_HEADER_HEIGHT + 6)

            this._ctx.stroke()
        }

        // Clear canvas 
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)

        // Determine how many cols/rows our viewport can render 
        const rowCount = content.rows.length

        // Draw cornerstone
        this._ctx.beginPath()
        this._ctx.lineWidth = 1
        this._ctx.strokeStyle = '#e0e0e0'
        this._ctx.rect(0, 0, ROW_NUMBER_WIDTH, COLUMN_HEADER_HEIGHT)
        this._ctx.fillStyle = '#f6f6f6'
        this._ctx.fill()
        this._ctx.stroke()

        // Draw cells
        let i = 0
        const len = rowCount
        const data = []

        for (; i < len; i += 1) {
    
            // Draw row number
            if (i + this._waffleOrigin.y < rowCount) {
                renderRowNumber(i, i + this._waffleOrigin.y)
            }

            let j = 0
            const jen = columns.length
            const cells = []

            for (; j < jen; j += 1) {

                if (typeof content.rows[i + this._waffleOrigin.y] !== 'undefined' && 
                    typeof content.rows[i + this._waffleOrigin.y][j + this._waffleOrigin.x] !== 'undefined') {

                    // Draw column header
                    if (i === 0) {
                        renderColumnHeader(j, j + this._waffleOrigin.x)
                    }
                    
                    let idx = content.rows[i + this._waffleOrigin.y][j + this._waffleOrigin.x]
                    let x = j * CELL_WIDTH + ROW_NUMBER_WIDTH
                    let y = i * CELL_HEIGHT + COLUMN_HEADER_HEIGHT

                    cells.push({
                        coords: { x, y },
                        idx
                    })

                    this._ctx.beginPath()
                    this._ctx.strokeStyle = '#e0e0e0'

                    this._ctx.rect(x, y, CELL_WIDTH, CELL_HEIGHT)
                    this._ctx.fillStyle = 'white'
                    this._ctx.fill()

                    this._ctx.fillStyle = 'black'
                    this._ctx.font = '12pt Arial'
                    this._ctx.fillStyle = '#212121'
                    this._ctx.textAlign = 'left'
                    this._ctx.fillText(idx, x + 10, y + 20)

                    this._ctx.stroke()
                }
            }

            data.push(cells)
        }
    }

    getMousePos (e) {

        const rect = this._canvas.getBoundingClientRect()

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    highlightCell ({ height, originX, originY, width, x, y }, callback = null) {

        // Cache highlight
        this._highlight = { 
            height,
            originX,
            originY,
            width,
            x, // RENAME TO relativeX
            y  // RENAME TO relativeY
        }

        // Highlight cell
        this._ctx.beginPath()
        this._ctx.rect(x, y, width, height)
        this._ctx.strokeStyle = '#3896ff'
        this._ctx.lineWidth = 2
        this._ctx.stroke()

        if (callback && typeof callback === 'function') {
            callback
        }
    }

    onClickCanvas (e) {

        const { content } = this.props
        const columns = content.rows[0].length
        const rows = content.rows.length

        e.stopPropagation()

        // Stash input when visible
        this.stashInput()

        let mousePos = this.getMousePos(e)

        const relativeX = (Math.floor((mousePos.x - ROW_NUMBER_WIDTH) / CELL_WIDTH) * CELL_WIDTH) + ROW_NUMBER_WIDTH
        const relativeY = (Math.floor((mousePos.y - COLUMN_HEADER_HEIGHT) / CELL_HEIGHT) * CELL_HEIGHT) + COLUMN_HEADER_HEIGHT

        const cell = {
            x: relativeX,
            y: relativeY,
            originX: relativeX + (this._waffleOrigin.x * CELL_WIDTH),
            originY: relativeY + (this._waffleOrigin.y * CELL_HEIGHT),
            width: CELL_WIDTH, // TODO :: MAKE WIDTH/HEIGHT DYN TO SUPPORT VARIALBE ROW/COL WIDTH/HEIGHT
            height: CELL_HEIGHT // TODO :: MAKE WIDTH/HEIGHT DYN TO SUPPORT VARIALBE ROW/COL WIDTH/HEIGHT
        }

        // Reset view
        this.drawWaffle()

        // Stop OOB clicks
        if ((cell.y - COLUMN_HEADER_HEIGHT) < 0 
            || (cell.x - ROW_NUMBER_WIDTH) < 0
            || cell.originX >= (columns * CELL_WIDTH + ROW_NUMBER_WIDTH)
            || cell.originY >= (rows * CELL_HEIGHT + COLUMN_HEADER_HEIGHT)) {
            return
        }

        this.highlightCell(cell) 
    }

    onKeyDownWindow (e) {
            
        const key = window.Event ? e.which : e.keyCode

        switch (key) {

        case 8: { // backspace
            //e.preventDefault()
            //onSetCellValue(selectedRow, selectedCol, '', false)
            return
        }

        case 13: { // return

            if (this._focus !== undefined) {

                e.preventDefault()

                // Stash input when visible
                this.stashInput()

                // Reset view
                this.drawWaffle()
            }     
            return
        }

        case 27: { // esc

            if (this._focus !== undefined) {

                e.preventDefault()

                // Stash input when visible
                this.stashInput()

                // Reset view
                this.drawWaffle()
            }           
            return
        }

        case 37: { // left

            if (this._highlight === undefined) {
                return
            }

            const isXScrollable = this._highlight.originX - CELL_WIDTH - ROW_NUMBER_WIDTH >= 0

            if (isXScrollable) {

                e.preventDefault()

                // Stash input when visible
                this.stashInput()

                // Reset view
                this.drawWaffle()

                if (this._highlight.x - ROW_NUMBER_WIDTH > 0) {
                    this.highlightCell(Object.assign({}, this._highlight, {
                        originX: this._highlight.originX - CELL_WIDTH,
                        x: this._highlight.x - CELL_WIDTH
                    }))
                } else {
                    this.highlightCell(Object.assign({}, this._highlight, {
                        originX: this._highlight.originX - CELL_WIDTH,
                        x: this._highlight.x
                    }), this.scrollLeft())
                }
            }
            return
        }

        case 38: { // up

            if (this._highlight === undefined) {
                return
            }

            const isYScrollable = this._highlight.originY - CELL_HEIGHT - COLUMN_HEADER_HEIGHT >= 0

            if (isYScrollable) {

                e.preventDefault()

                // Stash input when visible
                this.stashInput()

                // Reset view
                this.drawWaffle()

                if (this._highlight.y - COLUMN_HEADER_HEIGHT > 0) {
                    this.highlightCell(Object.assign({}, this._highlight, {
                        originY: this._highlight.originY - CELL_HEIGHT,
                        y: this._highlight.y - CELL_HEIGHT
                    }))
                } else {
                    this.highlightCell(Object.assign({}, this._highlight, {
                        originY: this._highlight.originY - CELL_HEIGHT,
                        y: this._highlight.y
                    }), this.scrollUp())
                }
            }
            return
        }

        case 9: // tab
        case 39: { // right

            if (this._highlight === undefined) {
                return
            }

            const { content } = this.props
            const columns = content.rows[0].length
            const nextX = this._highlight.originX + this._highlight.width
            const isXScrollable = nextX < (columns * CELL_WIDTH) + ROW_NUMBER_WIDTH
        
            if (isXScrollable) {

                e.preventDefault()

                // Stash input when visible
                this.stashInput()

                // Reset view
                this.drawWaffle()

                if ((this._highlight.x + CELL_WIDTH) < window.innerWidth - SCROLL_TRACK_WIDTH - ROW_NUMBER_WIDTH) {
                    this.highlightCell(Object.assign({}, this._highlight, {
                        originX: this._highlight.originX + CELL_WIDTH,
                        x: this._highlight.x + CELL_WIDTH
                    }))
                } else {
                    this.highlightCell(Object.assign({}, this._highlight, {
                        originX: this._highlight.originX + CELL_WIDTH,
                        x: this._highlight.x
                    }), this.scrollRight())
                }
            }
            return
        }

        case 40: { // down

            if (this._highlight === undefined) {
                return
            }

            const { content } = this.props
            const nextY = this._highlight.originY + this._highlight.height
            const rows = content.rows.length
            const isYScrollable = nextY < (rows * CELL_HEIGHT) + COLUMN_HEADER_HEIGHT

            if (isYScrollable) {

                e.preventDefault()

                // Stash input when visible
                this.stashInput()

                // Reset view
                this.drawWaffle()

                if ((this._highlight.y + CELL_HEIGHT) < window.innerHeight - SCROLL_TRACK_HEIGHT - COLUMN_HEADER_HEIGHT - HEADER_HEIGHT) {
                    this.highlightCell(Object.assign({}, this._highlight, {
                        originY: this._highlight.originY + CELL_HEIGHT,
                        y: this._highlight.y + CELL_HEIGHT
                    }))
                } else {
                    this.highlightCell(Object.assign({}, this._highlight, {
                        originY: this._highlight.originY + CELL_HEIGHT,
                        y: this._highlight.y
                    }), this.scrollDown())
                }
            }

            return
        }

        default:
            return
        }
    }

    onKeyPressWindow (e) {

        // Only listen during cell highlight
        if (this._highlight !== undefined) {

            // Position input if hidden
            if (this._focus === undefined) {

                this._focus = true
    
                this._cellInput.style.display = 'block'
                this._cellInput.style.top = (this._highlight.y + 1) + 'px'
                this._cellInput.style.left = (this._highlight.x + 1) + 'px'
                this._cellInput.focus() 
            }
        }
    }

    onMouseDownInterval (fn) {
        this._mouseDownInterval = setInterval(fn, MOUSE_DOWN_INTERVAL)
    }

    onWheelCanvas (e) {

        // Get the most expected mouse direction
        const mouseMove = Math.max(Math.abs(e.deltaX), Math.abs(e.deltaY))
        const mouseDir = Math.abs(e.deltaX) === mouseMove ? 'x' : 'y'

        switch (mouseDir) {

        case 'x':
            e.deltaX > 0 ? this.scrollRight() : this.scrollLeft()
            break

        case 'y':
            e.deltaY > 0 ? this.scrollDown() : this.scrollUp()
            break

        default:
            break
        }
    }

    onPasteWindow (e) {

        // Ignore paste if no highlight
        if (this._highlight === undefined) {
            return
        }

        const { onSetCellValue } = this.props

        // Do not paste input into cell
        e.preventDefault()

        // Clipboard data in HTML to support all formating options
        const pasteData = e.clipboardData.getData('text/html')

        // Pseudo DOM element 
        const el = document.createElement('html')

        // Virtual DOM of our paste data
        el.innerHTML = pasteData

        // Extract table
        var table = el.getElementsByTagName('table')
     
        if (table.length === 0) {
            console.error('no table found :/')
            return
        }
        
        var tableRows = table[0].querySelectorAll('tr')
        
        if (tableRows.length === 0) {
            console.error('no table rows found :/')
            return
        }

        // Start row
        let rowNum = (this._highlight.originY - COLUMN_HEADER_HEIGHT) / CELL_HEIGHT

        // Iterate over table rows 
        tableRows.forEach(row => {
    
            // Start col
            let colNum = (this._highlight.originX - ROW_NUMBER_WIDTH) / CELL_WIDTH
            var cols = row.querySelectorAll('td')

            // Iterate over cols
            cols.forEach(col => {
      
                var re = /<[a-zA-Z0-9\/\s\"\-\;\=\:]+>/g

                // Strip HTML from column data
                var colData = col.innerHTML.replace(re, '')

                onSetCellValue(rowNum, colNum, colData)

                colNum += 1
            })
      
            rowNum += 1
        }) 

        // Reset view
        this.drawWaffle()
    }

    scrollDown () {

        const { content } = this.props
        const rowCount = content.rows.length
        const isYScrollable = ((rowCount * CELL_HEIGHT) - (this._waffleOrigin.y * CELL_HEIGHT)) + COLUMN_HEADER_HEIGHT > this._canvas.height

        if (isYScrollable) {

            this._waffleOrigin = Object.assign({}, this._waffleOrigin, {
                y: this._waffleOrigin.y + 1
            })

            this.updateViewport()

        } else if (this._mouseDownInterval !== undefined) {
            this.clearMouseDownInterval()
        }
    }

    scrollLeft () {

        const isXScrollable = this._waffleOrigin.x > 0

        if (isXScrollable) {

            this._waffleOrigin = Object.assign({}, this._waffleOrigin, {
                x: this._waffleOrigin.x - 1
            })

            this.updateViewport()

        } else if (this._mouseDownInterval !== undefined) {
            this.clearMouseDownInterval()
        }
    }

    scrollRight () {

        const { content } = this.props
        const colCount = content.rows[0].length
        const isXScrollable = ((colCount * CELL_WIDTH) - (this._waffleOrigin.x * CELL_WIDTH)) + ROW_NUMBER_WIDTH > this._canvas.width

        if (isXScrollable) {

            this._waffleOrigin = Object.assign({}, this._waffleOrigin, {
                x: this._waffleOrigin.x + 1
            })

            this.updateViewport()

        } else if (this._mouseDownInterval !== undefined) {
            this.clearMouseDownInterval()
        }
    }

    scrollUp () {

        const isYScrollable = this._waffleOrigin.y > 0

        if (isYScrollable) {

            this._waffleOrigin = Object.assign({}, this._waffleOrigin, {
                y: this._waffleOrigin.y - 1
            })

            this.updateViewport()

        } else if (this._mouseDownInterval !== undefined) {
            this.clearMouseDownInterval()
        }
    }

    stashInput () {

        if (this._focus !== undefined) {
            this._focus = undefined
            this._cellInput.style.display = 'none'
            this._cellInput.value = ''
        }
    }

    updateViewport () {

        // Fit waffle to viewport
        this._waffle.style.width = window.innerWidth + 'px'
        this._waffle.style.height = (window.innerHeight - HEADER_HEIGHT) + 'px'

        const maxViewportWidth = window.innerWidth - SCROLL_TRACK_WIDTH
        const maxViewportHeight = window.innerHeight - SCROLL_TRACK_HEIGHT - HEADER_HEIGHT

        const { content } = this.props
        let cellCount = 0
        content.rows.forEach(a => a.forEach(b => { cellCount += 1 } ))
        const colCount = content.rows[0].length
        const rowCount = content.rows.length
        const contentWidth = (colCount * CELL_WIDTH) + ROW_NUMBER_WIDTH
        const contentHeight = (rowCount * CELL_HEIGHT) + COLUMN_HEADER_HEIGHT

        // Width
        if (maxViewportWidth > contentWidth && this._waffleOrigin.x === 0) {

            // Hide scrollbar
            this._scrollbarXButtonLeft.style.display = 'none'
            this._scrollbarXButtonRight.style.display = 'none'
            //this._scrollbarXThumb.style.display = 'none'

            // Canvas
            this._canvas.width = contentWidth

        } else {

            // Show / set scroll bars
            this._scrollbarXButtonLeft.style.display = 'block'
            this._scrollbarXButtonRight.style.display = 'block'
            //this._scrollbarXThumb.style.display = 'block'
            this._scrollbarXTrack.style.width = (window.innerWidth - 60) + 'px' // TODO :: MAKE DYN less scrollbar button left, right, and corner

            // Canvas
            this._canvas.width = maxViewportWidth

            // Scroll bar thumb
            //this._scrollbarXThumb.style.width = 
        }

        // Height
        if (maxViewportHeight > contentHeight && this._waffleOrigin.y === 0) {

            // Hide scrollbar
            this._scrollbarYButtonDown.style.display = 'none'
            this._scrollbarYButtonUp.style.display = 'none'
            //this._scrollbarYThumb.style.display = 'none'

            // Canvas
            this._canvas.height = contentHeight

        } else {

            // Show / set scroll bars
            this._scrollbarYButtonDown.style.display = 'block'
            this._scrollbarYButtonUp.style.display = 'block'
            //this._scrollbarYThumb.style.display = 'block'
            this._scrollbarYTrack.style.height = (window.innerHeight - 125) + 'px' // TODO :: MAKE DYN less scrollbar button top, bottom, corner, header

            // Canvas
            this._canvas.height = maxViewportHeight

            // Scroll bar thumb
            //this._scrollbarYThumb.style.height = 
        }

        // Redraw canvas
        this.drawWaffle()
    }
}
