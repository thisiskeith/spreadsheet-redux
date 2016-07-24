
// BUG :: SCROLL
    // ONLY WORKS WHEN 25 ROW LEN, OTHERWISE ALIGNMENT OFF, CHECK ALGO
// BUG :: DOES NOT SCROLL DOWN PAST 25?
// BUG :: SCROLLS RIGHT FOREVER ?

// TODO :: SCROLL VIA HIGHLIGHT
// TODO :: HIGHLIGHT BOUNDS
// TODO :: MAKE HIGHLIGHT A FIST CLASS CONCEPT WHEN RENDERING, OPTION TO SHOW/HiDE; NEED OPTION TO CLEAR IT FROM CACHE TO NOT RENDER

// TODO :: PASTE
// TODO :: MANUAL ENTRY

// TODO :: ADD HEADERS / ROW NUMBERS

import debounce from 'debounce'
import React, { Component } from 'react'

// TODO :: UPDATE TO BE SUPPORT VARIABLE SIZES
const CELL_WIDTH = 100
const CELL_HEIGHT = 30

const MOUSE_DOWN_INTERVAL = 70

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
        this.onWheelCanvas = debounce(this.onWheelCanvas.bind(this), 10)
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
    
        // Auto scale to retinaG
        this._ctx.scale(devicePixelRatio, devicePixelRatio)

        let cellCount = 0
        content.rows.forEach(a => a.forEach(b => { cellCount += 1 } ))
        const colCount = content.rows.length
        const rowCount = Math.ceil(cellCount / colCount)

        Object.assign(this, {
            content: {
                width: colCount * CELL_WIDTH,
                height: rowCount * CELL_HEIGHT
            },
            rows: rowCount
        })

        /*
        window.addEventListener('click', e => {
            cellInput.style.display = 'none'
            this.drawWaffle()
        }, false)
        */

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
                    onWheel={e => {
                        e.persist()
                        this.onWheelCanvas(e)
                    }}
                    ref='canvas' 
                />
                <input 
                    className='cellInput' 
                    onChange={e => onSetCellValue(
                        this._highlight.y / CELL_HEIGHT, 
                        this._highlight.x / CELL_WIDTH, e.target.value
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

        // Clear canvas 
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)

        // Determine how many cols/rows our viewport can render 
        const columns = content.rows.length
        const { rows } = this

        // Draw cells
        this._ctx.beginPath()
        this._ctx.strokeStyle = '#000000'

        let i = 0
        const len = rows
        const data = []

        for (; i < len; i += 1) {

            let j = 0
            const jen = columns
            const cells = []

            for (; j < jen; j += 1) {

                if (typeof content.rows[i + this._waffleOrigin.y] !== 'undefined' && 
                    typeof content.rows[i + this._waffleOrigin.y][j + this._waffleOrigin.x] !== 'undefined') {

                    let idx = content.rows[i + this._waffleOrigin.y][j + this._waffleOrigin.x]
                    let x = j * CELL_WIDTH 
                    let y = i * CELL_HEIGHT

                    cells.push({
                        coords: { x, y },
                        idx
                    })

                    this._ctx.rect(x, y, CELL_WIDTH, CELL_HEIGHT)
                    this._ctx.fillStyle = "black"
                    this._ctx.font = "italic 12pt Arial"
                    this._ctx.fillText(idx, x + 10, y + 20)
                }
            }

            data.push(cells)
        }

        this._ctx.stroke()
    }

    getMousePos (e) {

        const rect = this._canvas.getBoundingClientRect()

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    highlightCell ({ x, y, width, height }) {

        // TODO :: INVALIDATE CACHE WHEN CANVAS REDRAWN
        // Cache highlight
        this._highlight = { x, y, width, height }

        // Highlight cell
        this._ctx.beginPath()
        this._ctx.rect(x, y, width, height)
        this._ctx.strokeStyle = '#3896ff'
        this._ctx.lineWidth = 2
        this._ctx.stroke()
    }

    onClickCanvas (e) {

        e.stopPropagation()

        // Stash input when visible
        this.stashInput()

        const mousePos = this.getMousePos(e)
        const cell = {
            index: [
                Math.floor(mousePos.x / CELL_WIDTH) + this._waffleOrigin.x,
                Math.floor(mousePos.y / CELL_HEIGHT) + this._waffleOrigin.y
            ],
            x: Math.floor(mousePos.x / CELL_WIDTH) * CELL_WIDTH,
            y: Math.floor(mousePos.y / CELL_HEIGHT) * CELL_HEIGHT,
            width: CELL_WIDTH, // TODO :: MAKE WIDTH/HEIGHT DYN TO SUPPORT VARIALBE ROW/COL WIDTH/HEIGHT
            height: CELL_HEIGHT // TODO :: MAKE WIDTH/HEIGHT DYN TO SUPPORT VARIALBE ROW/COL WIDTH/HEIGHT
        }

        // Reset view
        this.drawWaffle()

        // Highlight cell
        if (this._ctx.isPointInPath(mousePos.x, mousePos.y)) {
            this.highlightCell(cell) 
        }

        console.log(cell)
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

            const isXScrollable = this._highlight.x - CELL_WIDTH >= 0

            if (isXScrollable) {

                e.preventDefault()

                // Stash input when visible
                this.stashInput()

                // Reset view
                this.drawWaffle()

                this.highlightCell(Object.assign({}, this._highlight, {
                    x: this._highlight.x - CELL_WIDTH
                }))
            }
            return
        }

        case 38: { // up

            const isYScrollable = this._highlight.y - CELL_HEIGHT >= 0

            if (isYScrollable) {

                e.preventDefault()

                // Stash input when visible
                this.stashInput()

                // Reset view
                this.drawWaffle()

                this.highlightCell(Object.assign({}, this._highlight, {
                    y: this._highlight.y - CELL_HEIGHT
                }))
            }
            return
        }

        case 9: // tab
        case 39: { // right

            e.preventDefault()

            // Stash input when visible
            this.stashInput()

            // Reset view
            this.drawWaffle()

            this.highlightCell(Object.assign({}, this._highlight, {
                x: this._highlight.x + CELL_WIDTH
            }))

            return
        }

        case 40: { // down

            e.preventDefault()

            // Stash input when visible
            this.stashInput()

            // Reset view
            this.drawWaffle()

            this.highlightCell(Object.assign({}, this._highlight, {
                y: this._highlight.y + CELL_HEIGHT
            }))

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

        let rowNum = this._highlight.x / CELL_WIDTH
        let colNum = this._highlight.y / CELL_HEIGHT

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
        //var rowNum = cell.rowIdx

        // Iterate over table rows 
        tableRows.forEach(function (row) {
    
            // Start col
            //var colNum = cell.colIdx
            var cols = row.querySelectorAll('td')
      
            // Iterate over cols
            cols.forEach(function (col) {
      
                var re = /<[a-zA-Z0-9\/\s\"\-\;\=\:]+>/g

                // Strip HTML from column data
                var colData = col.innerHTML.replace(re, '')

                onSetCellValue(rowNum, colNum, colData)

                colNum += 1
            })
      
            rowNum += 1
        }) 

        // Reset view
//        this.drawWaffle()
    }

    scrollDown () {

        const isYScrollable = ((this.rows * CELL_HEIGHT) - (this._waffleOrigin.y * CELL_HEIGHT)) > this._canvas.height

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
        
        // Added `-1` to fix alignemnt issue
        const isXScrollable = ((content.rows.length * CELL_WIDTH) - ((this._waffleOrigin.x - 1) * CELL_WIDTH)) > this._canvas.width

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
        this._waffle.style.height = (window.innerHeight - 60) + 'px'

        const maxViewportWidth = window.innerWidth - 20
        const maxViewportHeight = window.innerHeight - 80

        // Width
        if (maxViewportWidth > this.content.width && this._waffleOrigin.x === 0) {

            // Hide scrollbar
            this._scrollbarXButtonLeft.style.display = 'none'
            this._scrollbarXButtonRight.style.display = 'none'
            //this._scrollbarXThumb.style.display = 'none'

            // Canvas
            this._canvas.width = this.content.width

        } else {

            // Show / set scroll bars
            this._scrollbarXButtonLeft.style.display = 'block'
            this._scrollbarXButtonRight.style.display = 'block'
            //this._scrollbarXThumb.style.display = 'block'
            this._scrollbarXTrack.style.width = (window.innerWidth - 60) + 'px'

            // Canvas
            this._canvas.width = maxViewportWidth

            // Scroll bar thumb
            //this._scrollbarXThumb.style.width = 
        }

        // Height
        if (maxViewportHeight > this.content.height && this._waffleOrigin.y === 0) {

            // Hide scrollbar
            this._scrollbarYButtonDown.style.display = 'none'
            this._scrollbarYButtonUp.style.display = 'none'
            //this._scrollbarYThumb.style.display = 'none'

            // Canvas
            this._canvas.height = this.content.height

        } else {

            // Show / set scroll bars
            this._scrollbarYButtonDown.style.display = 'block'
            this._scrollbarYButtonUp.style.display = 'block'
            //this._scrollbarYThumb.style.display = 'block'
            this._scrollbarYTrack.style.height = (window.innerHeight - 120) + 'px'

            // Canvas
            this._canvas.height = maxViewportHeight

            // Scroll bar thumb
            //this._scrollbarYThumb.style.height = 
        }

        // Redraw canvas
        this.drawWaffle()
    }
}
