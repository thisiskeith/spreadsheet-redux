import React, { Component } from 'react'

// TODO :: WORK ON SCROLL X LIMIT
// TODO :: FIX SCROLL BARS HIDING WHEN CONTENT IS SCROLLED AND VIEWPORT > CANVAS

const waffleData = [
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
    ['j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r'],
    ['s', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A'],
    ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
    ['T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1'],
    ['2', '3', '4', '4', '5', '6', '7', '8', '9'],
    ['!', '@', '#', '$', '%', '^', '&', '*', '('],
    [')', '-', '=', '_', '+', '`', '~', '[', ']']
]
let waffleOrigin = { x: 0, y: 0 }

var CANVAS_WIDTH = 400
var CANVAS_HEIGHT = 120
var CELL_WIDTH = 100
var CELL_HEIGHT = 30

const COLS = waffleData[0].length

let CELLS = 0
waffleData.forEach(a => a.forEach(b => { CELLS += 1 } ))

var ROWS = Math.ceil(CELLS / COLS)
var CONTENT_WIDTH = COLS * CELL_WIDTH
var CONTENT_HEIGHT = ROWS * CELL_HEIGHT
var CANVAS_X_DELTA = CANVAS_WIDTH - CONTENT_WIDTH
var CANVAS_Y_DELTA = CANVAS_HEIGHT - CONTENT_HEIGHT
var SCROLL_BAR_X_THUMB = (CANVAS_WIDTH / CONTENT_WIDTH) * 100
var SCROLL_BAR_Y_THUMB = (CANVAS_HEIGHT / CONTENT_HEIGHT) * 100


export default class Waffle extends Component {

    constructor (props) {

        super(props) 

        this.drawWaffle = this.drawWaffle.bind(this)
        this.updateViewport = this.updateViewport.bind(this)
    }

    componentDidMount () {

        this._canvas = this.refs.canvas
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

        // Canvas context
        this._ctx = this._canvas.getContext('2d')

        const cellInput = this.refs.cellInput
        this._canvas.addEventListener('click', e => {

            e.stopPropagation()

            const mousePos = this.getMousePos(e)
            const cellX = Math.floor(mousePos.x / CELL_WIDTH) * CELL_WIDTH
            const cellY = Math.floor(mousePos.y / CELL_HEIGHT) * CELL_HEIGHT

            this.drawWaffle(this._canvas)

            // Highlight cell
            this._ctx.beginPath()
            this._ctx.rect(cellX, cellY, CELL_WIDTH, CELL_HEIGHT)
            this._ctx.strokeStyle = '#3896ff'
            this._ctx.lineWidth = 2
            this._ctx.stroke()

            // Position input
            cellInput.value = '' // HACK FOR DEMO
            cellInput.style.display = 'block'
            cellInput.style.top = (cellY + 1) + 'px'
            cellInput.style.left = (cellX + 1) + 'px'
            cellInput.focus()

        }, false)

        window.addEventListener('click', e => {
            cellInput.style.display = 'none'
            this.drawWaffle()
        }, false)

        window.addEventListener('resize', e => this.updateViewport())

        this._scrollbarXButtonRight.addEventListener('click', e => {

            const isXScrollable = ((COLS * CELL_WIDTH) - (waffleOrigin.x * CELL_WIDTH)) > this._canvas.width

            if (isXScrollable) {

                waffleOrigin = Object.assign({}, waffleOrigin, {
                    x: waffleOrigin.x + 1
                })

                this.updateViewport()
            }

        }, false)

        this._scrollbarXButtonLeft.addEventListener('click', e => {

            if (waffleOrigin.x > 0) {
 
                waffleOrigin = Object.assign({}, waffleOrigin, {
                    x: waffleOrigin.x - 1
                })

                this.updateViewport()
            }

        }, false)

        this._scrollbarYButtonUp.addEventListener('click', e => {

            if (waffleOrigin.y > 0) {
 
                waffleOrigin = Object.assign({}, waffleOrigin, {
                    y: waffleOrigin.y - 1
                })

                this.updateViewport()
            }

        }, false)

        this._scrollbarYButtonDown.addEventListener('click', e => {

            const isYScrollable = ((ROWS * CELL_HEIGHT) - (waffleOrigin.y * CELL_HEIGHT)) > this._canvas.height

            if (isYScrollable) {

                waffleOrigin = Object.assign({}, waffleOrigin, {
                    y: waffleOrigin.y + 1
                })

                this.updateViewport()
            }

        }, false)

        // Fit content to viewport
        this.updateViewport()
    }

    render () {
        return (
            <div className='waffle' ref='waffle'>
                <canvas ref='canvas' width='400' height='120' />
                <input type='text' className='cellInput' ref='cellInput' />
                <div className='scrollbarX' ref='scrollbarX'>
                    <div className='scrollbarXButtonLeft' ref='scrollbarXButtonLeft' />
                    <div className='scrollbarXButtonRight' ref='scrollbarXButtonRight' />
                    <div className='scrollbarXTrack' ref='scrollbarXTrack'>
                        <div className='scrollbarXThumb' ref='scrollbarXThumb' />
                    </div>
                </div>
                <div className='scrollbarY' ref='scrollbarY'>
                    <div className='scrollbarYButtonUp' ref='scrollbarYButtonUp' />
                    <div className='scrollbarYButtonDown' ref='scrollbarYButtonDown' />
                    <div className='scrollbarYTrack' ref='scrollbarYTrack'>
                        <div className='scrollbarYThumb' ref='scrollbarYThumb' />
                    </div>
                </div>
            </div>
        )
    }

    drawWaffle () {

        // Clear canvas 
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)

        // Determine how many cols/rows our viewport can render 
        const columns = COLS 
        const rows = ROWS 

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

                if (waffleData[i + waffleOrigin.y] && waffleData[i + waffleOrigin.y][j + waffleOrigin.x]) {

                    let idx = waffleData[i + waffleOrigin.y][j + waffleOrigin.x]
                    let x = j * CELL_WIDTH 
                    let y = i * CELL_HEIGHT

                    cells.push({
                        coords: { x, y },
                        idx
                    })
               
                    this._ctx.rect(x, y, CELL_WIDTH, CELL_HEIGHT)
                    this._ctx.fillStyle = "black"
                    this._ctx.font = "italic 12pt Arial"
                    this._ctx.fillText("cell " + idx, x + 10, y + 20)
                }
            }

            data.push(cells)
        }

        this._ctx.stroke()
    }

    updateViewport () {

        // Fit waffle to viewport
        this._waffle.style.width = window.innerWidth + 'px'
        this._waffle.style.height = (window.innerHeight - 60) + 'px'

        const maxViewportWidth = window.innerWidth - 20
        const maxViewportHeight = window.innerHeight - 80

        // Width
        if (maxViewportWidth > CONTENT_WIDTH && waffleOrigin.x === 0) {

            // Hide scrollbar
            this._scrollbarXButtonLeft.style.display = 'none'
            this._scrollbarXButtonRight.style.display = 'none'
            this._scrollbarXThumb.style.display = 'none'

            // Canvas
            this._canvas.width = CONTENT_WIDTH

        } else {

            // Show / set scroll bars
            this._scrollbarXButtonLeft.style.display = 'block'
            this._scrollbarXButtonRight.style.display = 'block'
            this._scrollbarXThumb.style.display = 'block'
            this._scrollbarXTrack.style.width = (window.innerWidth - 60) + 'px'

            // Canvas
            this._canvas.width = maxViewportWidth

            // Scroll bar thumb
            this._scrollbarXThumb.style.width = SCROLL_BAR_X_THUMB + '%'
        }

        // Height
        if (maxViewportHeight > CONTENT_HEIGHT && waffleOrigin.y === 0) {

            // Hide scrollbar
            this._scrollbarYButtonDown.style.display = 'none'
            this._scrollbarYButtonUp.style.display = 'none'
            this._scrollbarYThumb.style.display = 'none'

            // Canvas
            this._canvas.height = CONTENT_HEIGHT

        } else {

            // Show / set scroll bars
            this._scrollbarYButtonDown.style.display = 'block'
            this._scrollbarYButtonUp.style.display = 'block'
            this._scrollbarYThumb.style.display = 'block'
            this._scrollbarYTrack.style.height = (window.innerHeight - 120) + 'px'

            // Canvas
            this._canvas.height = maxViewportHeight

            // Scroll bar thumb
            this._scrollbarYThumb.style.height = SCROLL_BAR_Y_THUMB + '%'
        }

        // Redraw canvas
        this.drawWaffle()
    }

    getMousePos (e) {

        const rect = this._canvas.getBoundingClientRect()

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }
}
