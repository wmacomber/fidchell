import React from "react";
import { PieceTypes } from "./PieceTypes";
// graphics
import attacker from "./attacker.png";
import defender from "./defender.png";
import king from "./king.png";
import empty from "./empty.png";

export default class Piece extends React.Component {
    handleClick = () => {
        if (this.props.isPieceInHand()) {
            return false;
        }
        this.props.pickUpPiece(this.props.x, this.props.y);
    }

    render() {
        let imgSrc, altText;
        switch(this.props.type) {
            case PieceTypes.ATTACKER:
                imgSrc = attacker;
                altText = "Attacker";
                break;
            case PieceTypes.DEFENDER:
                imgSrc = defender;
                altText = "Defender";
                break;
            case PieceTypes.KING:
                imgSrc = king;
                altText = "King";
                break;
            default:
                imgSrc = empty;
                altText = "Empty";
        }

        return (
            (imgSrc === empty) ? "" : 
            <img type={this.props.type} src={imgSrc} alt={altText} height={36} width={36}
                onClick={this.handleClick}
                />
        )
    }
}
