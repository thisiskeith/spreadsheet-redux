import React, { Component, PropTypes } from 'react'
import Table from '../components/Table'
import { addRow, setCellFocus, setCellValue } from '../actions'
import { connect } from 'react-redux'

class App extends Component {

    constructor (props) {

        super(props)

        this.onSetCellFocus = this.onSetCellFocus.bind(this)
        this.onSetCellValue = this.onSetCellValue.bind(this)
    }

    render () {

        const { dispatch, spreadsheetData } = this.props

        return (
            <div>
                <div className="header row">

                </div>
                <div className="body row">
                    <Table 
                        onSetCellFocus={this.onSetCellFocus}
                        onSetCellValue={this.onSetCellValue}
                        spreadsheetData={spreadsheetData} />
                </div>
            </div>
        )
    }

    onSetCellFocus (rowNum = null, colNum = null) {

        const { dispatch } = this.props

        dispatch(setCellFocus(rowNum, colNum))
    }

    onSetCellValue (rowNum, colNum, colData) {

        const { dispatch } = this.props

        dispatch(setCellValue(rowNum, colNum, colData))
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
