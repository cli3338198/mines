/******************************************************************************/
// DOM selectors.

const target = document.getElementById("target") as HTMLDivElement;
const board = document.getElementById("board") as HTMLTableElement;
const newGameButton = document.getElementById(
  "newGameButton"
) as HTMLButtonElement;

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
  mine = 9,
}

enum ECellState {
  notvisible,
  visible,
  flagged,
}

interface ICancellableClick {
  click: Promise<unknown>;
  cancel: () => void;
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
  private static readonly _mines: number = 20;
  private static readonly _rows: number = 16;
  private static readonly _cols: number = 16;

  public board: Cell[][];
  public gameStarted: boolean;
  public gameEnded: boolean;

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
    // FIXME: use PROXY to log all changes in game to a display
    // also use proxy for setters so any changes in bombs, dimensions, etc
    // is logged to display!!
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

  /* Check if player has won. */
  public hasWon(): boolean {
    let minesFound = 0;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.board[row][col];
        if (
          (cell.state === ECellState.flagged ||
            cell.state === ECellState.notvisible) &&
          cell.value === ECellValue.mine
        ) {
          minesFound++;
        }
      }
    }

    return minesFound === this.mines;
  }
}

/******************************************************************************/
// Game logic.

let pendingClicks: ICancellableClick[] = [];
let live = false;
let endGame = false;
let game: Game | null;

game = new Game();
createBoard();

/* Start the game. */

/* Restart the game. */

/* Reset the game. */

/* Set won. */

/******************************************************************************/
// Event listeners.

/* Disable context menu. */
document.addEventListener("contextmenu", (evt: MouseEvent) => {
  evt.preventDefault();
});

/* Single click handler. */
function singleClickHandler(evt: MouseEvent): Promise<void> {
  // clear pending clicks
  clearPendingClicks();
  // create cancellable click with a delay of 300ms
  const waitForClick = cancellableClick(delay(300));
  // add the new click
  addPendingClick(waitForClick);

  return waitForClick.click
    .then(() => {
      // remove the click
      removePendingClick(waitForClick);
      // execute single click
      const tableCell = evt.target as HTMLTableCellElement;
      const [row, col] = tableCell.id.split(" ");
      // reveal cell
      game?.reveal(Number(row), Number(col));
      // update ui
      updateUI();
      console.log("single clicked", evt.target);
    })
    .catch(() => {
      // remove the click
      removePendingClick(waitForClick);
      // handle errors
      // FIXME:
    });
}

/* Double click handler. */
function doubleClickHandler(evt: MouseEvent): void {
  // clear pending clicks
  clearPendingClicks();
  // execute double click
  const tableCell = evt.target as HTMLTableCellElement;
  const [row, col] = tableCell.id.split(" ");
  // flag cell
  game?.flagCell(Number(row), Number(col));
  // update ui
  updateUI();
  console.log("double clicked", evt.target);
}

/******************************************************************************/
// UI.

/* Create board. */
function createBoard() {
  if (game) {
    game.board.forEach((row, r) => {
      const tableRow = document.createElement("tr");

      row.forEach((cell, c) => {
        const tableCell = document.createElement("td");
        // assign id to table cell
        tableCell.id = `${r} ${c}`;
        // add value to table cell
        tableCell.innerHTML = String(cell.value);
        // add attributes to table cell
        tableCell.setAttribute("data-state", String(cell.state));
        // add single click handler
        tableCell.addEventListener("click", singleClickHandler);
        // add double click handler
        tableCell.addEventListener("dblclick", doubleClickHandler);

        tableRow.appendChild(tableCell);
      });

      board.appendChild(tableRow);
    });
  }
}

/* Update UI. */
function updateUI(): void {
  if (game) {
    game.board.forEach((row, r) => {
      row.forEach((cell, c) => {
        const id = `${r} ${c}`;
        const tableCell = document.getElementById(id) as HTMLTableCellElement;
        tableCell.setAttribute("data-state", String(cell.state));
      });
    });
  }
}

// /* Flood fill. */
// function flood(value: string, row: number, col: number): void {
//   const id = `${row} ${col}`;
//   const cell = document.getElementById(id) as HTMLTableCellElement;

//   if (cell && cell.innerText === value) {
//     toggleCellVisibility(cell);

//     flood(value, row + 1, col);
//     flood(value, row - 1, col);
//     flood(value, row, col + 1);
//     flood(value, row, col - 1);
//   }
// }

/* Toggle cell visibility. */
function toggleCellVisibility(cell: HTMLTableCellElement): void {
  cell.classList.toggle("hidden");
}

/* Cell click handler. */
// function tableCellClickHandler(evt: MouseEvent): void {
//   const cell = evt.target as HTMLTableElement;
//   const id = cell.getAttribute("id") as string;
//   const [row, col] = id.split(" ");
//   const value = cell.innerText;

//   // if bomb
//   if (value === String(ECellValue.mine)) {
//     return cell.classList.add("bomb");
//   }

//   flood(value, Number(row), Number(col));
// }

/* Context menu handler. */
// function tableCellContextMenuHandler(evt: MouseEvent): void {
//   evt.preventDefault();
//   // FIXME
//   const cell = evt.target as HTMLTableElement;
//   cell.classList.toggle("flagged");
// }

/* Toggle flagged status of cell. */
function toggleFlagCell(cell: HTMLTableCellElement): void {
  cell.classList.toggle("flagged");
}

/******************************************************************************/
// Utils.

/* Create a cancellable click. */
function cancellableClick(click: Promise<void>): ICancellableClick {
  let isCancelled = false;

  const wrappedClick = new Promise((resolve, reject) => {
    click.then(
      (value: void) => {
        isCancelled === true ? reject({ isCancelled, value }) : resolve(value);
      },
      (error: Error) => reject({ isCancelled, error })
    );
  });

  return {
    click: wrappedClick,
    cancel: () => {
      isCancelled = true;
    },
  };
}

/* Add a pending click. */
function addPendingClick(click: ICancellableClick): void {
  pendingClicks = [...pendingClicks, click];
}

/* Remove a pending click. */
function removePendingClick(click: ICancellableClick): void {
  pendingClicks = pendingClicks.filter((_click) => _click !== click);
}

/* Clear pending clicks. */
function clearPendingClicks(): void {
  pendingClicks.map((pendingClick) => pendingClick.cancel());
}

/* Delay for click. */
function delay(n: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, n));
}

/******************************************************************************/
