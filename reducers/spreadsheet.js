import { 
    ADD_ROW,
    SELECT_CONTEXT_MENU_OPTION,
    SET_CELL_FOCUS,
    SET_CELL_VALUE,
    SET_CONTEXT_MENU
} from '../actions'

const defaultRowLen = 25
const defaultRows = new Array(defaultRowLen)
const emptyRow = [
    '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', ''
]
const maxRowLen = 25
let i = 0

while (i < defaultRowLen) {
    defaultRows[i] = emptyRow.slice()
    i += 1
}

export default function spreadsheet(state = {
    cellFocus: [],
    contextMenu: {
        isVisible: false
    },
    errors: [
        [12,4]
    ],
    isCellEditing: false,
    rows: defaultRows
}, action) {

    switch (action.type) {

    case ADD_ROW: {
        return Object.assign({}, state, {
            rows: [
                ...state,
                emptyRow
            ]
        })
    }

    case SELECT_CONTEXT_MENU_OPTION: {

        const contextMenu = {
            isVisible: false
        }

        switch (action.option) {

        case 'Fill down all': {

            let endDataRowIdx = 0
            let rows = state.rows.slice()

            // Set end data row index
            state.rows.forEach((row, i) =>
                row.forEach(col => {
                    if (col.trim().length > 0) {
                        endDataRowIdx = i
                    }
                })
            )

            const cellData = rows[action.rowIdx][action.colIdx].slice().trim()
            
            // Return default if no data below current row, or current selection
            // is empty
            if (endDataRowIdx === action.rowIdx || cellData === '') {
                return Object.assign({}, state, { contextMenu })
            }

            let i = action.rowIdx

            // Splice into all rows below
            for (i; i < endDataRowIdx; i += 1) {

                let nextRow = rows[i + 1].slice()
                nextRow[action.colIdx] = cellData

                rows.splice(i + 1, 1, nextRow)
            }

            return Object.assign({}, state, {
                contextMenu,
                rows
            })
        }

        case 'Fill down': {

            let rows = state.rows.slice()
            const rowsLen = rows.length
            const cellData = rows[action.rowIdx][action.colIdx].slice().trim()
       
            // Return default if current selection is empty
            if (cellData === '') {
                return Object.assign({}, state, { contextMenu })
            }

            // Add extra row, if needed
            if (action.rowIdx + 1 >= rowsLen) {
                rows.push(emptyRow.slice())
            }

            let nextRow = rows[action.rowIdx + 1].slice()
            nextRow[action.colIdx] = cellData

            rows.splice(action.rowIdx + 1, 1, nextRow)

            return Object.assign({}, state, {
                contextMenu,
                rows
            })
        }

        case 'Clear row':
             return Object.assign({}, state, {
                contextMenu,
                rows: state.rows.map((row, i) => {
                    if (i === action.rowIdx) {
                        return emptyRow 
                    }
                    return row
                })
            })

        case 'Delete row':

            let rows = state.rows.filter((row, i) => {
                if (i !== action.rowIdx) {
                    return true
                }
            })

            // Prevent less than default number of rows
            if (rows.length < defaultRowLen) {
                rows = [
                    ...rows,
                    emptyRow
                ]
            }

            return Object.assign({}, state, {
                contextMenu,
                rows
            })

        case 'Duplicate row':
            return Object.assign({}, state, {
                contextMenu,
                rows: [
                    ...state.rows.map((row, i) => {
                        if (i === action.rowIdx) {
                            state.rows.splice(i, 0, state.rows[action.rowIdx].slice())
                        }
                        return row
                    }),
                    emptyRow
                ]
            })

        case 'Insert row': {
    
            let rows = state.rows.slice()

            rows.splice(action.rowIdx + 1, 0, emptyRow)

            return Object.assign({}, state, {
                contextMenu,
                rows
            })
        }

        default:
            return Object.assign({}, state, { contextMenu })
        }
    }

    // case SET_CELL_ERRORS:

    case SET_CELL_FOCUS: {

        const cellFocus = []
        let { cellIdx, rowIdx } = action

        if (cellIdx !== null && rowIdx !== null) {
            cellFocus.push(rowIdx, cellIdx)
        }

        return Object.assign({}, state, {
            cellFocus,
            contextMenu: {
                isVisible: false
            },
            isCellEditing: false
        })
    }

    case SET_CELL_VALUE: {

        const { cellIdx, isCellEditing, rowIdx, value } = action
        const rowsLen = state.rows.length
        const rowsDelta = rowIdx - (rowsLen - 1)

        // Add additional rows
        if (rowsDelta > 0) {

            let i = 0

            for (; i < rowsDelta; i += 1) {
                state.rows.push(emptyRow.slice())
            }
        }

        return Object.assign({}, state, {
            isCellEditing,
            rows: state.rows.map((row, i) => {
                if (rowIdx === i) {
                    return row.map((cell, j) => {
                        if (cellIdx === j) {
                            return value
                        }
                        return cell
                    })
                }
                return row
            })
        })
    }

    case SET_CONTEXT_MENU: {

        const { cellIdx, isVisible, rowIdx } = action

        return Object.assign({}, state, {
            cellFocus: [],
            contextMenu: isVisible === true ?
                Object.assign({}, state.contextMenu, {
                    cellIdx,
                    isVisible,
                    rowIdx
                })
                : false
        })
    }
        
    default:
        return state
    }
}
