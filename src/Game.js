import React from "react";
import Board from "./Board";
import { PieceTypes } from "./PieceTypes";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export class Game extends React.Component {
    constructor(props) {
        super(props);
        this.cornersWin = true; // you can only win by getting the king to the corner
        this.armedKing = true; // king can help capture pieces
        this.turnTypes = {
            "A": "Attacker", 
            "D": "Defender", 
            "AW": "AttackerWin",
            "DW": "DefenderWin"
        };
        this.defaultBoardLayout = [
            [ "A",  "", "A", "A", "A",  "", "A" ],
            [  "",  "",  "", "D",  "",  "",  "" ],
            [ "A",  "",  "", "D",  "",  "", "A" ],
            [ "A", "D", "D", "K", "D", "D", "A" ],
            [ "A",  "",  "", "D",  "",  "", "A" ],
            [  "",  "",  "", "D",  "",  "",  "" ],
            [ "A",  "", "A", "A", "A",  "", "A" ]
        ];
        this.state = {
            squares: this.defaultBoardLayout, // the board is a 7x7 grid
            currentTurn: "A",
            pieceInHand: null,
            pieceOrigX: null,
            pieceOrigY: null
        };
    }

    clearBoard = () => {
        this.setState({
            squares: Array(7).fill(Array(7).fill(""))
        });
        console.log("Cleared board");
    }

    resetGame = () => {
        this.setState({
            squares: this.defaultBoardLayout,
            currentTurn: "A"
        });
        console.log("Game reset");
    }

    componentDidUpdate(prevProps, prevState) {

    }

    logSquaresState = () => {
        console.log(this.state.squares);
    }

    isAttacker = (x, y) => {
        return (this.state.squares[y][x] === PieceTypes.ATTACKER);
    };

    isDefender = (x, y) => {
        return (this.state.squares[y][x] === PieceTypes.DEFENDER);
    }

    isKing = (x, y) => {
        return (this.state.squares[y][x] === PieceTypes.KING);
    }

    isDefenderOrKing = (x, y) => {
        return (this.isDefender(x, y) || this.isKing(x, y));
    }

    isValidDefender = (x, y) => {
        return ((this.armedKing && this.isDefenderOrKing(x, y)) || (this.isDefender(x, y)));
    }

    isEmptySquare = (x, y) => {
        return (this.state.squares[y][x] === "");
    }

    pickUpPiece = (x, y) => {
        if (!this.isEmptySquare(x, y)) {
            let squares = this.state.squares.slice();
            const pieceInHand = squares[y][x];
            //squares[y][x] = "";
            this.setState({ 
                squares, 
                pieceInHand, 
                pieceOrigX: x, 
                pieceOrigY: y 
            });
        }
    }

    replacePiece = () => {
        if (this.state.pieceInHand === null) {
            return false;
        }
        let squares = this.state.squares.slice();
        squares[this.state.pieceOrigY][this.state.pieceOrigX] = this.state.pieceInHand;
        this.setState({
            squares,
            pieceInHand: null,
            pieceOrigX: null,
            pieceOrigY: null
        });
    }

    isLegalMove = (fromX, fromY, toX, toY) => {
        console.log(`isLegalMove() from ${fromX},${fromY} to ${toX},${toY}`);
        if (fromX === toX && fromY === toY) {
            console.log("--No change");
            return false;
        }
        if (this.isEmptySquare(fromX, fromY)) {
            console.log("--Can't move a blank tile");
            return false;
        }
        if (!this.isEmptySquare(toX, toY)) {
            console.log("--Can't move to an occupied tile");
            return false;
        }
        if (this.state.currentTurn === "A" && !this.isAttacker(fromX, fromY)) {
            console.log("--Only Attacker can move on Attacker's turn");
            return false;
        }
        if (this.state.currentTurn === "D" && !this.isDefenderOrKing(fromX, fromY)) {
            console.log("--Only Defender can move on Defender's turn");
            return false;
        }
        if (toX < 0 || toY < 0 || toX > 6 || toY > 6) {
            console.log("--Can't move to a tile outside the game board");
            return false;
        }
        if (fromX !== toX && fromY !== toY) {
            console.log("--Can't move diagonally");
            return false;
        }
        if (!this.isKing(fromX, fromY) && toX === 3 && toY === 3) {
            // TODO: an exception is during a capture, but the (non-king) piece that lands on the throne is sacrificed
            console.log("--Only the king can land on the throne");
            return false;
        }
        // Can't move through other pieces
        let beg;
        let end;
        if (fromY === toY) {
            // Piece is moving horizontally
            if (fromX < toX) {
                beg = fromX;
                end = toX;
            } else {
                beg = toX;
                end = fromX;
            }
            for (let x=beg; x<=end; x++) {
                if (x !== fromX && !this.isEmptySquare(x, toY)) {
                    console.log(`--Can't move through other pieces (at ${x},${toY})`);
                    return false;
                }
            }
        } else {
            // Piece is moving vertically
            if (fromY < toY) {
                beg = fromY;
                end = toY;
            } else {
                beg = toY;
                end = fromY;
            }
            for (let y=beg; y<=end; y++) {
                if (y !== fromY && !this.isEmptySquare(toX, y)) {
                    console.log("--Can't move through other pieces");
                    return false;
                }
            }
        }
        return true;
    }

    movePiece = (fromX, fromY, toX, toY) => {
        // PROBLEM: once you move a piece to a spot that was originally empty, it loses its ability to move
        console.log(`Moving from ${fromX},${fromY} to ${toX},${toY}`);
        let squares = this.state.squares.slice();
        squares[toY][toX] = squares[fromY][fromX];
        squares[fromY][fromX] = "";
        this.setState({ 
            squares,
            currentTurn: (this.state.currentTurn === "A" ? "D" : "A")
        });
        this.captureCheck(toX, toY);
        if (this.escapeCheck()) {
            this.setState({ currentTurn: "DW" }); // defenders win
        }
    }

    escapeCheck = () => {
        if (this.cornersWin) {
            if (this.state.squares[0][0] === PieceTypes.KING ||
                this.state.squares[0][6] === PieceTypes.KING ||
                this.state.squares[6][0] === PieceTypes.KING ||
                this.state.squares[6][6] === PieceTypes.KING) {
                return true;
            }
        } else {
            for (let n=0; n<=6; n++) {
                if (this.state.squares[n][0] === PieceTypes.KING ||
                    this.state.squares[0][n] === PieceTypes.KING ||
                    this.state.squares[n][6] === PieceTypes.KING ||
                    this.state.squares[6][n] === PieceTypes.KING) {
                    return true;
                }
            }
        }
        return false;
    }

    captureCheck = (x, y) => {
        let squares = this.state.squares.slice();
        if (this.isAttacker(x, y)) {
            if (x - 2 >= 0 && this.isDefender(x-1, y) && this.isAttacker(x-2, y)) {
                squares[y][x-1] = "";
            }
            if (x + 2 <= 6 && this.isDefender(x+1, y) && this.isAttacker(x+2, y)) {
                squares[y][x+1] = "";
            }
            if (y - 2 >= 0 && this.isDefender(x, y-1) && this.isAttacker(x, y-2)) {
                squares[y-1][x] = "";
            }
            if (y + 2 <= 6 && this.isDefender(x, y+1) && this.isAttacker(x, y+2)) {
                squares[y+1][x] = "";
            }
        }
        if (this.isValidDefender(x, y)) {
            if (x - 2 >= 0 && this.isAttacker(x-1, y) && this.isValidDefender(x-2, y)) {
                squares[y][x-1] = "";
            }
            if (x + 2 <= 6 && this.isAttacker(x+1, y) && this.isValidDefender(x+2, y)) {
                squares[y][x+1] = "";
            }
            if (y - 2 >= 0 && this.isAttacker(x, y-1) && this.isValidDefender(x, y-2)) {
                squares[y-1][x] = "";
            }
            if (y + 2 <= 6 && this.isAttacker(x, y+1) && this.isValidDefender(x, y+2)) {
                squares[y+1][x] = "";
            }
        }
        this.setState({ squares });
    }

    render() {
        return (
            <div className="game-wrapper">
                <div id="game-board" className="board-wrapper">
                    <DndProvider backend={HTML5Backend}>
                        <Board 
                            {...this.state} 
                            isLegalMove={this.isLegalMove}
                            pickUpPiece={this.pickUpPiece}
                            replacePiece={this.replacePiece}
                            movePiece={this.movePiece}
                            />
                    </DndProvider>
                </div>
                <button onClick={() => this.resetGame()}>Reset Board</button>
                <button onClick={() => this.clearBoard()}>Clear Board</button>
                <button onClick={() => this.logSquaresState()}>Log State</button>
            </div>
        );
    }
}