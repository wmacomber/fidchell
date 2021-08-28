import React from "react";
import Square from "./Square";
import Piece from "./Piece";
import { v4 as uuidv4 } from "uuid";

export default class Board extends React.Component {
    render() {
        let output = [];
        for (const y in this.props.squares) {
            for (const x in this.props.squares[y]) {
                const _x = Number(x);
                const _y = Number(y);
                const piece = this.props.squares[_y][_x];
                const isThrone = (_x === 3 && _y === 3);
                const isCorner = (_x === 0 && _y === 0) ||
                                 (_x === 6 && _y === 0) ||
                                 (_x === 0 && _y === 6) ||
                                 (_x === 6 && _y === 6);
                const squareKey = `${x}~${y}`;
                const pieceKey = uuidv4();
                output.push(
                    <Square key={squareKey} x={x} y={y} isThrone={isThrone} isCorner={isCorner} currentTurn={this.props.currentTurn}
                        getPieceInHand={this.props.getPieceInHand}
                        isLegalMove={this.props.isLegalMove}
                        isPieceInHand={this.props.isPieceInHand} 
                        tryMovePiece={this.props.tryMovePiece}
                        >
                        <Piece key={pieceKey} x={x} y={y} type={piece} 
                            isPieceInHand={this.props.isPieceInHand} 
                            pickUpPiece={this.props.pickUpPiece} 
                            />
                    </Square>
                );
            }
        }
        return (output);
    }
}
