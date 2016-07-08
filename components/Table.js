import React, { Component, PropTypes } from 'react'
import TableRow from './TableRow'

const style = {
    spreadsheet: {
        backgroundColor: 'cyan',
        position: 'relative'
    },
    header: {
        width: 200, // Set by browser
        height: 31,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        left: 30,
        backgroundColor: '#ddd',
        zIndex: 1
    },
    table: {
        tableLayout: 'fixed',
        borderCollapse: 'collapse'
    },
    td: {
        width: 200,
        height: 30,
        border: '1px solid #dadada',
        fontSize: '12px',
        padding: 0
    },
    cornerstone: {
        width: 29,
        height: 29,
        position: 'absolute',
        top: 0,
        left: 0,
        border: '1px solid #dadada',
        borderBottom: '4px',
        backgroundColor: '#f3f3f3',
        zIndex: 2
    },
    sidebar: {
        width: 31,
        height: 200, // Set by browser
        overflow: 'hidden',
        position: 'absolute',
        top: 30,
        left: 0,
        backgroundColor: '#ddd',
        zIndex: 1
    },
    waffleHeader: {
        height: 30
    },
    waffleHeaderTd: {
        height: 29,
        backgroundColor: '#f3f3f3',
        textAlign: 'center'
    },
    waffleIron: {
        width: 200, // Set by browser
        height: 200, // Set by browser
        backgroundColor: '#efefef',
        overflow: 'auto',
        position: 'absolute',
        top: 30,
        left: 30,
        zIndex: 0
    }
}

export default class Table extends Component {

    constructor (props) {

        super(props)

        this.onWaffleScroll = this.onWaffleScroll.bind(this)
        this.resizeWaffleIron = this.resizeWaffleIron.bind(this)
    }

    componentDidMount () {
        
        const waffleIron = this.refs.waffleIron

        // Window resize listener
        window.onresize = this.resizeWaffleIron

        // Scroll listener
        waffleIron.addEventListener('scroll', this.onWaffleScroll, false)

        // Fit waffle iron to window
        this.resizeWaffleIron()
    }

    componentWillUnmount () {

        const waffleIron = this.refs.waffleIron

        waffleIron.addEventListener('scroll', this.onWaffleScroll, false)
    }

    render () {

        const {
            onSetCellValue,
            rows
        } = this.props

        return (
            <div style={style.spreadsheet}>
                <div style={style.cornerstone} />
                <div 
                    ref="header"
                    style={style.header}
                >
                    <table 
                        className="maxContent"
                        ref="waffleHeader"
                        style={Object.assign({}, style.table, style.waffleHeader)}
                    >
                        <tbody>
                            <tr>
                            {
                                ['A','B','C','D','E','F','G','H','I','J']
                                .map((cell, i) =>
                                    <td
                                        key={i}
                                        style={Object.assign({}, style.td, style.waffleHeaderTd)}
                                    >
                                        {cell}
                                    </td>
                                )
                            }
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div 
                    ref="sidebar"
                    style={style.sidebar}
                >
                    <table 
                        ref="waffleSidebar"
                        style={style.table}
                    >
                        <tbody>
                        {
                            rows
                            .map((row, i) =>
                                <tr key={i}>
                                    <td style={Object.assign({}, style.td, { 
                                        backgroundColor: '#efefef',
                                        textAlign: 'center' 
                                    })}>
                                        {i + 1}
                                    </td>
                                </tr>
                            )
                        }
                        </tbody>
                    </table>
                </div>
                <div 
                    className="waffle-iron" 
                    ref="waffleIron"
                    style={style.waffleIron}>
                    <table 
                        className="maxContent"
                        style={style.table}>
                        <tbody>
                        {
                            rows
                            .map((row, i) => <TableRow 
                                key={i} 
                                onSetCellValue={onSetCellValue}
                                row={{
                                    rowIdx: i,
                                    cols: row
                                }} />
                            )
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    resizeWaffleIron () {

        const header = this.refs.header
        const sidebar = this.refs.sidebar
        const waffleIron = this.refs.waffleIron
        const waffleWidth = `${window.innerWidth - 30}px`
        const waffleHeight = `${window.innerHeight - 90}px`
        
        // Size to window
        header.style.width = waffleWidth
        sidebar.style.height = waffleHeight
        waffleIron.style.width = waffleWidth
        waffleIron.style.height = waffleHeight
    }

    onSetCellValue (rowNum, colNum, colData) {

        const { dispatch } = this.props

        dispatch(setCellValue(rowNum, colNum, colData))
    }

    onWaffleScroll () {

        const waffleHeader = this.refs.waffleHeader
        const waffleIron = this.refs.waffleIron
        const waffleSidebar = this.refs.waffleSidebar

        waffleHeader.style.transform = 'translateX(-' + waffleIron.scrollLeft + 'px)'
        waffleSidebar.style.transform = 'translateY(-' + waffleIron.scrollTop + 'px)'
    }

}

Table.propTypes = {
    onSetCellValue: PropTypes.func.isRequired,
    rows: PropTypes.array.isRequired
}

export default Table
