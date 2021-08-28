import React from "react";

export default class Square extends React.Component {
    // props contains x, y, isThrone, isCorner, piece
    constructor(props) {
        super(props);
        this.classNames = ["square"];
        if (this.props.isThrone) {
            this.classNames.push("throne");
        }
        if (this.props.isCorner) {
            this.classNames.push("corner");
        }
        this.state = {
            hoverClass: null
        }
        this.divRef = React.createRef();
    }

    handleClick = () => {
        if (!this.props.isPieceInHand()) {
            return false;
        }
        this.props.tryMovePiece(this.props.x, this.props.y);
    }

    handleMouseEnter = (e) => {
        if (this.props.isPieceInHand()) {
            const piece = this.props.getPieceInHand();
            if (this.props.isLegalMove(piece.pieceOrigX, piece.pieceOrigY, this.props.x, this.props.y)) {
                this.divRef.current.classList.add("square-hover-ok");
            } else {
                this.divRef.current.classList.add("square-hover-bad");
            }
        }
    }

    handleMouseLeave = (e) => {
        this.divRef.current.classList.remove("square-hover-ok");
        this.divRef.current.classList.remove("square-hover-bad");
    }

    render() {
        const key = `${this.props.x}~${this.props.y}`;
        const classNames = this.classNames.join(" ");
        return (
            <div ref={this.divRef} key={key} className={classNames} x={this.props.x} y={this.props.y} 
                onClick={this.handleClick} 
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                >
                {this.props.children}
            </div>
        );
    }
}