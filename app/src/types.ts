/** One box on the review screen. Coordinates are fractions (0..1) of the image. */
export type Box = {
  id: string;
  cx: number; // box center, as a fraction of image width
  cy: number; // box center, as a fraction of image height
  w: number;
  h: number;
  confidence: number | null; // null = added by hand
  source: "model" | "manual";
  removed: boolean; // model boxes the user rejected stay visible (red) so it can be undone
};

/** One verified count that was added to the running total. */
export type Entry = {
  id: string;
  count: number;      // final verified count = modelCount - removed + added
  modelCount: number; // what the model found
  added: number;      // chickens the user tapped in
  removed: number;    // model boxes the user rejected
  createdAt: number;
};
