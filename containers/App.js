import React, { Component, PropTypes } from 'react'
import Table from '../components/Table'
import { 
    addRow, 
    selectContextMenuOption,
    setCellFocus, 
    setCellValue, 
    setContextMenu 
} from '../actions'
import { connect } from 'react-redux'

class App extends Component {

    constructor (props) {
        super(props)
    }

    render () {

        const { dispatch, spreadsheetData } = this.props

        return (
            <div>
                <div className="header row">

                </div>
                <div className="body row">
                    <Table 
                        onContextMenu={(isVisible, rowNum = null) => 
                            dispatch(setContextMenu(isVisible, rowNum))
                        }
                        onSelectContextMenuOption={option => 
                            dispatch(selectContextMenuOption(option))
                        }
                        onSetCellFocus={(rowNum = null, colNum = null) => 
                            dispatch(setCellFocus(rowNum, colNum))
                        }
                        onSetCellValue={(rowNum, colNum, colData) => 
                            dispatch(setCellValue(rowNum, colNum, colData))
                        }
                        spreadsheetData={spreadsheetData} />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    
    const {
        spreadsheetData
    } = state

    return {
        spreadsheetData
    }
}

export default connect(mapStateToProps)(App)
