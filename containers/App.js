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
                <div className='header row' style={{
                    backgroundColor: '#ddd',
                }}>
                    <div style={{
                        width: 50,
                        height: 30,
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        border: '1px solid #ccc',
                        borderTop: 'none',
                        borderLeft: 'none',
                        boxSizing: 'border-box'
                    }} />
                    {
                        ['A','B','C','D','E','F','G','H','I','J'].map((cell, i) =>
                            <div 
                                key={i}
                                style={{
                                    width: 120,
                                    height: 30,
                                    verticalAlign: 'middle',
                                    backgroundColor: '#efefef',
                                    border: '1px solid #ccc',
                                    borderTop: 'none',
                                    borderLeft: 'none',
                                    display: 'inline-block',
                                    boxSizing: 'border-box',
                                    textAlign: 'center',
                                    lineHeight: '30px',
                                    color: '#444',
                                    fontSize: '0.8em'
                                }}
                            >
                                {cell}
                            </div>
                        )
                    }
                </div>
                <div className='body row scrollY' style={{
                    backgroundColor: '#ccc'
                 }}>
                    <Table 
                        onSetCellValue={this.onSetCellValue}
                        rows={spreadsheetData} />
                    <button
                        onClick={() => {
                            dispatch(addRow())
                        }}
                        style={{
                            width: '100%',
                            height: 30,
                            border: 'none',
                            backgroundColor: '#ccc',
                            display: 'block',
                            cursor: 'pointer',
                            color: '#444'
                        }}>
                        ADD ROW
                    </button>
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
