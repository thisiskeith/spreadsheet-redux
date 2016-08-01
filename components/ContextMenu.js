import React, { PropTypes } from 'react'

const ContextMenu = ({
    cellIdx,
    onSelectContextMenuOption,
    options,
    rowIdx
}) => (
    <div style={{
        width: 140,
        backgroundColor: 'white',
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 2,
        boxShadow: '3px 3px 5px rgba(0, 0, 0, 0.3)'
    }}>
    {
        options   
        .map((option, i) => <div
            className="contextMenuRow"
            key={i}
            onClick={() => onSelectContextMenuOption(option, rowIdx, cellIdx)}
            style={{
                height: 30,
                lineHeight: '30px',
                textIndent: 10,
                textAlign: 'left'
            }}>
                {option}
            </div>
        )
    }
    </div>
)

ContextMenu.propTypes = {
    cellIdx: PropTypes.number,
    onSelectContextMenuOption: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    rowIdx: PropTypes.number.isRequired
}

export default ContextMenu
