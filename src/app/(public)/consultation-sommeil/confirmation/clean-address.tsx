"use client";

import { useEffect } from "react";

/**
 * Puts the page's fixed address in the address bar (JAM-352). The calendar
 * can add the name and the e-mail address of the visitor to the address that
 * it sends them back to. This component does not read them: it replaces the
 * address with `path`, so a copy, a bookmark or a share of the page carries
 * no personal data. It draws nothing.
 */
export function CleanAddress({ path }: { path: string }) {
  useEffect(() => {
    window.history.replaceState(null, "", path);
  }, [path]);
  return null;
}
