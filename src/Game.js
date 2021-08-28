import React from "react";
import Board from "./Board";
import { PieceTypes } from "./PieceTypes";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DeepDiff } from 'deep-diff';

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
        
        this.state = {
            squares: this.defaultBoardLayout(), // the board is a 7x7 grid
            currentTurn: "A",
            pieceInHand: null,
            pieceOrigX: null,
            pieceOrigY: null
        };
    }

    defaultBoardLayout = () => {
        return [
            [ "A",  "", "A", "A", "A",  "", "A" ],
            [  "",  "",  "", "D",  "",  "",  "" ],
            [ "A",  "",  "", "D",  "",  "", "A" ],
            [ "A", "D", "D", "K", "D", "D", "A" ],
            [ "A",  "",  "", "D",  "",  "", "A" ],
            [  "",  "",  "", "D",  "",  "",  "" ],
            [ "A",  "", "A", "A", "A",  "", "A" ]
        ];
    }

    clearBoard = () => {
        this.setState({
            squares: Array(7).fill(Array(7).fill(""))
        });
        console.log("Cleared board");
    }

    resetGame = () => {
        this.setState({
            squares: this.defaultBoardLayout().slice(),
            currentTurn: "A"
        });
        console.log("Game reset");
    }

    componentDidUpdate = (prevProps, prevState) => {
        const diff = DeepDiff(prevState, this.state);
        if (diff === undefined) {
            return;
        }
        //console.log("GAME COMPONENTDIDUPDATE STATE DIFF:");
        //console.log(diff);
    }

    logSquaresState = () => {
        console.log(this.state.squares);
    }

    logDefaultLayout = () => {
        console.log(this.defaultBoardLayout());
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

    isPieceInHand = () => {
        return !(this.state.pieceInHand === null);
    }

    getPieceInHand = () => {
        return {
            pieceInHand: this.state.pieceInHand,
            pieceOrigX: this.state.pieceOrigX,
            pieceOrigY: this.state.pieceOrigY
        };
    }

    pickUpPiece = (x, y) => {
        if (!this.isEmptySquare(x, y)) {
            const pieceInHand = this.state.squares[y][x];
            const state = { 
                pieceInHand, 
                pieceOrigX: x, 
                pieceOrigY: y 
            };
            console.log("Picked up piece:");
            console.log(state);
            this.setState({ ...state });
        }
    }

    tryMovePiece = (toX, toY) => {
        if (!this.isPieceInHand) {
            return false;
        }
        if (!this.isLegalMove(this.state.pieceOrigX, this.state.pieceOrigY, toX, toY, false)) {
            this.replacePiece();
            return false;
        }
        if (!this.movePiece(this.state.pieceOrigX, this.state.pieceOrigY, toX, toY)) {
            this.replacePiece();
            return false;
        }
        return true;
    }

    replacePiece = () => {
        if (this.state.pieceInHand === null) {
            return false;
        }
        let squares = this.state.squares.slice();
        squares[this.state.pieceOrigY][this.state.pieceOrigX] = this.state.pieceInHand;
        this.setState({
            squares: squares,
            pieceInHand: null,
            pieceOrigX: null,
            pieceOrigY: null
        });
    }

    isLegalMove = (fromX, fromY, toX, toY, silent=true) => {
        fromX = Number(fromX);
        fromY = Number(fromY);
        toX = Number(toX);
        toY = Number(toY);
        if (fromX === toX && fromY === toY) {
            if (!silent) console.log("--No change");
            return false;
        }
        if (this.isEmptySquare(fromX, fromY)) {
            if (!silent) console.log("--Can't move a blank tile");
            return false;
        }
        if (!this.isEmptySquare(toX, toY)) {
            if (!silent) console.log("--Can't move to an occupied tile");
            return false;
        }
        if (this.state.currentTurn === "A" && !this.isAttacker(fromX, fromY)) {
            if (!silent) console.log("--Only Attacker can move on Attacker's turn");
            return false;
        }
        if (this.state.currentTurn === "D" && !this.isDefenderOrKing(fromX, fromY)) {
            if (!silent) console.log("--Only Defender can move on Defender's turn");
            return false;
        }
        if (toX < 0 || toY < 0 || toX > 6 || toY > 6) {
            if (!silent) console.log("--Can't move to a tile outside the game board");
            return false;
        }
        if (fromX !== toX && fromY !== toY) {
            if (!silent) console.log("--Can't move diagonally");
            return false;
        }
        if (!this.isKing(fromX, fromY) && toX === 3 && toY === 3) {
            // TODO: an exception is during a capture, but the (non-king) piece that lands on the throne is sacrificed
            if (!silent) console.log("--Only the king can land on the throne");
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
                    if (!silent) console.log(`--Can't hmove through other pieces (from ${fromX},${fromY} to ${x},${toY})`);
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
                    if (!silent) console.log(`--Can't vmove through other pieces (from ${fromX},${fromY} to ${toX},${y})`);
                    return false;
                }
            }
        }
        return true;
    }

    movePiece = (fromX, fromY, toX, toY) => {
        const movedPiece = this.state.squares[fromY][fromX];
        console.log(`Moving ${movedPiece} from ${fromX},${fromY} to ${toX},${toY}`);
        // grab the current state of the board
        let squares = this.state.squares.slice();
        // we've already checked if the move was legal, so the target square must be empty
        squares[toY][toX] = squares[fromY][fromX];
        // empty the square we just moved from
        squares[fromY][fromX] = "";
        // update the board state
        this.setState({ 
            squares: squares,
            pieceInHand: null,
            pieceOrigX: null,
            pieceOrigY: null,
            currentTurn: (this.state.currentTurn === "A" ? "D" : "A")
        });
        // check if we just captured a piece - this can remove pieces from the board state
        this.captureCheck(toX, toY);
        // check if this move triggers an escape for the king - only need to check when the king moves
        if (movedPiece === "K" && this.escapeCheck()) {
            this.setState({ currentTurn: "DW" }); // defenders win
        }
        return true;
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

    surroundedCheck = () => {
        // TODO: code to check if King is surrounded by attackers
        // remember that if cornersWin is set that King only needs to be surrounded on 3 sides (since he could be on an edge)
    }

    captureCheck = (x, y) => {
        // this code was largely copied from a decade+ old Java project of mine and it's buggy
        let squares = this.state.squares.slice();
        if (this.isAttacker(x, y)) {
            console.log(`Checking captures for attacker at ${x},${y}`);
            if (x - 2 >= 0 && this.isDefender(x-1, y) && this.isAttacker(x-2, y)) {
                console.log("capture A");
                squares[y][x-1] = "";
            }
            if (x + 2 <= 6 && this.isDefender(x+1, y) && this.isAttacker(x+2, y)) {
                console.log("capture B");
                squares[y][x+1] = "";
            }
            if (y - 2 >= 0 && this.isDefender(x, y-1) && this.isAttacker(x, y-2)) {
                console.log("capture C");
                squares[y-1][x] = "";
            }
            if (y + 2 <= 6 && this.isDefender(x, y+1) && this.isAttacker(x, y+2)) {
                console.log("capture D");
                squares[y+1][x] = "";
            }
        }
        if (this.isValidDefender(x, y)) {
            console.log(`Checking captures for defender at ${x},${y}`);
            if (x - 2 >= 0 && this.isAttacker(x-1, y) && this.isValidDefender(x-2, y)) {
                console.log("capture A");
                squares[y][x-1] = "";
            }
            if (x + 2 <= 6 && this.isAttacker(x+1, y) && this.isValidDefender(x+2, y)) {
                console.log("capture B");
                squares[y][x+1] = "";
            }
            if (y - 2 >= 0 && this.isAttacker(x, y-1) && this.isValidDefender(x, y-2)) {
                console.log("capture C");
                squares[y-1][x] = "";
            }
            if (y + 2 <= 6 && this.isAttacker(x, y+1) && this.isValidDefender(x, y+2)) {
                console.log("capture D");
                squares[y+1][x] = "";
            }
        }
        this.setState({ squares: squares });
    }

    render = () => {
        return (
            <div className="game-wrapper">
                <div id="game-board" className="board-wrapper">
                    <DndProvider backend={HTML5Backend}>
                        <Board 
                            {...this.state} 
                            getPieceInHand={this.getPieceInHand}
                            isPieceInHand={this.isPieceInHand}
                            isLegalMove={this.isLegalMove}
                            pickUpPiece={this.pickUpPiece}
                            tryMovePiece={this.tryMovePiece}
                            />
                    </DndProvider>
                </div>
                <button onClick={() => this.resetGame()}>Reset Board</button>
                <button onClick={() => this.clearBoard()}>Clear Board</button>
                <button onClick={() => this.logSquaresState()}>Log State</button>
                <button onClick={() => this.logDefaultLayout()}>Log Default</button>
            </div>
        );
    }
}