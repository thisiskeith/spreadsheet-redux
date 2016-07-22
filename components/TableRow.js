import React, { PropTypes } from 'react'
import TableCell from './TableCell'

const TableRow = ({
    cellFocus,
    contextMenu,
    errors,
    isCellEditing,
    numberOfCols,
    numberOfRows,
    onContextMenu,
    onSelectContextMenuOption,
    onSetCellFocus,
    onSetCellValue,
    row
}) => (
    <div className="waffleRow">
        {row.cols.map((col, i) => <TableCell 
            cell={{
                colIdx: i,
                rowIdx: row.rowIdx,
                value: col
            }}
            contextMenu={contextMenu}
            editing={isCellEditing}
            error={errors.filter(error => error[1] === i).length > 0}
            focus={
                cellFocus.length > 0 
                    && cellFocus[0] === row.rowIdx 
                    && cellFocus[1] === i
            }
            key={i} 
            numberOfCols={numberOfCols}
            numberOfRows={numberOfRows}
            onContextMenu={onContextMenu}
            onSelectContextMenuOption={onSelectContextMenuOption}
            onSetCellFocus={onSetCellFocus}
            onSetCellValue={onSetCellValue} />
        )}
    </div>
)

TableRow.propTypes = {
    cellFocus: PropTypes.array.isRequired,
    contextMenu: PropTypes.object.isRequired,
    errors: PropTypes.array.isRequired,
    isCellEditing: PropTypes.bool.isRequired,
    numberOfCols: PropTypes.number.isRequired,
    numberOfRows: PropTypes.number.isRequired,
    onContextMenu: PropTypes.func.isRequired,
    onSelectContextMenuOption: PropTypes.func.isRequired,
    onSetCellFocus: PropTypes.func.isRequired,
    onSetCellValue: PropTypes.func.isRequired,
    row: PropTypes.object.isRequired
}

export default TableRow
