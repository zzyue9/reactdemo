import React from 'react';
import { createRoot } from 'react-dom/client'; // 引入 createRoot
import './index.css';

// 一个方格
function Square(props) {
    let hightLightClass = Array(225).fill('square');
    const winLine = props.winLine;
    if (winLine) {
        for (let i = 0; i < winLine.length; i++) {
            let num = winLine[i];
            hightLightClass[num] = 'hightLight square';
        }
    }
    return (
        <button className={hightLightClass[props.index]} onClick={props.onClick} key={props.index}>
            {props.value}
        </button>
    );
}

// 整个棋盘  是Game的子元素  是Square的父元素
class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                winLine={this.props.winLine}
                index={i}
            />
        );
    }
    render() {
        return (
            <div>
                {
                    Array(15).fill(null).map((itemx, indexx) => (
                        <div className="board-row" key={indexx}>
                            {
                                Array(15).fill(null).map((itemy, indexy) => (
                                    this.renderSquare(indexx * 15 + indexy)
                                ))
                            }
                        </div>
                    ))
                }
            </div>
        );
    }
}

// 顶级父组件
class Game extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          history: [
              {
                  squares: Array(225).fill(null),
                  stX: -1,
                  stY: -1,
              }
          ],
          XisNext: true,
          stepNumber: 0,
      };
  }

  handleClick(i) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
          return;
      }
      squares[i] = this.state.XisNext ? 'X' : 'O';
      this.setState({
          history: history.concat([{
              squares: squares,
              stX: parseInt(i / 15) + 1,
              stY: parseInt(i % 15) + 1,
          }]),
          XisNext: !this.state.XisNext,
          stepNumber: history.length,
      });
  }

  jumpTo(historyIndex) {
      this.setState({
          stepNumber: historyIndex,
          XisNext: (historyIndex % 2) === 0,
      });
  }

  render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winner = calculateWinner(current.squares) && calculateWinner(current.squares).winPeople;
      const winnerLine = calculateWinner(current.squares) && calculateWinner(current.squares).winLine;
      let status;
      let winClor = 0;

      if (winner) {
          status = winner + '获胜啦';
          winClor = 1;
      } else if (current.squares.indexOf(null) < 0) {
          status = '这是一个平局';
          winClor = 0;
      } else {
          status = '下一个棋子是' + (this.state.XisNext ? 'X' : 'O');
          winClor = 0;
      }
      let winClorClass = winClor ? 'blod hightLight' : '';
      return (
          <div className="game">
              <div className="game-board">
                  <Board squares={current.squares} onClick={(i) => this.handleClick(i)} winLine={winnerLine} />
              </div>
              <div className="game-info">
                  <div className={winClorClass}>{status}</div>
              </div>
          </div>
      );
  }
}



// 代码开始处
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Game />);

// 判断胜负
function calculateWinner(squares) {
    const directions = [
        { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }, { dx: 1, dy: -1 }
    ];
    const winLength = 5;
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            if (squares[row * 15 + col] !== null) {
                for (let { dx, dy } of directions) {
                    let count = 1;
                    let x = row + dx, y = col + dy;
                    while (x >= 0 && x < 15 && y >= 0 && y < 15 && squares[x * 15 + y] === squares[row * 15 + col]) {
                        count++;
                        x += dx;
                        y += dy;
                    }
                    x = row - dx;
                    y = col - dy;
                    while (x >= 0 && x < 15 && y >= 0 && y < 15 && squares[x * 15 + y] === squares[row * 15 + col]) {
                        count++;
                        x -= dx;
                        y -= dy;
                    }
                    if (count >= winLength) {
                        return {
                            winPeople: squares[row * 15 + col],
                            winLine: [row * 15 + col, (row + dx) * 15 + (col + dy), (row + 2 * dx) * 15 + (col + 2 * dy), (row + 3 * dx) * 15 + (col + 3 * dy), (row + 4 * dx) * 15 + (col + 4 * dy)]
                                .filter(idx => idx >= 0 && idx < 225)
                        };
                    }
                }
            }
        }
    }
    return null;
}