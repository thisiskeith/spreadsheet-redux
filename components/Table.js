import React, { PropTypes } from 'react'
import TableRow from './TableRow'

const Table = ({
    onSetCellValue,
    rows
}) => (
    <div style={{ 

    }}>
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
