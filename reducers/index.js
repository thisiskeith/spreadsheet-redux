import { combineReducers } from 'redux'
import { 
    ADD_ROW,
    SET_CELL_VALUE 
} from '../actions'

const emptyRow = ['', '', '', '', '', '', '', '', '', '']

const spreadsheetData = (state = [emptyRow], action) => {

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
                state.push(emptyRow)
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
