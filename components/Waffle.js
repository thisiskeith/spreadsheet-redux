
// TODO :: remove isScrollRight =/

// TODO :: FIX PASTE
// TODO :: FIX PASTE SINGLE CELL (EASY)
// TODO :: OOB CANVAS CLICKS

// BUG :: TYPE IN A CELL, USE ARROW KEY, KEEP TYPING - UPDATES WRONG CELL
// BUG :: DOES NOT RE-RENDER WAFFLE ON PASTE WHEN LAST ROW IS VISIBLE (PROB EASY)

// -- NICE TO HAVE --
// TODO :: ADD RETINA SUPPORT

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
        this.clearCellHighlight = this.clearCellHighlight.bind(this)
        this.clearMouseDownInterval = this.clearMouseDownInterval.bind(this)
        this.renderWaffle = this.renderWaffle.bind(this)
        this.isScrollableRight = this.isScrollableRight.bind(this)
        this.onClickCanvas = this.onClickCanvas.bind(this)
        this.onKeyDownWindow = this.onKeyDownWindow.bind(this)
        this.onKeyPressWindow = this.onKeyPressWindow.bind(this)
        this.onMouseDownInterval = this.onMouseDownInterval.bind(this)
        this.onMouseMoveCanvas = this.onMouseMoveCanvas.bind(this)
        this.onPasteWindow = this.onPasteWindow.bind(this)
        this.onWheelCanvas = this.onWheelCanvas.bind(this)
        this.renderCell = this.renderCell.bind(this)
        this.renderColumnHeader = this.renderColumnHeader.bind(this)
        this.renderColumnsInViewport = this.renderColumnsInViewport.bind(this)
        this.renderCornerstone = this.renderCornerstone.bind(this)
        this.renderRowNumber = this.renderRowNumber.bind(this)
        this.renderRowsInViewport = this.renderRowsInViewport.bind(this)
        this.scrollDown = this.scrollDown.bind(this)
        this.scrollLeft = this.scrollLeft.bind(this)
        this.scrollRight = this.scrollRight.bind(this)
        this.scrollUp = this.scrollUp.bind(this)
        this.stashInput = this.stashInput.bind(this)
        this.updateViewport = this.updateViewport.bind(this)
    }

    componentDidMount () {

        const { devicePixelRatio } = window

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
    
        // Auto scale to retina
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
                    onMouseMove={this.onMouseMoveCanvas}
                    onWheel={this.onWheelCanvas}
                    ref='canvas' 
                />
                <input 
                    className='cellInput' 
                    onChange={e => onSetCellValue(
                        this._highlight.rowIdx, 
                        this._highlight.columnIdx, 
                        e.target.value
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

    clearCellHighlight () {
        this._highlight = undefined
        this.renderWaffle()
    }

    clearMouseDownInterval () {
        if (this._mouseDownInterval) {
            clearInterval(this._mouseDownInterval)
            this._mouseDownInterval = undefined
        }
    }

    getViewportForCells () {
        return {
            width: window.innerWidth - ROW_NUMBER_WIDTH - SCROLL_TRACK_WIDTH,
            height: window.innerHeight - COLUMN_HEADER_HEIGHT - SCROLL_TRACK_HEIGHT - HEADER_HEIGHT
        }
    }

    getIndexByXPos (arr, xPos) {

        let sigma = 0
        let i = 0
        const len = arr.length
        let needle = {}

        for (; i < len; i += 1) {

            if (sigma + arr[i] < xPos) {
                sigma += arr[i]
            } else {
                needle = {
                    idx: i,
                    offset: sigma,
                    value: arr[i]
                }
                break
            }
        }

        return needle
    }

    getIndexByYPos (arr, yPos) {

        let sigma = 0
        let i = 0
        const len = arr.length
        let needle = {}

        for (; i < len; i += 1) {

            if (sigma + arr[i] < yPos) {
                sigma += arr[i]
            } else {
                needle = {
                    idx: i,
                    offset: sigma,
                    value: arr[i]
                }
                break
            }
        }

        return needle
    }

    getMousePos (e) {

        const rect = this._canvas.getBoundingClientRect()

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    getScrollIntoViewCount (columns, colStartIdx, offsetX, viewportWidth) {

        let count = 1
        let offCanvasX = columns[colStartIdx]
        let offCanvasXSigma = offCanvasX

        while (offsetX - offCanvasX > viewportWidth) {
            offCanvasX = columns[colStartIdx + count]
            offCanvasXSigma += offCanvasX
            count += 1
        }

        return {
            count,
            offCanvasXSigma
        }
    }

    onClickCanvas (e) {

        e.stopPropagation()

        // Stash input when visible
        this.stashInput()

        // Reset view
        this.renderWaffle()
/*
        // TODO :: NOT WORKING ON RESIZE w/ ORANGE ON RIGHT
        // Stop OOB clicks
        if ((cell.relativeY - COLUMN_HEADER_HEIGHT) < 0 
            || (cell.relativeX - ROW_NUMBER_WIDTH) < 0
            || rowIdx < 0
            || columnIdx < 0) {
            return
        }
*/
        const { content } = this.props
        const { columns, rows } = content

        let mousePos = this.getMousePos(e)

        // Get offset for rows/columns out of view from origin (0,0)
        const rowOffset = (CELL_HEIGHT * this._waffleOrigin.y) + COLUMN_HEADER_HEIGHT
        let columnOffset = 0
        let i = 0
        const len = this._waffleOrigin.x

        for (; i < len; i += 1) {
            columnOffset += columns[i].width
        }

        const indexByXPos = this.getIndexByXPos(columns.map(c => c.width), mousePos.x - ROW_NUMBER_WIDTH + columnOffset)
        const columnIdx = indexByXPos.idx

        const rowIdx = Math.floor((mousePos.y - COLUMN_HEADER_HEIGHT) / CELL_HEIGHT) + this._waffleOrigin.y
        const originX = indexByXPos.offset
        const originY = (rowIdx * CELL_HEIGHT) + COLUMN_HEADER_HEIGHT         

        const column = columns[columnIdx]
        const cell = {
            originX,
            originY, 
            relativeX: originX - columnOffset + ROW_NUMBER_WIDTH,
            relativeY: originY - rowOffset + COLUMN_HEADER_HEIGHT,
            rowIdx,
            columnIdx,
            width: column.width,
            height: CELL_HEIGHT
        }

        this.renderCellHighlight(cell) 
    }

    // UPDATE
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
                this.renderWaffle()
            }     
            return
        }

        case 27: { // esc

            if (this._focus !== undefined) {

                e.preventDefault()

                // Stash input when visible
                this.stashInput()

                // Reset view
                this.renderWaffle()
            }           
            return
        }

        case 37: { // left

            if (this._highlight === undefined) {
                return
            }

            const { content } = this.props
            const { columns } = content
            const nextColumnIdx = this._highlight.columnIdx - 1

            if (nextColumnIdx < 0) {
                return
            }

            e.preventDefault()

            const nextWidth = columns[nextColumnIdx].width

            // Stash input when visible
            this.stashInput()

            // Reset view
            this.renderWaffle()

            if (this._highlight.columnIdx - this._waffleOrigin.x > 0) {
                this.renderCellHighlight(Object.assign({}, this._highlight, {
                    columnIdx: nextColumnIdx,
                    originX: this._highlight.originX - this._highlight.width,
                    width: nextWidth,
                    relativeX: this._highlight.relativeX - nextWidth
                }))
            } else {
                this.renderCellHighlight(Object.assign({}, this._highlight, {
                    columnIdx: nextColumnIdx,
                    originX: this._highlight.originX - this._highlight.width,
                    width: nextWidth,
                    relativeX: this._highlight.relativeX
                }), this.scrollLeft())
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
                this.renderWaffle()

                if (this._highlight.relativeY - COLUMN_HEADER_HEIGHT > 0) {
                    this.renderCellHighlight(Object.assign({}, this._highlight, {
                        originY: this._highlight.originY - CELL_HEIGHT,
                        relativeY: this._highlight.relativeY - CELL_HEIGHT
                    }))
                } else {
                    this.renderCellHighlight(Object.assign({}, this._highlight, {
                        originY: this._highlight.originY - CELL_HEIGHT,
                        relativeY: this._highlight.relativeY
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
            const { columns } = content
            const nextColumnIdx = this._highlight.columnIdx + 1

            if (nextColumnIdx > columns.length - 1) {
                return
            }

            e.preventDefault()

            const columnWidths = columns.slice().map(c => c.width)
            const viewportForCells = this.getViewportForCells()
            const thisCell = columns[this._highlight.columnIdx]
            const nextCell = columns[this._highlight.columnIdx + 1]
            const thisOffsetX = this._highlight.relativeX + thisCell.width
            const nextOffsetX = this._highlight.relativeX + nextCell.width
            const nextWidth = columns[nextColumnIdx].width
            const { colIdxStart  } = this._waffleOrigin

            // Stash input when visible
            this.stashInput()

            // Reset view
            this.renderWaffle()

            // is current cell able to be rendered in viewport
            if (thisOffsetX > viewportForCells.width) {

                const scrollCount = this.getScrollIntoViewCount(
                    columnWidths,
                    colIdxStart,
                    thisOffsetX,
                    viewportForCells.width
                )

                this.renderCellHighlight(Object.assign({}, this._highlight, {
                    relativeX: this._highlight.relativeX - scrollCount.offCanvasXSigma
                }), this.scrollRight(scrollCount.count))

            // is next cell able to be rendered in viewport
            } else if (nextOffsetX  > viewportForCells.width) {

                const scrollCount = this.getScrollIntoViewCount(
                    columnWidths,
                    colIdxStart,
                    nextOffsetX,
                    viewportForCells.width
                )

                this.renderCellHighlight(Object.assign({}, this._highlight, {
                    columnIdx: nextColumnIdx,
                    originX: this._highlight.originX + nextWidth,
                    relativeX: this._highlight.relativeX + this._highlight.width - scrollCount.offCanvasXSigma,
                    width: nextWidth
                }), this.scrollRight(scrollCount.count))

            } else {

                this.renderCellHighlight(Object.assign({}, this._highlight, {
                    columnIdx: nextColumnIdx,
                    originX: this._highlight.originX + nextWidth,
                    relativeX: this._highlight.relativeX + this._highlight.width,
                    width: nextWidth
                }))
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
                this.renderWaffle()

                if ((this._highlight.relativeY + CELL_HEIGHT) < window.innerHeight - SCROLL_TRACK_HEIGHT - COLUMN_HEADER_HEIGHT - HEADER_HEIGHT) {
                    this.renderCellHighlight(Object.assign({}, this._highlight, {
                        originY: this._highlight.originY + CELL_HEIGHT,
                        relativeY: this._highlight.relativeY + CELL_HEIGHT
                    }))
                } else {
                    this.renderCellHighlight(Object.assign({}, this._highlight, {
                        originY: this._highlight.originY + CELL_HEIGHT,
                        relativeY: this._highlight.relativeY
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
                this._cellInput.style.top = (this._highlight.relativeY + 1) + 'px'
                this._cellInput.style.left = (this._highlight.relativeX + 1) + 'px'
                this._cellInput.style.width = (this._highlight.width - 2) + 'px'
                this._cellInput.focus() 
            }
        }
    }

    onMouseDownInterval (fn) {
        this._mouseDownInterval = setInterval(fn, MOUSE_DOWN_INTERVAL)
    }

    onMouseMoveCanvas (e) {
        
        /* COL RESIZE TEST
        const mousePos = this.getMousePos(e)
   
        if (mousePos.y < 45 && mousePos.x > 152 && mousePos.x < 156) {
            document.body.style.cursor = 'col-resize'
        } else {
            document.body.style.cursor = 'auto'
        }
        */
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

    // UPDATE
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
        this.renderWaffle()
    }

    renderCell (label, x, y, width, height) {

        this._ctx.beginPath()

        this._ctx.lineWidth = 1
        this._ctx.strokeStyle = '#e0e0e0'
        this._ctx.rect(x, y, width, height)
        this._ctx.fillStyle = 'white'
        this._ctx.fill()

        this._ctx.font = '12pt Arial'
        this._ctx.fillStyle = '#212121'
        this._ctx.textAlign = 'left'

        this._ctx.fillText(label, x + 10, y + 20)

        this._ctx.stroke()
    }

    renderCellHighlight ({ 
        columnIdx, 
        height, 
        originX, 
        originY, 
        relativeX, 
        relativeY,
        rowIdx,
        width
    }, callback = null) {

        if (this._highlight !== undefined) {
            this.clearCellHighlight()
        }

        // Cache highlight
        this._highlight = { 
            columnIdx,
            height,
            originX,
            originY,
            relativeX,
            relativeY,
            rowIdx,
            width
        }
console.info('highlight', JSON.stringify(this._highlight, null, 2))
        // Highlight cell
        this._ctx.beginPath()
        this._ctx.rect(relativeX, relativeY, width, height)
        this._ctx.strokeStyle = '#3896ff'
        this._ctx.lineWidth = 2
        this._ctx.stroke()

        if (callback && typeof callback === 'function') {
            callback
        }
    }

    renderColumnHeader (label, x, y, width, height) {

        this._ctx.beginPath()

        this._ctx.lineWidth = 1
        this._ctx.strokeStyle = '#e0e0e0'
        this._ctx.rect(x, y, width, height)
        this._ctx.fillStyle = '#f6f6f6'
        this._ctx.fill()

        this._ctx.font = '12pt Arial'
        this._ctx.fillStyle = '#212121'
        this._ctx.textAlign = 'center'

        this._ctx.fillText(label, x + (width / 2), 28)

        this._ctx.stroke()
    }

    renderColumnsInViewport (columns, offset, viewportWidth) {

        let columnsWidth = 0
        let i = offset
        const len = columns.length

        for (; i < len; i += 1) {
            
            if (columnsWidth > viewportWidth) {
                break
            }

            const column = columns[i]
            const { label, height, width } = column

            // Render in view
            this.renderColumnHeader(
                label,
                columnsWidth + ROW_NUMBER_WIDTH,
                0,
                width,
                height
            ) 

            columnsWidth += width
        }

        // Return last column index
        return i - 1
    }

    renderCornerstone (x, y, width, height) {

        // Draw cornerstone
        this._ctx.beginPath()
        this._ctx.lineWidth = 1
        this._ctx.strokeStyle = '#e0e0e0'
        this._ctx.rect(x, y, width, height)
        this._ctx.fillStyle = '#f6f6f6'
        this._ctx.fill()
        this._ctx.stroke()
    }

    renderRowNumber (label, x, y, width, height) {

        this._ctx.beginPath()

        this._ctx.lineWidth = 1
        this._ctx.strokeStyle = '#e0e0e0'
        this._ctx.rect(x, y, width, height)
        this._ctx.fillStyle = '#f6f6f6'
        this._ctx.fill()

        this._ctx.font = '12pt Arial'
        this._ctx.fillStyle = '#212121'
        this._ctx.textAlign = 'center'

        this._ctx.fillText(label, width / 2, y + 20)

        this._ctx.stroke()
    }

    renderRowsInViewport (rows, offset, viewportHeight) {

        let rowsHeight = 0
        let i = offset
        const len = rows.length

        for (; i < len; i += 1) {

            if (rowsHeight > viewportHeight) {
                break
            }

            const row = rows[i]

            this.renderRowNumber(
                i + 1,
                0,
                rowsHeight + COLUMN_HEADER_HEIGHT,
                ROW_NUMBER_WIDTH,
                CELL_HEIGHT
            )

            rowsHeight += CELL_HEIGHT
        }

        // Return last row index
        return i - 1
    }

    renderWaffle () {

        const { content } = this.props
        const { columns, rows } = content

        // Clear canvas 
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)

        // Draw cornerstone
        this.renderCornerstone(0, 0, ROW_NUMBER_WIDTH, COLUMN_HEADER_HEIGHT)

        // Get size of viewport able to render cells
        const viewportForCells = this.getViewportForCells()

        // Render column headers and get start/stop range of available columns
        const colIdxStart = this._waffleOrigin.x
        const colIdxStop = this.renderColumnsInViewport(columns.slice(), colIdxStart, viewportForCells.width)

        // Render row numbers and get start/stop range of availsble rows
        const rowIdxStart = this._waffleOrigin.y
        const rowIdxStop = this.renderRowsInViewport(rows.slice(), rowIdxStart, viewportForCells.height)

        // Cache row/col start/stop
        Object.assign(this._waffleOrigin, {
            rowIdxStart,
            rowIdxStop,
            colIdxStart,
            colIdxStop
        })

        let i = rowIdxStart
        const len = rowIdxStop

        let rowY = COLUMN_HEADER_HEIGHT

        for (; i <= len; i += 1) {

            // Filter out what will not be in view
            const row = rows[i].filter((a, i) => i >= colIdxStart && i <= colIdxStop)

            let cellX = ROW_NUMBER_WIDTH

            // Render cells
            row.forEach((cell, i) => {

                const cellW = columns[colIdxStart + i].width

                this.renderCell(cell, cellX, rowY, cellW, CELL_HEIGHT)

                cellX += cellW
            })

            rowY += CELL_HEIGHT
        }

        if (this._highlight !== undefined) {
            this.renderCellHighlight(this._highlight)
        }
    }

    scrollDown () {

        const { content } = this.props
        const { rows } = content

        // Get size of viewport able to render cells
        const viewportForCells = this.getViewportForCells()
        const { rowIdxStart, rowIdxStop } = this._waffleOrigin

        // Get height of all rows rendered in view
        let renderedRowsHeight = rows
            .slice()
            .filter((a, i) => i >= rowIdxStart && i <= rowIdxStop)
            .length * CELL_HEIGHT
     
        // Scroll down for partial rows or when 1+ rows to render
        if (renderedRowsHeight > viewportForCells.height || 
            rowIdxStop < rows.length - 1) {

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

    isScrollableRight () {

        let isScrollable = false
        const { content } = this.props
        const { columns } = content

        // Get size of viewport able to render cells
        const viewportForCells = this.getViewportForCells()
        const { colIdxStart, colIdxStop } = this._waffleOrigin

        // Get width of all columns rendered in view
        let renderedColumnsWidth = columns
            .slice()
            .filter((a, i) => i >= colIdxStart && i <= colIdxStop)
            .reduce((a, b) => a + b.width, 0)

        if (renderedColumnsWidth > viewportForCells.width || 
            colIdxStop < columns.length - 1) {
            isScrollable = true
        }

        return isScrollable
    }

    scrollRight (interval = 1) {

        let i = 0
        const len = interval

        for (; i < len; i += 1) {

            if (this.isScrollableRight()) {

                this._waffleOrigin = Object.assign({}, this._waffleOrigin, {
                    x: this._waffleOrigin.x + 1
                })

                this.updateViewport()

            } else if (this._mouseDownInterval !== undefined) {
                this.clearMouseDownInterval()
            }
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
        const { columns, rows } = content

        const rowCount = rows.length

        const contentWidth = columns.reduce((a, b) => a + b.width, 0) + ROW_NUMBER_WIDTH
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
        this.renderWaffle()
    }
}
