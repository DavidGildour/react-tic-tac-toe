import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

function Square(props){
    let csscls = props.winning ? "square winning" : "square";
    return (
        <button className={csscls} onClick={props.onClick}>
            {props.value}
        </button>
      );
  }
  
class Board extends React.Component {
    renderSquare(i, win) {
        return (
            <Square
                key={i} 
                winning={win}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );  
    }

    render() {
        const rows = [];
        for (let i = 0; i < 3; i++) {
            let row = [];
            for (let j = i*3; j < i*3 + 3; j++) {
                if (this.props.winning.includes(j)){
                    row.push(this.renderSquare(j, true));
                } else {
                    row.push(this.renderSquare(j, false));
                };
            }
            rows.push(<div key={i} className="board-row">{row}</div>)
        }
        return (
        <div>{rows}</div>
        );
    }
}

class Game extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                lastMove: null,
            }],
            xIsNext: true,
            stepNumber: 0,
            ascendingOrder: true,
            winningLine: [],
        }
    }
    
    calculateWinner(squares) {
        const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
        ];
        
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return [squares[a], a, b, c];
            }
        }
        return null;
    }

    checkWinner() {
        const winner = this.calculateWinner();

        this.setState({
            winningLine: winner ? winner.slice(1) : [],
        });

    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const winner = this.calculateWinner(squares)

        if (winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        const secondcheck = this.calculateWinner(squares);

        this.setState({
            history: history.concat([{
                squares: squares,
                lastMove: [i % 3, Math.floor(i/3)],
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            winningLine: secondcheck ? secondcheck.slice(1) : [],
        });
    }

    jumpTo(step) {
        const win = this.calculateWinner(this.state.history[step].squares);
        this.setState({
            winningLine: win ? win.slice(1) : [],
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    swapOrder() {
        this.setState({
            ascendingOrder: !this.state.ascendingOrder,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = this.calculateWinner(current.squares);

        const orderedHistory = this.state.ascendingOrder ? history.slice() : history.slice().reverse();
        const moves = orderedHistory.map((step, move) => {
            const parsedMove = !this.state.ascendingOrder ? history.length - move - 1 : move
            const desc = parsedMove ?
                'Go to move #' + parsedMove:
                'Go to game start';
            const last =  step.lastMove ? ('(' + step.lastMove[0] + ', ' + step.lastMove[1] + ')') : '';
            return (current === step ? (
                <li key={move}>
                    <button onClick={() => this.jumpTo(parsedMove)}><b>{desc} {last}</b></button>
                </li>
            ) : 
            <li key={move}>
                    <button onClick={() => this.jumpTo(parsedMove)}>{desc} {last}</button>
            </li>
            );
        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner[0];
        } else if (this.state.stepNumber === 9) {
            status = 'Draw!';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
        <div className="game">
            <div className="game-board">
            <Board 
                squares={current.squares}
                winning={this.state.winningLine}
                onClick={i => this.handleClick(i)}
            />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <button onClick={() => this.swapOrder()}>Toggle move order</button>
                <ol>{moves}</ol>
            </div>
        </div>
        );
    }
}

// ========================================

ReactDOM.render(
<Game />,
document.getElementById('root')
);
