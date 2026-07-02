import { furnitureops } from "./furnitureops";
import { nexus } from "./nexus";
import { geofence } from "./geofence";
import { astra } from "./astra";
import { ddso } from "./ddso";
import { helios } from "./helios";
import { assertEvidence } from "../assert";
import type { Project } from "../types";

/** The five examined cases, in audit order. Helios is the interlude. */
export const chapters: Project[] = [furnitureops, nexus, geofence, astra, ddso];

export { helios };

export const flagshipProjects: Project[] = [...chapters, helios];

for (const p of flagshipProjects) {
  assertEvidence(p.claims, `data/projects/${p.slug}`);
}
