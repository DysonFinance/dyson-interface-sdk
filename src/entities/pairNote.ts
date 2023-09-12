
export interface Note {
  token0Amount: bigint
  token1Amount: bigint
  due: number
  noteIndex: number
}


export interface IDysonPairNotes {
  [poolAddress: string]: PairNotes
}

export interface PairNotes {
  [noteIndex: number]: Note
}
