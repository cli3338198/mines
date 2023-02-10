import { ICancellableClick } from "./types";

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
export function toggleFlagCell(cell: HTMLTableCellElement): void {
  cell.classList.toggle("flagged");
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
