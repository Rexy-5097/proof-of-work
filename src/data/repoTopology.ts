/**
 * The hero's repository topology — one node per public repo, in the
 * same 1000×640 coordinate space as the SVG viewBox it originated from.
 * Shared between the static SSR/no-JS/reduced-motion render
 * (HeroBackdrop) and the animated canvas layer (HeroParticleNetwork) so
 * both draw the exact same graph — this is data, not decoration.
 */
export const TOPOLOGY_NODES: ReadonlyArray<readonly [number, number]> = [
  [180, 300], [240, 350], [150, 390],
  [640, 120], [720, 170], [580, 90], [690, 80],
  [130, 520], [220, 560],
  [820, 300], [880, 360], [790, 400],
  [430, 240],
  [560, 470], [640, 520], [860, 520], [300, 140],
];

export const TOPOLOGY_EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [0, 13], [3, 13], [4, 3], [5, 3], [6, 4],
  [7, 8], [7, 0], [9, 10], [10, 11], [11, 13], [13, 16], [14, 15], [11, 14],
];

export const TOPOLOGY_HUB_INDEX = 13;
export const TOPOLOGY_VIEWBOX = { w: 1000, h: 640 } as const;
