/******************************************************************************/
// Typing.

enum ECellValue {
  none = 0,
  one = 1,
  two = 2,
  three = 3,
  four = 4,
  five = 5,
  six = 6,
  seven = 7,
  eight = 8,
  bomb = 9,
}

enum ECellState {
  notvisible,
  visible,
  flagged,
}

enum ECellDisplay {
  flag = "🚩",
  bomb = "💣",
}

/******************************************************************************/
// Classes.

class Cell {
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

class Game {
  public static readonly bombs: number = 20;
  public static readonly rows: number = 16;
  public static readonly cols: number = 16;
  public board: Cell[][];

  constructor() {
    this.board = this.generateBoard();
  }

  /* Generate a board. */
  private generateBoard(): Cell[][] {
    const board: Cell[][] = [];

    /* Build board. */
    for (let row = 0; row < Game.rows; row++) {
      const newRow: Cell[] = [];
      for (let col = 0; col < Game.cols; col++) {
        newRow.push(new Cell());
      }
      board.push(newRow);
    }

    /* Place bombs. */
    let bombs = Game.bombs;
    while (bombs > 0) {
      const row = Math.floor(Math.random() * Game.rows);
      const col = Math.floor(Math.random() * Game.cols);
      const currentCell = board[row][col];
      if (currentCell.value !== ECellValue.bomb) {
        currentCell.value = ECellValue.bomb;
        bombs--;
      }
    }

    /* Place numbers. */
    for (let row = 0; row < Game.rows; row++) {
      for (let col = 0; col < Game.cols; col++) {
        if (board[row][col].value === ECellValue.bomb) {
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

  /* Increment cell value based on # of surrounding bombs. */
  private increment(row: number, col: number, board: Cell[][]): void {
    if (
      row in board &&
      col in board[row] &&
      board[row][col].value !== ECellValue.bomb
    ) {
      board[row][col].value++;
    }
  }

  /* Flood fill. */
  public flood(value: ECellValue, row: number, col: number): void {
    if (
      !(row in this.board) ||
      !(col in this.board[row]) ||
      this.board[row][col].state === ECellState.visible ||
      this.board[row][col].state === ECellState.flagged ||
      this.board[row][col].value === ECellValue.bomb ||
      this.board[row][col].value === value
    ) {
      return;
    }

    const cell = this.board[row][col];
    cell.state = ECellState.visible;

    this.flood(value, row + 1, col);
    this.flood(value, row - 1, col);
    this.flood(value, row, col + 1);
    this.flood(value, row, col - 1);
  }

  /* Reveal bombs. */
  public revealBombs(): void {
    for (let row = 0; row < Game.rows; row++) {
      for (let col = 0; col < Game.cols; col++) {
        const cell = this.board[row][col];
        if (
          (cell.state === ECellState.notvisible ||
            cell.state === ECellState.flagged) &&
          cell.value === ECellValue.bomb
        ) {
          cell.state = ECellState.visible;
        }
      }
    }
  }

  /* Check if player has won. */
  public hasWon(): boolean {
    let bombsFound = 0;

    for (let row = 0; row < Game.rows; row++) {
      for (let col = 0; col < Game.cols; col++) {
        const cell = this.board[row][col];
        if (
          cell.state === ECellState.flagged ||
          cell.state === ECellState.notvisible
        ) {
          bombsFound++;
        }
      }
    }

    return bombsFound === Game.bombs;
  }
}

/******************************************************************************/
// Game logic.

let time = 0;
let live = false;
let endGame = false;

/* Start the game. */

/* Restart the game. */

/* Reset the game. */

/* Set won. */

/******************************************************************************/
// DOM manipulation.

const body = document.querySelector("body") as HTMLElement;

/* Create DOM board. */
function createDOMBoard(): void {
  const table = document.createElement("table");
  table.id = "board";

  for (let row = 0; row < Game.rows; row++) {
    const tableRow = document.createElement("tr");

    for (let col = 0; col < Game.cols; col++) {
      const tableCell = document.createElement("td");
      /* Assign id to tableCell. */
      tableCell.id = `${row} ${col}`;
      /* Toggle cell visibility. */
      // toggleCellVisibility(tableCell); TODO: fix this here
      /* Add click handler. */
      tableCell.addEventListener("click", tableCellClickHandler);
      tableCell.addEventListener("contextmenu", tableCellContextMenuHandler);

      tableRow.appendChild(tableCell);
    }
    table.appendChild(tableRow);
  }
  body.appendChild(table);
}

createDOMBoard();
const board = document.getElementById("board");
const g = new Game();
g.board.forEach((row, r) =>
  row.forEach((cell, c) => {
    const id = `${r} ${c}`;
    const domCell = document.getElementById(id) as HTMLTableCellElement;
    domCell.innerText = String(cell.value);
  })
);

/* Flood fill. */
function flood(value: string, row: number, col: number): void {
  const id = `${row} ${col}`;
  const cell = document.getElementById(id) as HTMLTableCellElement;

  if (cell && cell.innerText === value) {
    toggleCellVisibility(cell);

    flood(value, row + 1, col);
    flood(value, row - 1, col);
    flood(value, row, col + 1);
    flood(value, row, col - 1);
  }
}

/* Toggle cell visibility. */
function toggleCellVisibility(cell: HTMLTableCellElement): void {
  cell.classList.toggle("hidden");
}

/* Cell click handler. */
function tableCellClickHandler(evt: MouseEvent): void {
  const cell = evt.target as HTMLTableElement;
  const id = cell.getAttribute("id") as string;
  const [row, col] = id.split(" ");
  const value = cell.innerText;

  flood(value, Number(row), Number(col));
}

/* Context menu handler. */
function tableCellContextMenuHandler(evt: MouseEvent): void {
  evt.preventDefault();
  // FIXME
  console.log("right clicked");
}

/******************************************************************************/

/******************************************************************************/
