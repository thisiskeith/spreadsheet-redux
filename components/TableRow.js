import React, { PropTypes } from 'react'
import TableCell from './TableCell'

const TableRow = ({
    cellFocus,
    numberOfCols,
    numberOfRows,
    onSetCellFocus,
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
            focus={
                cellFocus.length > 0 
                    && cellFocus[0] === row.rowIdx 
                    && cellFocus[1] === i
            }
            key={i} 
            numberOfCols={numberOfCols}
            numberOfRows={numberOfRows}
            onSetCellFocus={onSetCellFocus}
            onSetCellValue={onSetCellValue} />
        )}
    </tr>
)

TableRow.propTypes = {
    cellFocus: PropTypes.array.isRequired,
    numberOfCols: PropTypes.number.isRequired,
    numberOfRows: PropTypes.number.isRequired,
    onSetCellFocus: PropTypes.func.isRequired,
    onSetCellValue: PropTypes.func.isRequired,
    row: PropTypes.object.isRequired
}

export default TableRow
