/** Largest box with the given aspect ratio (width/height) that fits in aw x ah. */
export function fit(aw: number, ah: number, aspect: number) {
  if (aw <= 0 || ah <= 0 || aspect <= 0) return { w: 0, h: 0 };
  return aw / ah > aspect ? { w: ah * aspect, h: ah } : { w: aw, h: aw / aspect };
}
