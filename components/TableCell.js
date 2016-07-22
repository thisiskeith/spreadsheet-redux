import ContextMenu from './ContextMenu'
import equal from 'deep-equal'
import React, { Component, PropTypes } from 'react'
import { CONTEXT_MENU_CELL_OPTIONS } from '../constants'

export default class TableCell extends Component {

    constructor (props) {
        super(props)
    }

    shouldComponentUpdate (nextProps) {

        if (this.props.cell.value === nextProps.cell.value &&
            equal(this.props.contextMenu, nextProps.contextMenu) &&
            this.props.editing === nextProps.editing &&
            this.props.focus === nextProps.focus &&
            this.props.error === nextProps.error) {
            return false
        }

        return true
    }

    render () {

        const {
            cell,
            contextMenu,
            editing,
            error,
            focus,
            numberOfCols,
            numberOfRows,
            onContextMenu,
            onSelectContextMenuOption,
            onSetCellFocus,
            onSetCellValue
        } = this.props

        return (
            <div 
                className="waffleCol"
                onClick={() => onSetCellFocus(cell.rowIdx, cell.colIdx)}
                style={{
                    border: focus ? '2px solid #3896ff' : '1px solid #eee',
                }}
            >
            {
                focus && editing ?
                    <input 
                        onBlur={() => onSetCellFocus()}
                        onChange={e => onSetCellValue(
                            cell.rowIdx, cell.colIdx, e.target.value
                        )}
                        onContextMenu={e => {
                            e.preventDefault()
                            onContextMenu(true, cell.rowIdx, cell.colIdx) 
                        }}
                        onKeyDown={e => {

                            const key = window.Event ? e.which : e.keyCode

                            switch (key) {

                            case 9: // tab

                                e.preventDefault()

                                // Don't propagate up to table
                                e.stopPropagation()

                                // Change focus to next cell in row if not
                                // at end
                                if (cell.colIdx + 1 < numberOfCols) {
                                    onSetCellFocus(cell.rowIdx, cell.colIdx + 1)
                                } else {
                                    onSetCellFocus()
                                }

                                return

                            case 13: // enter

                                e.preventDefault()

                                // Change focus to cell in next row if not on
                                // last row
                                if (cell.rowIdx + 1 < numberOfRows) {
                                    onSetCellFocus(cell.rowIdx + 1, cell.colIdx)
                                } else {
                                    onSetCellFocus()
                                }

                                return

                            case 27: // esc
                                e.preventDefault()
                                onSetCellValue(cell.rowIdx, cell.colIdx, '', false)
                                return
/*
                            case 37: // left
                                if (cell.colIdx - 1 >= 0) {
                                    e.preventDefault()
                                    this._input.blur()
                                    onSetCellFocus(cell.rowIdx, cell.colIdx - 1)
                                }
                                return
        
                            case 38: // up
                                if (cell.rowIdx - 1 >= 0) {
                                    e.preventDefault()
                                    this._input.blur()
                                    onSetCellFocus(cell.rowIdx - 1, cell.colIdx)
                                }
                                return
            
                            case 39: // right
                                if (cell.colIdx + 1 < numberOfCols) {
                                    e.preventDefault()
                                    this._input.blur()
                                    onSetCellFocus(cell.rowIdx, cell.colIdx + 1)
                                }
                                return
            
                            case 40: // down
                                if (cell.rowIdx + 1 < numberOfRows) {
                                    e.preventDefault()
                                    this._input.blur()
                                    onSetCellFocus(cell.rowIdx + 1, cell.colIdx)
                                }
                                return
*/
                            default:
                                return
                            }
                        }}
                        onPaste={e => {

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
                            var rowNum = cell.rowIdx

                            // Iterate over table rows 
                            tableRows.forEach(function (row) {
                        
                                // Start col
                                var colNum = cell.colIdx
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
                        }}
                        ref={input => {
                            if (input !== null && focus === true) {
                                input.focus()
                            }
                            return this._input = input
                        }}
                        style={{
                            width: '100%',
                            height: 30,
                            padding: '0 5px',
                            backgroundColor: error ? '#ffd0d0' : 'transparent',
                            boxSizing: 'border-box'
                        }}
                        type="text" 
                        value={cell.value} />
                        : cell.value
            }
            {
                contextMenu.isVisible === true 
                    && contextMenu.rowIdx === cell.rowIdx
                    && contextMenu.cellIdx === cell.colIdx ?
                    <ContextMenu 
                        cellIdx={cell.colIdx}
                        onSelectContextMenuOption={onSelectContextMenuOption}
                        options={CONTEXT_MENU_CELL_OPTIONS}
                        rowIdx={cell.rowIdx}
                    />
                    : null
            }
            </div>
        )
    }
}

TableCell.propTypes = {
    cell: PropTypes.object.isRequired,
    contextMenu: PropTypes.object.isRequired,
    focus: PropTypes.bool.isRequired,
    onContextMenu: PropTypes.func.isRequired,
    onSelectContextMenuOption: PropTypes.func.isRequired,
    onSetCellFocus: PropTypes.func.isRequired,
    onSetCellValue: PropTypes.func.isRequired
}
