import React, { PropTypes } from 'react'
import TableRow from './TableRow'

const Table = ({
    onSetCellValue,
    rows
}) => (
    <div className="table" style={{ display: 'table', width: '100%' }}>
        <div style={{
            display: 'table-row'
        }}>
            <div style={{ 
                display: 'table-cell', 
                width: 50,
                backgroundColor: '#efefef',
                borderBottom: '1px solid #ccc',
                textAlign: 'center',
                color: '#777',
                lineHeight: '30px',
                fontSize: '0.6em'
            }} />
            {
                ['A','B','C','D','E','F','G','H','I','J'].map(cell =>
                    <div style={{
                        display: 'table-cell',
                        height: 30,
                        border: '1px solid #ccc',
                        borderTop: 'none',
                        borderRight: 'none',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        backgroundColor: '#efefef',
                        lineHeight: '30px',
                        textAlign: 'center',
                        color: '#777',
                        fontSize: '0.8em'
                    }}>
                        {cell}
                    </div>
                )
            }
        </div>
        {rows.map((row, i) => <TableRow 
            key={i} 
            onSetCellValue={onSetCellValue}
            row={{
                rowIdx: i,
                cols: row
            }} />
        )}
    </div>
)

Table.propTypes = {
    onSetCellValue: PropTypes.func.isRequired,
    rows: PropTypes.array.isRequired
}

export default Table
