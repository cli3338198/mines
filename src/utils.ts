import { game } from ".";
import { ICancellableClick } from "./types";
import { updateUI } from "./ui";

export let pendingClicks: ICancellableClick[] = [];

/******************************************************************************/
// UI.

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

/* Single click handler. */
export function singleClickHandler(evt: MouseEvent): Promise<void> {
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

/* Create a cancellable click. */
export function cancellableClick(click: Promise<void>): ICancellableClick {
  let isCancelled = false;

  const wrappedClick = new Promise((resolve, reject) => {
    click
      .then((value: void) => {
        isCancelled === true ? reject() : resolve(value);
      })
      .catch(() => reject());
  });

  return {
    click: wrappedClick,
    cancel: () => {
      isCancelled = true;
    },
  };
}

/* Add a pending click. */
export function addPendingClick(click: ICancellableClick): void {
  pendingClicks = [...pendingClicks, click];
}

/* Remove a pending click. */
export function removePendingClick(click: ICancellableClick): void {
  pendingClicks = pendingClicks.filter((_click) => _click !== click);
}

/* Clear pending clicks. */
export function clearPendingClicks(): void {
  pendingClicks.map((pendingClick) => pendingClick.cancel());
}

/* Delay for click. */
export function delay(n: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, n));
}
