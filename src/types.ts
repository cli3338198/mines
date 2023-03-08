/******************************************************************************/
// Enums.

export enum ECellValue {
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

export enum ECellState {
  notvisible,
  visible,
  flagged,
}

/******************************************************************************/
// Interfaces.

export interface ICancellableClick {
  click: Promise<unknown>;
  cancel: () => void;
}
