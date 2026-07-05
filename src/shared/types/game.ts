// Shared types between client and server.

type Response<T> = { status: 'error'; message: string } | ({ status: 'success' } & T);

/** One row on the "hive board" — a cluster of matching answers. */
export type BoardEntry = {
  label: string; // human-readable representative of the cluster
  count: number; // how many players landed in this cluster
  isMine?: boolean; // true for the current player's cluster
};

/** The player's standing, recomputed live from current data on every load. */
export type GameResult = {
  answerLabel: string; // representative label of the player's cluster
  clusterCount: number; // players sharing the player's answer (incl. them)
  totalPlayers: number; // total submissions on this post
  percent: number; // clusterCount / totalPlayers * 100, rounded
  rank: number; // 1-based rank of the cluster among all clusters
  isHiveMind: boolean; // player is in the single most popular cluster
  isRogue: boolean; // player is the only one with this answer
};

export type InitResponse = Response<{
  prompt: string;
  emoji: string;
  totalPlayers: number;
  hasAnswered: boolean;
  result?: GameResult; // present iff hasAnswered
  board?: BoardEntry[]; // present iff hasAnswered
  streak: number;
  score: number; // cumulative hive-score across days
}>;

export type SubmitResponse = Response<{
  result: GameResult;
  board: BoardEntry[];
  streak: number;
  score: number;
}>;
