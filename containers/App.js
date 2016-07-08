import React, { Component, PropTypes } from 'react'
import Table from '../components/Table'
import { addRow, setCellValue } from '../actions'
import { connect } from 'react-redux'

class App extends Component {

    constructor (props) {

        super(props)

        this.onSetCellValue = this.onSetCellValue.bind(this)
    }

    render () {

        const { dispatch, spreadsheetData } = this.props

        return (
            <div>
                <div className="header row">
                    HEADER
                </div>
                <div className="body row">
                    <Table 
                        onSetCellValue={this.onSetCellValue}
                        rows={spreadsheetData.rows} />
                </div>
            </div>
        )
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
