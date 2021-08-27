import React from "react";
import { useDrag } from "react-dnd";
import { PieceTypes } from "./PieceTypes";
// graphics
import attacker from "./attacker.png";
import defender from "./defender.png";
import king from "./king.png";
import empty from "./empty.png";

export default function Piece(props) {
    let imgSrc, altText;
    switch(props.type) {
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

    const [{ isDragging }, drag] = useDrag(() => ({
        type: props.type,
        item: () => {
            const _x = Number(props.fromX);
            const _y = Number(props.fromY);
            props.pickUpPiece(_x, _y);
            return ({
                name: altText,
                type: props.type,
                fromX: _x,
                fromY: _y
            });
        },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (item && dropResult) {
                const [ x, y ] = dropResult.name.split("~");
                const moveData = {...item, toX: Number(x), toY: Number(y)};
                const isLegalMove = props.isLegalMove(moveData.fromX, moveData.fromY, moveData.toX, moveData.toY);
                if (isLegalMove) {
                    props.movePiece(moveData.fromX, moveData.fromY, moveData.toX, moveData.toY);
                } else {
                    props.replacePiece();
                }
                //console.log(`Moved ${item.name} from ${item.fromX},${item.fromY} to ${x},${y}`);
            }
            if (isDragging) {
                // do something to make original image hidden

            }
        },
        collect: (monitor) => {
            return ({
                isDragging: monitor.isDragging(),
                handlerId: monitor.getHandlerId()
            })
        }
    }));

    return (
        (imgSrc === empty) ? "" : 
        <img ref={drag} src={imgSrc} alt={altText} height={36} width={36} />
    )
}
