import React, { PropTypes } from 'react'

const ContextMenu = ({
    onSelectContextMenuOption
}) => (
    <div style={{
        width: 140,
        backgroundColor: 'white',
        position: 'absolute',
        top: 10,
        right: -135,
        zIndex: 2,
        boxShadow: '3px 3px 5px rgba(0, 0, 0, 0.3)'
    }}>
    {
        ['Cut', 'Copy', 'Paste']
        .map((option, i) => <div
            className="contextMenuRow"
            key={i}
            onClick={() => onSelectContextMenuOption(option)}
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
    onSelectContextMenuOption: PropTypes.func.isRequired
}

export default ContextMenu
