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

        const { dispatch, spreadsheet } = this.props

        return (
            <div>
                <div className="header row">
                    {/* Account select drop down 
                    <div style={{
                        width: 300,
                        backgroundColor: 'red',
                        zIndex: 3,
                        position: 'fixed',
                        top: 50,
                        left: 40
                    }}>
                        <div>Row 1</div>
                        <div>Row 1</div>
                        <div>Row 1</div>
                        <div>Row 1</div>
                        <div>Row 1</div>
                        <div>Row 1</div>
                        <div>Row 1</div>
                    </div>
                    */}
                </div>
                <div className="body row">
                    <Table 
                        onContextMenu={(isVisible, rowIdx = null, cellIdx = null) => 
                            dispatch(setContextMenu(isVisible, rowIdx, cellIdx))
                        }
                        onSelectContextMenuOption={(option, rowIdx, cellIdx = null) => 
                            dispatch(selectContextMenuOption(option, rowIdx, cellIdx))
                        }
                        onSetCellFocus={(rowNum = null, colNum = null) => 
                            dispatch(setCellFocus(rowNum, colNum))
                        }
                        onSetCellValue={(rowNum, colNum, colData, isEditing) => 
                            dispatch(setCellValue(rowNum, colNum, colData, isEditing))
                        }
                        spreadsheetData={spreadsheet} />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    
    const {
        spreadsheet
    } = state

    return {
        spreadsheet
    }
}

export default connect(mapStateToProps)(App)
