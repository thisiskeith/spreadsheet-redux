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
                <Table 
                    onSetCellValue={this.onSetCellValue}
                    rows={spreadsheetData} />
                <button
                    onClick={() => {
                        dispatch(addRow())
                    }}
                    style={{
                        width: 100,
                        height: 30,
                        margin: '20px auto 0',
                        border: 'none',
                        backgroundColor: 'orange',
                        display: 'block',
                        cursor: 'pointer',
                        color: 'white'
                    }}>
                    ADD ROW
                </button>
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
