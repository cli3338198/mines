import { game, board } from ".";
import { leftClickHandler, rightClickHandler } from "./utils";

/* Toggle cell visibility. */
export function toggleCellVisibility(cell: HTMLTableCellElement): void {
  cell.classList.toggle("hidden");
}

/* Toggle flagged status of cell. */
export function toggleFlagCell(cell: HTMLTableCellElement): void {
  cell.classList.toggle("flagged");
}

/* Create board. */
export function createBoard(): void {
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
        // add left click handler
        tableCell.addEventListener("click", leftClickHandler);
        // add right click handler
        tableCell.addEventListener("contextmenu", rightClickHandler);

        tableRow.appendChild(tableCell);
      });

      board.appendChild(tableRow);
    });
  }
}

/* Update UI. */
export function updateUI(): void {
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
