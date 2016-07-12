import { combineReducers } from 'redux'
import { 
    ADD_ROW,
    SELECT_CONTEXT_MENU_OPTION,
    SET_CELL_FOCUS,
    SET_CELL_VALUE,
    SET_CONTEXT_MENU
} from '../actions'

const defaultRowLen = 50
const defaultRows = new Array(defaultRowLen)
const emptyRow = ['', '', '', '', '', '', '', '', '', '']
let i = 0

while (i < defaultRowLen) {
    defaultRows[i] = emptyRow.slice()
    i += 1
}

const spreadsheetData = (state = {
    cellFocus: [],
    contextMenu: {
        isVisible: false
    },
    rows: defaultRows
}, action) => {

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

        // TODO :: Handle option selections

        return Object.assign({}, state, {
            contextMenu: {
                isVisible: false
            }
        })
    }

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
            }
        })
    }

    case SET_CELL_VALUE: {

        const { cellIdx, rowIdx, value } = action
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

        const { isVisible, rowIdx } = action

        return Object.assign({}, state, {
            contextMenu: isVisible === true ?
                Object.assign({}, state.contextMenu, {
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

const rootReducer = combineReducers({
    spreadsheetData
})

export default rootReducer
