export const ADD_ROW = 'ADD_ROW'
export const SELECT_CONTEXT_MENU_OPTION = 'SELECT_CONTEXT_MENU_OPTION'
export const SET_CELL_ERRORS = 'SET_CELL_ERRORS'
export const SET_CELL_FOCUS = 'SET_CELL_FOUCS'
export const SET_CELL_VALUE = 'SET_CELL_VALUE'
export const SET_CONTEXT_MENU = 'SET_CONTEXT_MENU'

export const addRow = () => {
    return {
        type: ADD_ROW
    }
}

export const selectContextMenuOption = (option, rowIdx, colIdx = null) => {
    return {
        type: SELECT_CONTEXT_MENU_OPTION,
        option,
        rowIdx,
        colIdx
    }
}
/*
export const setCellErrors = (???) => {
    return {
        type: SET_CELL_ERRORS,
        ???
    }
}
*/
export const setCellFocus = (rowIdx, cellIdx) => {
    return {
        type: SET_CELL_FOCUS,
        rowIdx,
        cellIdx
    }
}

export const setCellValue = (rowIdx, cellIdx, value, isCellEditing = true) => {
    return {
        type: SET_CELL_VALUE,
        rowIdx,
        cellIdx,
        value,
        isCellEditing
    }
}

export const setContextMenu = (isVisible, rowIdx, cellIdx = null) => {
    return {
        type: SET_CONTEXT_MENU,
        isVisible,
        rowIdx,
        cellIdx
    }
}
