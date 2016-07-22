import ContextMenu from './ContextMenu'
import React, { Component, PropTypes } from 'react'
import TableRow from './TableRow'
import { CONTEXT_MENU_ROW_OPTIONS } from '../constants'

export default class Table extends Component {

    constructor (props) {

        super(props)

        this.onArrowKeyDown = this.onArrowKeyDown.bind(this)
        this.onKeyPress = this.onKeyPress.bind(this)
        this.onWaffleScroll = this.onWaffleScroll.bind(this)
        this.resizeWaffleIron = this.resizeWaffleIron.bind(this)
    }

    componentDidMount () {
        
        const waffleIron = this.refs.waffleIron

        // Window resize listener
        window.onresize = this.resizeWaffleIron

        // Event listeners
        waffleIron.addEventListener('scroll', this.onWaffleScroll, false)
        window.addEventListener('keydown', this.onArrowKeyDown, false)
        window.addEventListener('keypress', this.onKeyPress, false)

        // Fit waffle iron to window
        this.resizeWaffleIron()
    }

    componentWillUnmount () {

        const waffleIron = this.refs.waffleIron

        waffleIron.removeEventListener('scroll', this.onWaffleScroll, false)
        window.removeEventListener('keydown', this.onArrowKeyDown, false)
        window.removeEventListener('keypress', this.onKeyPress, false)
    }

    render () {

        const {
            onContextMenu,
            onSelectContextMenuOption,
            onSetCellFocus,
            onSetCellValue,
            spreadsheetData
        } = this.props

        const { 
            isCellEditing, 
            cellFocus, 
            contextMenu, 
            errors, 
            rows 
        } = spreadsheetData

        return (
            <div className="waffleRect">
                <div 
                    className="waffleCornerStone"
                    onContextMenu={e => e.preventDefault()}
                />
                <div 
                    className="waffleHeaderRect"
                    ref="header"
                >
                    <div
                        className="waffleHeader maxContent"
                        ref="waffleHeader"
                    >
                        {
                            [
                                'A','B','C','D','E','F','G','H','I','J',
                                'K','L','M','N','O','P','Q','R','S','T',
                                'U','V','W','X','Y','Z'
                            ]
                            .map((cell, i) =>
                                <div
                                    className="waffleHeaderCol noUserSelect"
                                    key={i}
                                    onContextMenu={e => e.preventDefault()}
                                    style={{
                                        backgroundColor: (cellFocus.length > 0 && cellFocus[1] === i) ||
                                            (contextMenu.isVisible == true)
                                            ? '#ccc'
                                            : '#f3f3f3'
                                    }}
                                >
                                    {cell}
                                </div>
                            )
                        }
                    </div>
                </div>
                <div 
                    className="waffleSidebarRect"
                    ref="sidebar"
                >
                    <div
                        className="waffleSidebar"
                        ref="waffleSidebar"
                    >
                    {
                        spreadsheetData.rows
                        .map((row, i) =>
                            <div
                                className="waffleSidebarRow noUserSelect"
                                key={i}
                                onContextMenu={e => {
                                    e.preventDefault()
                                    onContextMenu(true, i) 
                                }}
                                style={{
                                    backgroundColor: (cellFocus.length > 0 && cellFocus[0] === i) ||
                                        (contextMenu.isVisible && contextMenu.rowIdx === i)
                                        ? '#ccc'
                                        : '#efefef',
                                }}
                            >
                                {i + 1}
                                {
                                    contextMenu.isVisible === true 
                                        && contextMenu.rowIdx === i 
                                        && contextMenu.cellIdx === null ?
                                        <ContextMenu 
                                            onSelectContextMenuOption={onSelectContextMenuOption}
                                            options={CONTEXT_MENU_ROW_OPTIONS}
                                            rowIdx={i}
                                        />
                                        : null
                                }
                            </div>
                        )
                    }
                    </div>
                </div>
                <div 
                    className="waffleIron" 
                    ref="waffleIron"
                >
                    <div className="waffle maxContent">
                        {
                            rows
                            .map((row, i) => <TableRow 
                                isCellEditing={isCellEditing}
                                cellFocus={cellFocus}
                                contextMenu={contextMenu}
                                errors={errors.filter(error => error[0] === i)}
                                key={i} 
                                numberOfCols={rows[0].length}
                                numberOfRows={rows.length}
                                onContextMenu={onContextMenu}
                                onSelectContextMenuOption={onSelectContextMenuOption}
                                onSetCellFocus={onSetCellFocus}
                                onSetCellValue={onSetCellValue}
                                row={{
                                    rowIdx: i,
                                    cols: row
                                }} />
                            )
                        }
                    </div>
                </div>


            </div>
        )
    }

    resizeWaffleIron () {

        const header = this.refs.header
        const sidebar = this.refs.sidebar
        const waffleIron = this.refs.waffleIron
        const waffleWidth = `${window.innerWidth - 40}px`
        const waffleHeight = `${window.innerHeight - 90}px`
        
        // Size to window
        header.style.width = waffleWidth
        sidebar.style.height = waffleHeight
        waffleIron.style.width = waffleWidth
        waffleIron.style.height = waffleHeight
    }

    onArrowKeyDown (e) {

        const { onSetCellFocus, onSetCellValue, spreadsheetData } = this.props
        const { isCellEditing, cellFocus, rows } = spreadsheetData
        const key = window.Event ? e.which : e.keyCode
        const numberOfCols = rows[0].length
        const numberOfRows = rows.length
        
        // Take no action when not focused on a cell
        if (cellFocus.length === 0 || isCellEditing === true) {
            return
        }

        const selectedCol = cellFocus[1]
        const selectedRow = cellFocus[0]

        switch (key) {

        case 8: // backspace
            e.preventDefault()
            onSetCellValue(selectedRow, selectedCol, '', false)
            return

        case 37: // left
            if (cellFocus[1] - 1 >= 0) {
                e.preventDefault()
                onSetCellFocus(selectedRow, selectedCol - 1)
            }
            return

        case 38: // up
            if (cellFocus[0] - 1 >= 0) {
                e.preventDefault()
                onSetCellFocus(selectedRow - 1, selectedCol)
            }
            return

        case 9: // tab
        case 39: // right
            if (cellFocus[1] + 1 < numberOfCols) {
                e.preventDefault()
                onSetCellFocus(selectedRow, selectedCol + 1)
            }
            return

        case 40: // down
            if (cellFocus[0] + 1 < numberOfRows) {
                e.preventDefault()
                onSetCellFocus(selectedRow + 1, selectedCol)
            }
            return

        default:
            return
        }
    }

    onKeyPress (e) {

        const { onSetCellValue, spreadsheetData } = this.props
        const { isCellEditing, cellFocus } = spreadsheetData
        let { key } = e
        const keyCode = window.Event ? e.which : e.keyCode

        // Take no action when not focused on a cell and not editing
        if (cellFocus.length === 0 || isCellEditing === true) {
            return
        }

        // Prevent event being triggered again by input
        e.preventDefault()

        const selectedCol = cellFocus[1]
        const selectedRow = cellFocus[0]

        // Prevent 'enter' from being inserted
        key = keyCode === 13 ? '' : key

        // TODO :: IF ENTER KEY && CELL HAS TEXT, RETAIN CELL TEXT

        // Set cell editing and hand off key entered
        onSetCellValue(selectedRow, selectedCol, key)
    }

    onWaffleScroll () {

        const waffleHeader = this.refs.waffleHeader
        const waffleIron = this.refs.waffleIron
        const waffleSidebar = this.refs.waffleSidebar

        waffleHeader.style.transform = `translateX(-${waffleIron.scrollLeft}px)`
        waffleSidebar.style.transform = `translateY(-${waffleIron.scrollTop}px)`
    }
}

Table.propTypes = {
    onContextMenu: PropTypes.func.isRequired,
    onSelectContextMenuOption: PropTypes.func.isRequired,
    onSetCellFocus: PropTypes.func.isRequired,
    onSetCellValue: PropTypes.func.isRequired,
    spreadsheetData: PropTypes.object.isRequired
}

export default Table
