export const ADD_ROW = 'ADD_ROW'
export const SET_CELL_FOCUS = 'SET_CELL_FOUCS'
export const SET_CELL_VALUE = 'SET_CELL_VALUE'

export const addRow = () => {
    return {
        type: ADD_ROW
    }
}

export const setCellFocus = (rowIdx, cellIdx) => {
    type: SET_CELL_FOCUS,
    rowIdx,
    cellIdx
}

export const setCellValue = (rowIdx, cellIdx, value) => {
    return {
        type: SET_CELL_VALUE,
        rowIdx,
        cellIdx,
        value
    }
}
