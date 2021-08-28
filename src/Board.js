import React from "react";
import Square from "./Square";

export default class Board extends React.Component {
    render() {
        let output = [];
        for (const y in this.props.squares) {
            for (const x in this.props.squares[y]) {
                const _x = Number(x);
                const _y = Number(y);
                const isThrone = (_x === 3 && _y === 3);
                const isCorner = (_x === 0 && _y === 0) ||
                                 (_x === 6 && _y === 0) ||
                                 (_x === 0 && _y === 6) ||
                                 (_x === 6 && _y === 6);
                const key = `${x}~${y}`;
                output.push(
                    <Square 
                        key={key} 
                        x={x} 
                        y={y} 
                        isThrone={isThrone} 
                        isCorner={isCorner} 
                        piece={this.props.squares[_y][_x]} 
                        pickUpPiece={this.props.pickUpPiece}
                        tryMovePiece={this.props.tryMovePiece}
                        />
                );
            }
        }
        return (output);
    }
}
