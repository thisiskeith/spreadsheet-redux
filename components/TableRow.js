import React, { PropTypes } from 'react'
import TableCell from './TableCell'

const TableRow = ({
    onSetCellValue,
    row
}) => (
    <div style={{
        height: 30
    }}>
        <div style={{ 
            width: 50,
            height: 30,
            display: 'inline-block',
            verticalAlign: 'middle',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderLeft: 'none',
            boxSizing: 'border-box',
            backgroundColor: '#efefef',
            textAlign: 'center',
            lineHeight: '30px',
            fontSize: '0.8em',
            color: '#444'
        }}>
            {row.rowIdx + 1}
        </div>
        {row.cols.map((col, i) => <TableCell 
            cell={{
                colIdx: i,
                rowIdx: row.rowIdx,
                value: col
            }}
            key={i} 
            onSetCellValue={onSetCellValue} />
        )}
    </div>
)

TableRow.propTypes = {
    onSetCellValue: PropTypes.func.isRequired,
    row: PropTypes.object.isRequired
}

export default TableRow
