import { describe, expect, it, vi } from "vitest";

import { serveFile, type ServeDeps, type StoredFile, type Viewer } from "./serve";

/**
 * Spec: `/api/fichiers/[id]` returns the file to its owner and to an admin,
 * and 404 to a signed-out visitor, a parent, and another professional.
 * candidature-et-reservation (D-75): a validated professional's photo also
 * goes to a signed-in parent; her documents, and the photo of a profile that
 * is not validated, still answer 404.
 */

const ID = "7d5f7a38-2d0c-4c4e-9b7e-5f3b0f1d2a11";
const OWNER = "owner-user";

const file: StoredFile = {
  ownerUserId: OWNER,
  kind: "diplome",
  profileStatus: "valide",
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

  it("streams a validated professional's photo to a parent, without the file's name", async () => {
    const photo: StoredFile = { ...file, kind: "photo", contentType: "image/webp", fileName: "Sophie-Dupont.webp" };
    const d = deps({ id: "parent", role: "parent" }, photo);
    const response = await serveFile(ID, d);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).not.toContain("Dupont");
  });

  it.each<[string, StoredFile, Viewer]>([
    ["a parent, for the photo of a profile not validated", { ...file, kind: "photo", profileStatus: "en_attente" }, { id: "parent", role: "parent" }],
    ["a signed-out visitor, for a validated photo", { ...file, kind: "photo" }, null],
    ["another professional, for a validated photo", { ...file, kind: "photo" }, { id: "someone-else", role: "professionnel" }],
  ])("answers 404 to %s", async (_who, found, viewer) => {
    const d = deps(viewer, found);
    expect((await serveFile(ID, d)).status).toBe(404);
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

  it("encodes the characters RFC 5987 forbids in filename*", async () => {
    const d = deps({ id: OWNER, role: "professionnel" }, { ...file, fileName: "l'attestation (2025).pdf" });
    const response = await serveFile(ID, d);
    expect(response.headers.get("content-disposition")).toBe(
      `inline; filename="l'attestation (2025).pdf"; filename*=UTF-8''l%27attestation%20%282025%29.pdf`,
    );
  });
});
