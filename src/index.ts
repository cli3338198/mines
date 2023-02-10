import { ECellValue, ECellState, ICancellableClick } from "./types";
import { Cell, Game } from "./models";
import {
  addPendingClick,
  cancellableClick,
  clearPendingClicks,
  delay,
  pendingClicks,
  removePendingClick,
} from "./utils";

/******************************************************************************/
// DOM selectors.

const target = document.getElementById("target") as HTMLDivElement;
const board = document.getElementById("board") as HTMLTableElement;
const newGameButton = document.getElementById(
  "newGameButton"
) as HTMLButtonElement;

/******************************************************************************/
// Game logic.

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

/* Disable text selection. */
document.addEventListener("mousedown", (evt: MouseEvent) => {
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

      if (game) {
        // reveal cell
        game.reveal(Number(row), Number(col));
        // update ui
        updateUI();
      }

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
export function doubleClickHandler(evt: MouseEvent): void {
  // clear pending clicks
  clearPendingClicks();
  // execute double click
  const tableCell = evt.target as HTMLTableCellElement;
  const [row, col] = tableCell.id.split(" ");

  if (game) {
    // flag cell
    game.flagCell(Number(row), Number(col));
    // update ui
    updateUI();
  }

  console.log("double clicked", evt.target);
}

/* Create board. */
function createBoard(): void {
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

/******************************************************************************/
// Utils.

/******************************************************************************/
