import React, { Component, PropTypes } from 'react'
import Waffle from '../components/Waffle'
import { 
    addRow, 
    selectContextMenuOption,
    setCellFocus, 
    setCellValue, 
    setColumnWidth,
    setContextMenu 
} from '../actions'
import { connect } from 'react-redux'

class App extends Component {

    constructor (props) {
        super(props)
    }

    render () {

        const { columns, contextMenu, dispatch, rows } = this.props

        return (
            <div>
                <div className="header row">

                </div>
                <div className="body row">
                    <Waffle 
                        columns={columns}
                        contextMenu={contextMenu}
                        onSelectContextMenuOption={(option, rowIdx, columnIdx) => 
                            dispatch(selectContextMenuOption(option, rowIdx, columnIdx))
                        }
                        onSetCellValue={(rowNum, colNum, colData, isEditing) => 
                            dispatch(setCellValue(rowNum, colNum, colData, isEditing))
                        }
                        onSetColumnWidth={(colIdx, width) => 
                            dispatch(setColumnWidth(colIdx, width))
                        }
                        onSetContextMenu={(isVisible, left, top, rowIdx, columnIdx) => 
                            dispatch(setContextMenu(isVisible, left, top, rowIdx, columnIdx))
                        }
                        rows={rows}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    
    const {
        spreadsheet
    } = state

    const {
        columns,
        contextMenu,
        rows
    } = spreadsheet

    return {
        columns,
        contextMenu,
        rows
    }
}

export default connect(mapStateToProps)(App)
