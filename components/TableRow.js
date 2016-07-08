import React, { PropTypes } from 'react'
import TableCell from './TableCell'

const TableRow = ({
    onSetCellValue,
    row
}) => (
    <tr>
        {row.cols.map((col, i) => <TableCell 
            cell={{
                colIdx: i,
                rowIdx: row.rowIdx,
                value: col
            }}
            key={i} 
            onSetCellValue={onSetCellValue} />
        )}
    </tr>
)

TableRow.propTypes = {
    onSetCellValue: PropTypes.func.isRequired,
    row: PropTypes.object.isRequired
}

export default TableRow
