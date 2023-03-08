import { ECellState, ECellValue } from "./types";

export class Cell {
  public value: ECellValue;
  public state: ECellState;
  public triggered?: boolean;

  constructor(
    value: ECellValue = ECellValue.none,
    state: ECellState = ECellState.notvisible,
    triggered?: boolean
  ) {
    this.value = value;
    this.state = state;
    this.triggered = triggered;
  }
}

export class Game {
  private static readonly _mines: number = 20;
  private static readonly _rows: number = 16;
  private static readonly _cols: number = 16;

  public board: Cell[][];
  public gameStarted: boolean;
  public gameEnded: boolean;
  public minesFound: number;

  constructor(
    private mines: number = Game._mines,
    private rows: number = Game._rows,
    private cols: number = Game._cols
  ) {
    this.mines = mines;
    this.rows = rows;
    this.cols = cols;
    this.board = this.generateBoard();
    this.gameStarted = true;
    this.gameEnded = false;
    this.minesFound = 0;
    // FIXME: use PROXY to log all changes in game to a display
    // also use proxy for setters so any changes in bombs, dimensions, etc
    // is logged to display!!
    const proxyHandler = {
      // reference to class inside handler
      main: this,
      /**
       * @param target  the target called function
       * @param thisArg the "this" argument for the call
       * @param args    the list of arguments
       * @return        results of the function
       */
      apply: function (target: Function, thisArg: any, args: any[]): any {
        const results = target.bind(this.main)(...args);
        // FIXME: do something here
        return results;
      },
    };
    // create proxy
    // get all methods on game class
    const methods = Object.getOwnPropertyNames(Game.prototype);
    // skip the constructor method
    const constructorIdx = methods.indexOf("constructor");
    if (constructorIdx > -1) methods.splice(constructorIdx, 1);
    // replace all methods with proxy methods

    methods.forEach((methodName) => {
      // this[methodName as keyof typeof Game.prototype] = new Proxy(, proxyHandler)
    });
  }

  /* Generate a board. */
  private generateBoard(): Cell[][] {
    // build a board
    const board: Cell[][] = Array(this.rows)
      .fill(0)
      .map(() =>
        Array(this.cols)
          .fill(0)
          .map(() => new Cell())
      );

    // place mines
    let placedMines = this.mines;
    while (placedMines > 0) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      const currentCell = board[row][col];
      if (currentCell.value !== ECellValue.mine) {
        currentCell.value = ECellValue.mine;
        placedMines--;
      }
    }

    // place numbers
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (board[row][col].value === ECellValue.mine) {
          this.increment(row + 1, col, board);
          this.increment(row - 1, col, board);
          this.increment(row, col + 1, board);
          this.increment(row, col - 1, board);
          this.increment(row - 1, col - 1, board);
          this.increment(row - 1, col + 1, board);
          this.increment(row + 1, col - 1, board);
          this.increment(row + 1, col + 1, board);
        }
      }
    }

    return board;
  }

  /* Increment cell value based on # of surrounding mines. */
  private increment(row: number, col: number, board: Cell[][]): void {
    if (
      row in board &&
      col in board[row] &&
      board[row][col].value !== ECellValue.mine
    ) {
      board[row][col].value++;
    }
  }

  /* Reveal cells. */
  public reveal(row: number, col: number): void {}

  /* Reveals cells. */
  public flood(value: ECellValue, row: number, col: number): void {
    if (
      !(row in this.board) ||
      !(col in this.board[row]) ||
      this.board[row][col].state === ECellState.visible ||
      this.board[row][col].state === ECellState.flagged ||
      this.board[row][col].value === ECellValue.mine ||
      this.board[row][col].value === value
    ) {
      return;
    } // FIXME: ENDED here!!!!

    const cell = this.board[row][col];
    cell.state = ECellState.visible;

    this.flood(value, row + 1, col);
    this.flood(value, row - 1, col);
    this.flood(value, row, col + 1);
    this.flood(value, row, col - 1);
  }

  /* Reveal mines. */
  public revealmines(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.board[row][col];
        if (
          (cell.state === ECellState.notvisible ||
            cell.state === ECellState.flagged) &&
          cell.value === ECellValue.mine
        ) {
          cell.state = ECellState.visible;
        }
      }
    }
  }

  /* Flag cell. */
  public flagCell(row: number, col: number): void {
    const cell = this.board[row][col];

    // toggle cell flagged
    if (cell.state === ECellState.flagged) {
      cell.state = ECellState.notvisible;
    } else {
      cell.state = ECellState.flagged;
    }
  }

  /* Check if player has won. 
    - are all mines are flagged?
    - are all other cells revealed?
  */
  public hasWon(): boolean {
    return (
      this.minesFound === this.mines &&
      this.board.every((row) =>
        row.every((cell) =>
          cell.value !== ECellValue.mine
            ? cell.state === ECellState.visible
            : cell.value === ECellValue.mine
            ? true
            : false
        )
      )
    );
  }
}
