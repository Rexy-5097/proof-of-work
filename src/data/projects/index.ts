import { adityanet } from "./adityanet";
import { cartograph } from "./cartograph";
import { furnitureops } from "./furnitureops";
import { geofence } from "./geofence";
import { nexus } from "./nexus";
import { astra } from "./astra";
import { ddso } from "./ddso";
import { helios } from "./helios";
import { assertEvidence } from "../assert";
import type { Project } from "../types";

/**
 * The examined cases, in audit order — newest and strongest first, so a
 * reviewer meets the current work before the archive. Helios is the
 * interlude and is deliberately not a numbered case.
 */
export const chapters: Project[] = [
  adityanet,
  cartograph,
  furnitureops,
  geofence,
  nexus,
  astra,
  ddso,
];

export { helios };

export const flagshipProjects: Project[] = [...chapters, helios];

for (const p of flagshipProjects) {
  assertEvidence(p.claims, `data/projects/${p.slug}`);
}
