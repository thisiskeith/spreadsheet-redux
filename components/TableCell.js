import React, { Component, PropTypes } from 'react'

const style = {
    td: {
        width: 200,
        height: 30,
        border: '1px solid #dadada',
        fontSize: '12px',
        padding: 0
    }
}

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
            <td
                style={Object.assign({}, style.td, {
                    backgroundColor: 'white'
                 })}
            >
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
                        padding: 0,
                        backgroundColor: 'transparent'
                    }}
                    type="text" 
                    value={cell.value} />
            </td>
        )
    }
}

TableCell.propTypes = {
    cell: PropTypes.object.isRequired,
    onSetCellValue: PropTypes.func.isRequired
}
