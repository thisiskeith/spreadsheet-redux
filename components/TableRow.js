import React, { PropTypes } from 'react'
import TableCell from './TableCell'

const TableRow = ({
    onSetCellValue,
    row
}) => (
    <div className="tableRow" style={{
        display: 'table-row',
        height: 30
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
