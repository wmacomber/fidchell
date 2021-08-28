import React from "react";
import Piece from "./Piece";
import { PieceTypes } from "./PieceTypes";
import { useDrop } from "react-dnd";

export default function Square(props) {
    // props contains x, y, isThrone, isCorner, piece

    const key = `${props.x}~${props.y}`;
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: [ PieceTypes.ATTACKER, PieceTypes.DEFENDER, PieceTypes.KING ],
        drop: () => {
            return ({ name: key })
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    }));
    const isActive = canDrop && isOver;

    let classNames = "square";
    if (props.isThrone) {
        classNames += " throne";
    }
    if (props.isCorner) {
        classNames += " corner";
    }
    if (isActive) {
        classNames += " square-hover";
    }
    return (
        <div ref={drop} className={classNames} x={props.x} y={props.y}>
            <Piece 
                key={key}
                type={props.piece} 
                fromX={props.x} 
                fromY={props.y} 
                pickUpPiece={props.pickUpPiece}
                tryMovePiece={props.tryMovePiece}
                />
        </div>
    );
}
