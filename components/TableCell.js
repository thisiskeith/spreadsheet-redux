import React, { Component, PropTypes } from 'react'

export default class TableCell extends Component {

    constructor (props) {
        super(props)
    }

    shouldComponentUpdate (nextProps) {

        if (this.props.cell.value === nextProps.cell.value) {
            return false
        }

        return true
    }

    render () {

        const {
            cell,
            onSetCellValue
        } = this.props
    
        return (
            <div className="tableCell" style={{
                width: 120,
                height: 30,
                verticalAlign: 'middle',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderTop: 'none',
                borderLeft: 'none',
                display: 'inline-block',
                boxSizing: 'border-box',
                textAlign: 'center',
                lineHeight: '30px',
                color: '#444',
                fontSize: '0.8em'
            }}>
                <input 
                    onChange={e => onSetCellValue(
                        cell.rowIdx, cell.colIdx, e.target.value
                    )}
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
                    style={{
                        border: 'none',
                        width: '100%',
                        height: 30,
                        backgroundColor: 'transparent'
                    }}
                    type="text" 
                    value={cell.value} />
            </div>
        )
    }
}

TableCell.propTypes = {
    cell: PropTypes.object.isRequired,
    onSetCellValue: PropTypes.func.isRequired
}
