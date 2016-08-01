
// TODO :: RE-ADD RIGHT CLICK MENUS

// -- NICE TO HAVE --
// TODO :: ADD RETINA SUPPORT

import equal from 'deep-equal'
import React, { Component } from 'react'

const CELL_WIDTH = 100
const CELL_HEIGHT = 30
const COLUMN_HEADER_HEIGHT = 42
const HEADER_HEIGHT = 65
const MOUSE_DOWN_INTERVAL = 70
const ROW_NUMBER_WIDTH = 56
const SCROLL_TRACK_HEIGHT = 18
const SCROLL_TRACK_WIDTH = 18

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
        this.renderScrollBarXControlButtons = this.renderScrollBarXControlButtons.bind(this)
        this.renderScrollBarYControlButtons = this.renderScrollBarYControlButtons.bind(this)
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
        this._scrollbarXThumb = this.refs.scrollbarXThumb
        this._scrollbarXTrack = this.refs.scrollbarXTrack
        this._scrollbarY = this.refs.scrollbarY
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
   
    // TODO :: FIX DATA MODEL TO NOT NEED THIS
    componentDidUpdate (prevProps) {

        // Force update on column resize
        if (!equal(prevProps.content.columns, this.props.content.columns) ||
            !equal(prevProps.content.rows, this.props.content.rows)) {
            this.renderWaffle()
        }
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
                    {this.renderScrollBarXControlButtons('scrollBarXControlsLeft')}
                    {this.renderScrollBarXControlButtons('scrollBarXControlsRight')}
                    <div className='scrollbarXTrack' ref='scrollbarXTrack'>
                        <div className='scrollbarXThumb' ref='scrollbarXThumb' />
                    </div>
                </div>
                <div className='scrollbarY' ref='scrollbarY'>
                    {this.renderScrollBarYControlButtons('scrollBarYControlsUp')}
                    {this.renderScrollBarYControlButtons('scrollBarYControlsDown')}
                    <div className='scrollbarYTrack' ref='scrollbarYTrack'>
                        <div className='scrollbarYThumb' ref='scrollbarYThumb' />
                    </div>
                </div>
                <div className='scrollbarCorner' />
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

    getCellMetrics (rowIdx, columnIdx) {

        const { content } = this.props
        const { columns } = content
        const column = columns[columnIdx]

        const getOriginX = (columnIdx, columns) => {

            let i = 0
            let originX = 0
            const len = columnIdx

            for (; i < len; i += 1) {
                originX += columns[i].width
            }

            return originX
        }
        let originX = getOriginX(columnIdx, columns)
        let relativeX = originX
        const originY = rowIdx * CELL_HEIGHT
        const relativeY = originY - this._waffleOrigin.rowStartIdx * CELL_HEIGHT

        // Update relativeX if we are scrolled away from origin
        if (this._waffleOrigin.colStartIdx > 0) {

            let i = 0
            const len = this._waffleOrigin.colStartIdx

            for (; i < len; i += 1) {
                relativeX -= columns[i].width
            }
        }

        return {
            columnIdx,
            height: CELL_HEIGHT,
            originX,
            originY,
            relativeX,
            relativeY,
            rowIdx,
            width: column.width
        }
    }

    getFullCols (colStartIdx, colStopIdx, columns, viewportWidth) {

        let i = colStartIdx
        const len = colStopIdx
        let fullColsWidth = 0

        for (; i <= len; i += 1) {
            if (fullColsWidth + columns[i].width < viewportWidth) {
                fullColsWidth += columns[i].width
            } else {
                break
            }
        }

        return {
            fullColStopIdx: i - 1,
            fullColsWidth
        }
    }

    getFullRows (rowStartIdx, rowStopIdx, viewportHeight) {

        let i = rowStartIdx
        const len = rowStopIdx
        let fullRowsHeight = 0

        for (; i <= len; i += 1) {
            if (fullRowsHeight + CELL_HEIGHT < viewportHeight) {
                fullRowsHeight += CELL_HEIGHT
            } else {
                break
            }
        }

        return {
            fullRowStopIdx: i - 1,
            fullRowsHeight
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

    getViewportForCells () {
        return {
            width: window.innerWidth - ROW_NUMBER_WIDTH - SCROLL_TRACK_WIDTH,
            height: window.innerHeight - COLUMN_HEADER_HEIGHT - SCROLL_TRACK_HEIGHT - HEADER_HEIGHT
        }
    }

    onClickCanvas (e) {

        e.stopPropagation()

        let mousePos = this.getMousePos(e)

        // Stash input when visible
        this.stashInput()

        // Reset view
        this.renderWaffle()

        // OOB : top/left
        if (mousePos.x < ROW_NUMBER_WIDTH 
            || mousePos.y < COLUMN_HEADER_HEIGHT) {
            return
        } 

        const { content } = this.props
        const { columns, rows } = content

        // Get offset for rows/columns out of view from origin (0,0)
        let columnOffset = 0
        let i = 0
        const len = this._waffleOrigin.x

        for (; i < len; i += 1) {
            columnOffset += columns[i].width
        }

        const indexByXPos = this.getIndexByXPos(
            columns.map(c => c.width), 
            mousePos.x - ROW_NUMBER_WIDTH + columnOffset
        )
        const rowIdx = Math.floor((mousePos.y - COLUMN_HEADER_HEIGHT) / CELL_HEIGHT) + this._waffleOrigin.y
        const row = rows[rowIdx]
        const columnIdx = indexByXPos.idx
        const column = columns[columnIdx]

        // OOB : bottom/right
        if (row === undefined || column === undefined) {
            return
        }

        this.renderCellHighlight(rowIdx, columnIdx, true)
    }

    onKeyDownWindow (e) {
            
        const key = window.Event ? e.which : e.keyCode
        const { onSetCellValue } = this.props

        switch (key) {

        case 8: { // backspace

            // Take no action when cell not selected or let backspace key  
            // delete text
            if (this._highlight === undefined ||
                this._focus !== undefined) {
                return
            }

            e.preventDefault()

            const { columnIdx, rowIdx } = this._highlight 

            onSetCellValue(rowIdx, columnIdx, '', false)
            return
        }

        case 13: { // return

            // Take no action when cell not selected or focus on input
            // NOTE :: to support setting cursor at end of input some hackery
            // is required ;)
            if (this._highlight === undefined || this._focus === undefined) {
                return
            }

            // Stash input
            this.stashInput()

            const { rows } = this.props.content
            const { rowIdx, columnIdx } = this._highlight

            const nextRowIdx = rowIdx + 1

            if (nextRowIdx > rows.length - 1) {
                this.clearCellHighlight()
                return
            }

            e.preventDefault()

            this.renderCellHighlight(nextRowIdx, columnIdx, true)
            return
        }

        case 27: { // esc

            if (this._highlight === undefined) {
                return
            }

            // Stash input when visible
            this.stashInput()

            this.clearCellHighlight()
            return
        }

        case 37: { // left

            // Take no action when cell not selected or let arrow key navigate 
            // text input
            if (this._highlight === undefined ||
                this._focus !== undefined) {
                return
            }

            const { rowIdx, columnIdx } = this._highlight

            const nextColumnIdx = columnIdx - 1

            if (nextColumnIdx < 0) {
                return
            }

            e.preventDefault()

            this.renderCellHighlight(rowIdx, nextColumnIdx, true)
            return
        }


        case 38: { // up

            // Take no action when cell not selected or let arrow key navigate 
            // text input
            if (this._highlight === undefined ||
                this._focus !== undefined) {
                return
            }

            const { rowIdx, columnIdx } = this._highlight

            const nextRowIdx = rowIdx - 1

            if (nextRowIdx < 0) {
                return
            }

            e.preventDefault()

            this.renderCellHighlight(nextRowIdx, columnIdx, true)
            return
        }

        case 9: { // tab

            // Take no action when cell not selected
            if (this._highlight === undefined) {
                return
            }

            const { columns } = this.props.content
            const { rowIdx, columnIdx } = this._highlight

            const nextColumnIdx = columnIdx + 1

            if (nextColumnIdx > columns.length - 1) {
                return
            }

            e.preventDefault()

            this.renderCellHighlight(rowIdx, nextColumnIdx, true)
            return
        }

        case 39: { // right

            // Take no action when cell not selected or let arrow key navigate 
            // text input
            if (this._highlight === undefined ||
                this._focus !== undefined) {
                return
            }

            const { columns } = this.props.content
            const { rowIdx, columnIdx } = this._highlight

            const nextColumnIdx = columnIdx + 1

            if (nextColumnIdx > columns.length - 1) {
                return
            }

            e.preventDefault()

            this.renderCellHighlight(rowIdx, nextColumnIdx, true)
            return
        }

        case 40: { // down

            // Take no action when cell not selected or let arrow key navigate 
            // text input
            if (this._highlight === undefined ||
                this._focus !== undefined) {
                return
            }

            const { rows } = this.props.content
            const { rowIdx, columnIdx } = this._highlight

            const nextRowIdx = rowIdx + 1

            if (nextRowIdx > rows.length - 1) {
                return
            }

            e.preventDefault()

            this.renderCellHighlight(nextRowIdx, columnIdx, true)
            return
        }

        default:
            break
        }
    }

    onKeyPressWindow (e) {

        // Only listen during cell highlight
        if (this._highlight !== undefined && this._focus === undefined) {

            const cell = this.getCellMetrics(
                this._highlight.rowIdx, 
                this._highlight.columnIdx
            )

            this._focus = true

            this._cellInput.style.display = 'block'
            this._cellInput.style.top = (cell.relativeY + COLUMN_HEADER_HEIGHT + 1) + 'px'
            this._cellInput.style.left = (cell.relativeX + ROW_NUMBER_WIDTH + 1) + 'px'
            this._cellInput.style.width = (cell.width - 3) + 'px'
            this._cellInput.focus() 
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

        // Get the most expected mouse direction assuming user may have a 
        // bi-directional scrolling mouse
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
        const pasteDataHTML = e.clipboardData.getData('text/html')

        // Pseudo DOM element 
        const el = document.createElement('html')

        // Virtual DOM of our paste data
        el.innerHTML = pasteDataHTML

        // Extract table
        var table = el.getElementsByTagName('table')
     
        if (table.length === 0) {

            // Fall back to plain text paste
            const pasteDataText = e.clipboardData.getData('text')
            const { columnIdx, rowIdx } = this._highlight

            onSetCellValue(rowIdx, columnIdx, pasteDataText)

        } else {

            // Parse HTML paste
            var tableRows = table[0].querySelectorAll('tr')
            
            if (tableRows.length === 0) {
                console.error('no table rows found :/')
                return
            }

            let { rowIdx } = this._highlight

            // Iterate over table rows 
            tableRows.forEach(row => {
        
                let { columnIdx } = this._highlight
                var cols = row.querySelectorAll('td')

                // Iterate over cols
                cols.forEach(col => {
          
                    var re = /<[a-zA-Z0-9\/\s\"\-\;\=\:]+>/g

                    // Strip HTML from column data
                    var colData = col.innerHTML.replace(re, '')

                    onSetCellValue(rowIdx, columnIdx, colData)

                    columnIdx += 1
                })
          
                rowIdx += 1
            }) 
        }

        // Reset view
        this.renderWaffle()
    }

    renderCell (label, x, y, width, height) {

        this._ctx.beginPath()

        this._ctx.lineWidth = 1
        this._ctx.strokeStyle = '#e0e0e0'
        this._ctx.rect(x - 0.5, y - 0.5, width, height)
        this._ctx.fillStyle = 'white'
        this._ctx.fill()

        this._ctx.font = '12pt Arial'
        this._ctx.fillStyle = '#212121'
        this._ctx.textAlign = 'left'

        this._ctx.fillText(label, x + 10, y + 20)

        this._ctx.stroke()
    }

    renderCellHighlight (rowIdx, columnIdx, scrollIntoView = false) {

        if (this._highlight !== undefined) {
            this.clearCellHighlight()
        }

        // Cache highlight
        this._highlight = { 
            columnIdx,
            rowIdx
        }

        const cell = this.getCellMetrics(rowIdx, columnIdx)

        // Do not render highlight when OOB
        if ((cell.relativeX < 0 || cell.relativeY < 0) 
            && scrollIntoView === false) {
            return
        }

        // Highlight cell
        this._ctx.beginPath()
        this._ctx.rect(
            cell.relativeX + ROW_NUMBER_WIDTH, 
            cell.relativeY + COLUMN_HEADER_HEIGHT, 
            cell.width - 1, 
            cell.height - 1
        )
        this._ctx.strokeStyle = '#3896ff'
        this._ctx.lineWidth = 2
        this._ctx.stroke()

        const { colStartIdx, rowStartIdx } = this._waffleOrigin
        const { columns, rows } = this.props.content
        const viewportForCells = this.getViewportForCells()

        // Scroll canvas to bring cell into view
        if (scrollIntoView === true) {

            // Scroll X
            if (cell.columnIdx > this._waffleOrigin.fullColStopIdx) {

                const getScrollXIntoView = () => {

                    let scrollX = 1
                    let fullCols = this.getFullCols(colStartIdx + scrollX, columns.length - 1, columns, viewportForCells.width)
                    let { fullColStopIdx } = fullCols

                    while (cell.columnIdx > fullColStopIdx) {
                        scrollX += 1
                        fullCols = this.getFullCols(colStartIdx + scrollX, columns.length - 1, columns, viewportForCells.width)
                        fullColStopIdx = fullCols.fullColStopIdx
                    }
            
                    return scrollX
                }

                this.scrollRight(getScrollXIntoView())

            } else if (cell.columnIdx < this._waffleOrigin.colStartIdx) {

                this.scrollLeft()
            }

            // Scroll Y
            if (cell.rowIdx > this._waffleOrigin.fullRowStopIdx) {
        
                const getScrollYIntoView = () => {

                    let scrollY = 1
                    let fullRows = this.getFullRows(rowStartIdx + scrollY, rows.length - 1, viewportForCells.height)
                    let { fullRowStopIdx } = fullRows

                    while (cell.rowIdx > fullRowStopIdx) {
                        scrollY += 1
                        fullRows = this.getFullRows(rowStartIdx + scrollY, rows.length - 1, viewportForCells.height)
                        fullRowStopIdx = fullRows.fullRowStopIdx
                    }

                    return scrollY
                }

                this.scrollDown(getScrollYIntoView())

            } else if (cell.rowIdx < this._waffleOrigin.rowStartIdx) {

                this.scrollUp()
            }
        }
    }

    renderColumnHeader (label, x, y, width, height) {

        this._ctx.beginPath()

        this._ctx.lineWidth = 1
        this._ctx.strokeStyle = '#e0e0e0'
        this._ctx.rect(x - 0.5, y - 0.5, width, height)
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
        this._ctx.rect(x - 0.5, y - 0.5, width, height)
        this._ctx.fillStyle = '#f6f6f6'
        this._ctx.fill()
        this._ctx.stroke()
    }

    renderRowNumber (label, x, y, width, height) {

        this._ctx.beginPath()

        this._ctx.lineWidth = 1
        this._ctx.strokeStyle = '#e0e0e0'
        this._ctx.rect(x - 0.5, y - 0.5, width, height)
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

    renderScrollBarXControlButtons (className = '') {
        return (
            <div className={className}>
                <div 
                    className='scrollBarXControlButtonLeft'
                    onMouseDown={() => this.onMouseDownInterval(this.scrollLeft)}
                    onMouseOut={this.clearMouseDownInteLeft}
                    onMouseUp={this.clearMouseDownInterval}>
                    <div className='arrowLeft' />
                </div>
                <div 
                    className='scrollBarXControlButtonRight' 
                    onMouseDown={() => this.onMouseDownInterval(this.scrollRight)}
                    onMouseOut={this.clearMouseDownInteLeft}
                    onMouseUp={this.clearMouseDownInterval}>
                    <div className='arrowRight' />
                </div>
            </div>
        )
    }

    renderScrollBarYControlButtons (className = '') {
        return (
            <div className={className}>
                <div 
                    className='scrollBarYControlButtonUp'
                    onMouseDown={() => this.onMouseDownInterval(this.scrollUp)}
                    onMouseOut={this.clearMouseDownInteLeft}
                    onMouseUp={this.clearMouseDownInterval}>
                    <div className='arrowUp' />
                </div>
                <div 
                    className='scrollBarYControlButtonDown' 
                    onMouseDown={() => this.onMouseDownInterval(this.scrollDown)}
                    onMouseOut={this.clearMouseDownInteLeft}
                    onMouseUp={this.clearMouseDownInterval}>
                    <div className='arrowDown' />
                </div>
            </div>
        )
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
        const colStartIdx = this._waffleOrigin.x
        const colStopIdx = this.renderColumnsInViewport(columns.slice(), colStartIdx, viewportForCells.width)

        // Render row numbers and get start/stop range of availsble rows
        const rowStartIdx = this._waffleOrigin.y
        const rowStopIdx = this.renderRowsInViewport(rows.slice(), rowStartIdx, viewportForCells.height)

        // Cache row/col start/stop
        Object.assign(
            this._waffleOrigin, 
            this.getFullCols(colStartIdx, colStopIdx, columns, viewportForCells.width), 
            this.getFullRows(rowStartIdx, rowStopIdx, viewportForCells.height), 
            {
                rowStartIdx,
                rowStopIdx,
                colStartIdx,
                colStopIdx
            }
        )

        let i = rowStartIdx
        const len = rowStopIdx

        let rowY = COLUMN_HEADER_HEIGHT

        for (; i <= len; i += 1) {

            // Filter out what will not be in view
            const row = rows[i].filter((a, i) => i >= colStartIdx && i <= colStopIdx)

            let cellX = ROW_NUMBER_WIDTH

            // Render cells
            row.forEach((cell, i) => {

                const cellW = columns[colStartIdx + i].width

                this.renderCell(cell, cellX, rowY, cellW, CELL_HEIGHT)

                cellX += cellW
            })

            rowY += CELL_HEIGHT
        }

        if (this._highlight !== undefined) {
            const { rowIdx, columnIdx } = this._highlight
            this.renderCellHighlight(rowIdx, columnIdx)
        }
    }

    scrollDown () {

        const { content } = this.props
        const { rows } = content

        // Get size of viewport able to render cells
        const viewportForCells = this.getViewportForCells()
        const { rowStartIdx, rowStopIdx } = this._waffleOrigin

        // Get height of all rows rendered in view
        let renderedRowsHeight = rows
            .slice()
            .filter((a, i) => i >= rowStartIdx && i <= rowStopIdx)
            .length * CELL_HEIGHT
     
        // Scroll down for partial rows or when 1+ rows to render
        if (renderedRowsHeight > viewportForCells.height || 
            rowStopIdx < rows.length - 1) {

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

    scrollRight (interval = 1) {

        const isScrollableRight = () => {

            let isScrollable = false
            const { content } = this.props
            const { columns } = content

            // Get size of viewport able to render cells
            const viewportForCells = this.getViewportForCells()
            const { colStartIdx, colStopIdx } = this._waffleOrigin

            // Get width of all columns rendered in view
            let renderedColumnsWidth = columns
                .slice()
                .filter((a, i) => i >= colStartIdx && i <= colStopIdx)
                .reduce((a, b) => a + b.width, 0)

            if (renderedColumnsWidth > viewportForCells.width || 
                colStopIdx < columns.length - 1) {
                isScrollable = true
            }

            return isScrollable
        }

        let i = 0
        const len = interval

        for (; i < len; i += 1) {

            if (isScrollableRight()) {

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
            //this._scrollbarXButtonLeft.style.display = 'none'
            //this._scrollbarXButtonRight.style.display = 'none'
            //this._scrollbarXThumb.style.display = 'none'

            // Canvas
            this._canvas.width = contentWidth

        } else {

            // Show / set scroll bars
            //this._scrollbarXButtonLeft.style.display = 'block'
            //this._scrollbarXButtonRight.style.display = 'block'
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
            //this._scrollbarYButtonDown.style.display = 'none'
            //this._scrollbarYButtonUp.style.display = 'none'
            //this._scrollbarYThumb.style.display = 'none'

            // Canvas
            this._canvas.height = contentHeight

        } else {

            // Show / set scroll bars
            //this._scrollbarYButtonDown.style.display = 'block'
            //this._scrollbarYButtonUp.style.display = 'block'
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
