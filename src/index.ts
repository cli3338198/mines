import { Game } from "./models";
import { createBoard } from "./ui";

/******************************************************************************/
// DOM selectors.

export const target = document.getElementById("target") as HTMLDivElement;
export const board = document.getElementById("board") as HTMLTableElement;
export const newGameButton = document.getElementById(
  "newGameButton"
) as HTMLButtonElement;

/******************************************************************************/
// Game logic.

export let live = false;
export let endGame = false;
export let game: Game | null;

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
