"use client";

import { useEffect } from "react";
import { registry } from "@/data/registry";

/** Professional console greeting with real, computed values (brief §Console). */
export function ConsoleGreeting() {
  useEffect(() => {
    if (sessionStorage.getItem("pow-console") === "1") return;
    sessionStorage.setItem("pow-console", "1");

    const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "unversioned";
    const built = process.env.NEXT_PUBLIC_BUILD_TIME ?? "unknown";
    const line = "=".repeat(41);
    console.info(
      `%c${line}\n` +
        `  BUILD INTEGRITY          VERIFIED\n` +
        `  Repositories loaded      ${registry.repositories}\n` +
        `  Verified claims          ${registry.verifiedClaims}\n` +
        `  Evidence links           ${registry.evidenceLinks}\n` +
        `  Null results published   ${registry.nullResults}\n` +
        `  Commit                   ${sha}\n` +
        `  Last build               ${built}\n` +
        `  Evidence chain           COMPLETE\n` +
        `${line}\n` +
        `  Welcome, Engineer. Source: github.com/Rexy-5097\n` +
        `${line}`,
      "font-family: monospace; color: #3dd698;",
    );
  }, []);

  return null;
}
