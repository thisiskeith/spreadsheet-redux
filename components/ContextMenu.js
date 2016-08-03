import React, { PropTypes } from 'react'

const ContextMenu = ({
    columnIdx,
    left,
    onSelectContextMenuOption,
    options,
    rowIdx,
    top
}) => (
    <div 
        className="contextMenu"
        style={{
            top: `${top}px`,
            left: `${left}px`,
        }}
    >
    {
        options   
        .map((option, i) => <div
            className="contextMenuOption"
            key={i}
            onClick={() => 
                onSelectContextMenuOption(option, rowIdx, columnIdx)
            }>
                {option}
            </div>
        )
    }
    </div>
)

ContextMenu.propTypes = {
    columnIdx: PropTypes.number,
    left: PropTypes.number.isRequired,
    onSelectContextMenuOption: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    rowIdx: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired
}

export default ContextMenu
