import { combineReducers } from 'redux'
import { 
    ADD_ROW,
    SET_CELL_VALUE 
} from '../actions'

const defaultRowLen = 50
const defaultRows = new Array(defaultRowLen)
const emptyRow = ['', '', '', '', '', '', '', '', '', '']
let i = 0

while (i < defaultRowLen) {
    defaultRows[i] = emptyRow.slice()
    i += 1
}

const spreadsheetData = (state = defaultRows, action) => {

    switch (action.type) {

    case ADD_ROW:
        return [
            ...state,
            emptyRow
        ]

    case SET_CELL_VALUE:

        const { cellIdx, rowIdx, value } = action
        const rowsLen = state.length
        const rowsDelta = rowIdx - (rowsLen - 1)

        // Add additional rows
        if (rowsDelta > 0) {

            let i = 0

            for (; i < rowsDelta; i += 1) {
                state.push(emptyRow.slice())
            }
        }

        return state.map((row, i) => {
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
        
    default:
        return state
    }
}

const rootReducer = combineReducers({
    spreadsheetData
})

export default rootReducer
