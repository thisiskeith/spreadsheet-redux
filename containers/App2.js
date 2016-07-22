import React, { Component, PropTypes } from 'react'
import Table from '../components/Table'
import { 
    addRow, 
    selectContextMenuOption,
    setCellFocus, 
    setCellValue, 
    setContextMenu 
} from '../actions'
import { connect } from 'react-redux'

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
var COL_WIDTH = 100
var ROW_HEIGHT = 30

//var COLS = 26 // 8 prev
const COLS = waffleData[0].length

//var CELLS = 13000 // 80 prev
let CELLS = 0
waffleData.forEach(a => a.forEach(b => { CELLS += 1 } ))

var ROWS = Math.ceil(CELLS / COLS)
var CONTENT_WIDTH = COLS * COL_WIDTH
var CONTENT_HEIGHT = ROWS * ROW_HEIGHT
var CANVAS_X_DELTA = CANVAS_WIDTH - CONTENT_WIDTH
var CANVAS_Y_DELTA = CANVAS_HEIGHT - CONTENT_HEIGHT
var SCROLL_BAR_X_THUMB = (CANVAS_WIDTH / CONTENT_WIDTH) * 100
var SCROLL_BAR_Y_THUMB = (CANVAS_HEIGHT / CONTENT_HEIGHT) * 100


let OFFSET = 0

class App extends Component {

    constructor (props) {

        super(props)

        this.drawWaffle = this.drawWaffle.bind(this)
    }

    componentDidMount () {

        const canvas = this.refs.canvas
        const cellInput = this.refs.cellInput

        const scrollbarXThumb = this.refs.scrollbarXThumb
        const scrollbarYThumb = this.refs.scrollbarYThumb

        const scrollbarXButtonLeft = this.refs.scrollbarXButtonLeft
        const scrollbarXButtonRight = this.refs.scrollbarXButtonRight
        const scrollbarYButtonDown = this.refs.scrollbarYButtonDown
        const scrollbarYButtonUp = this.refs.scrollbarYButtonUp

        this._ctx = canvas.getContext('2d')

        // Scroll bar thumb sizes
        scrollbarXThumb.style.width = SCROLL_BAR_X_THUMB + '%'
        scrollbarYThumb.style.height = SCROLL_BAR_Y_THUMB + '%'

        canvas.addEventListener('click', e => {

            e.stopPropagation()

            const mousePos = this.getMousePos(canvas, e)
            const cellX = Math.floor(mousePos.x / COL_WIDTH) * COL_WIDTH
            const cellY = Math.floor(mousePos.y / ROW_HEIGHT) * ROW_HEIGHT

            this.drawWaffle(canvas)

            // Highlight cell
            this._ctx.beginPath()
            this._ctx.rect(cellX, cellY, COL_WIDTH, ROW_HEIGHT)
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
            this.drawWaffle(canvas)
        }, false)

        scrollbarXButtonRight.addEventListener('click', e => {

            if (waffleOrigin.x <= Math.ceil(CANVAS_WIDTH / COL_WIDTH)) {

                waffleOrigin = Object.assign({}, waffleOrigin, {
                    x: waffleOrigin.x + 1
                })

                this.drawWaffle(canvas)
            }

        }, false)

        scrollbarXButtonLeft.addEventListener('click', e => {

            if (waffleOrigin.x > 0) {
 
                waffleOrigin = Object.assign({}, waffleOrigin, {
                    x: waffleOrigin.x - 1
                })

                this.drawWaffle(canvas)
            }

        }, false)

        scrollbarYButtonUp.addEventListener('click', e => {

            if (waffleOrigin.y > 0) {
 
                waffleOrigin = Object.assign({}, waffleOrigin, {
                    y: waffleOrigin.y - 1
                })

                this.drawWaffle(canvas)
            }

        }, false)

        scrollbarYButtonDown.addEventListener('click', e => {

            if (waffleOrigin.y <= Math.ceil(CANVAS_HEIGHT / ROW_HEIGHT)) {

                waffleOrigin = Object.assign({}, waffleOrigin, {
                    y: waffleOrigin.y + 1
                })

                this.drawWaffle(canvas)
            }

        }, false)

        this.drawWaffle(canvas)
    }

    render () {

        const { dispatch, spreadsheet } = this.props

        return (
            <div>
                <div classNameName="header row">

                </div>
                <div classNameName="body row">
                    <div className='waffle'>
                        <canvas ref='canvas' width='400' height='120' />
                        <input type='text' className='cellInput' ref='cellInput' />
                        <div className='scrollbarX'>
                            <div className='scrollbarXButtonLeft' ref='scrollbarXButtonLeft' />
                            <div className='scrollbarXButtonRight' ref='scrollbarXButtonRight' />
                            <div className='scrollbarXTrack'>
                                <div className='scrollbarXThumb' ref='scrollbarXThumb' />
                            </div>
                        </div>
                        <div className='scrollbarY'>
                            <div className='scrollbarYButtonUp' ref='scrollbarYButtonUp' />
                            <div className='scrollbarYButtonDown' ref='scrollbarYButtonDown' />
                            <div className='scrollbarYTrack'>
                                <div className='scrollbarYThumb' ref='scrollbarYThumb' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    drawWaffle (canvas) {

        // Clear canvas 
        this._ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Determine how many cols/rows our viewport can render 
        const columns = Math.ceil(canvas.width / COL_WIDTH) // 6
        const rows = Math.ceil(canvas.height / ROW_HEIGHT) // 8

        // Draw cells

        /////
        this._ctx.beginPath()
        this._ctx.strokeStyle = '#000000'
        /////

        let i = 0
        const len = rows
        const data = []

        for (; i < len; i += 1) {
            
            let j = 0
            const jen = columns
            const cells = []

            for (; j < jen; j += 1) {

                let idx = waffleData[i + waffleOrigin.y][j + waffleOrigin.x]
                let x = j * COL_WIDTH 
                let y = i * ROW_HEIGHT

                cells.push({
                    coords: {
                        x, 
                        y
                    },
                    idx
                })
           
                ///// 
                this._ctx.rect(x, y, COL_WIDTH, ROW_HEIGHT)
                this._ctx.fillStyle = "black"
                this._ctx.font = "italic 12pt Arial"
                this._ctx.fillText("cell " + idx, x + 10, y + 20)
                /////
            }

            data.push(cells)
        }

        /////
        this._ctx.stroke()
        /////

        //console.warn(JSON.stringify(data, null, 2))
    }

    getMousePos (canvas, e) {

        const rect = canvas.getBoundingClientRect()

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }
}

const mapStateToProps = (state) => {
    
    const {
        spreadsheet
    } = state

    return {
        spreadsheet
    }
}

export default connect(mapStateToProps)(App)
