import { describe, expect, it, vi } from "vitest";

import { serveFile, type ServeDeps, type StoredFile, type Viewer } from "./serve";

/**
 * Spec: `/api/fichiers/[id]` returns the file to its owner and to an admin,
 * and 404 to a signed-out visitor, a parent, and another professional.
 */

const ID = "7d5f7a38-2d0c-4c4e-9b7e-5f3b0f1d2a11";
const OWNER = "owner-user";

const file: StoredFile = {
  ownerUserId: OWNER,
  storageKey: "profils/p1/k1",
  contentType: "application/pdf",
  fileName: "diplôme.pdf",
};

function deps(viewer: Viewer, found: StoredFile | null = file): ServeDeps & { read: ReturnType<typeof vi.fn> } {
  return {
    viewer: async () => viewer,
    findFile: async () => found,
    read: vi.fn(async () => new Blob(["%PDF-1.4"]).stream()),
  };
}

describe("serveFile", () => {
  it("streams the file to its owner", async () => {
    const d = deps({ id: OWNER, role: "professionnel" });
    const response = await serveFile(ID, d);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.text()).toBe("%PDF-1.4");
    expect(d.read).toHaveBeenCalledWith("profils/p1/k1");
  });

  it("streams the file to an admin", async () => {
    const response = await serveFile(ID, deps({ id: "admin", role: "admin" }));
    expect(response.status).toBe(200);
  });

  it.each<[string, Viewer]>([
    ["a signed-out visitor", null],
    ["a parent", { id: "parent", role: "parent" }],
    ["another professional", { id: "someone-else", role: "professionnel" }],
  ])("answers 404 to %s and reads nothing", async (_who, viewer) => {
    const d = deps(viewer);
    const response = await serveFile(ID, d);
    expect(response.status).toBe(404);
    expect(d.read).not.toHaveBeenCalled();
  });

  it("answers 404 to an unknown id or a malformed one", async () => {
    expect((await serveFile(ID, deps({ id: OWNER, role: "professionnel" }, null))).status).toBe(404);
    expect((await serveFile("../etc/passwd", deps({ id: "admin", role: "admin" }))).status).toBe(404);
  });

  it("keeps an accented file name readable without breaking the header", async () => {
    const response = await serveFile(ID, deps({ id: OWNER, role: "professionnel" }));
    expect(response.headers.get("content-disposition")).toBe(
      `inline; filename="dipl_me.pdf"; filename*=UTF-8''dipl%C3%B4me.pdf`,
    );
  });
});
