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

        const { dispatch, spreadsheet } = this.props

        return (
            <div>
                <div className="header row">

                </div>
                <div className="body row">
                    <Waffle 
                        content={spreadsheet} 
                        onSetCellValue={(rowNum, colNum, colData, isEditing) => 
                            dispatch(setCellValue(rowNum, colNum, colData, isEditing))
                        }
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

    return {
        spreadsheet
    }
}

export default connect(mapStateToProps)(App)
