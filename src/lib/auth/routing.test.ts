import { describe, expect, it } from "vitest";

import {
  accessFor,
  homeFor,
  landingFor,
  safeReturnPath,
  signInWithReturn,
} from "./routing";

describe("each role lands on its own space (spec)", () => {
  it("maps parent, professionnel and admin to their spaces", () => {
    expect(homeFor("parent")).toBe("/espace/famille");
    expect(homeFor("professionnel")).toBe("/espace/professionnelle");
    expect(homeFor("admin")).toBe("/admin");
  });

  it("lets each role into its own space", () => {
    expect(accessFor("parent", "/espace/famille")).toEqual({ kind: "allow" });
    expect(accessFor("professionnel", "/espace/professionnelle")).toEqual({ kind: "allow" });
    expect(accessFor("admin", "/admin")).toEqual({ kind: "allow" });
  });

  it("redirects a parent on the professional space to the family space", () => {
    expect(accessFor("parent", "/espace/professionnelle")).toEqual({
      kind: "redirect",
      to: "/espace/famille",
    });
  });

  it("answers 404 on /admin to a parent, a professional and a signed-out visitor", () => {
    expect(accessFor("parent", "/admin")).toEqual({ kind: "not-found" });
    expect(accessFor("professionnel", "/admin/utilisateurs")).toEqual({ kind: "not-found" });
    expect(accessFor(null, "/admin")).toEqual({ kind: "not-found" });
  });

  it("sends a signed-out visitor on a space to sign-in, with the way back", () => {
    expect(accessFor(null, "/espace/famille")).toEqual({
      kind: "redirect",
      to: "/connexion?retour=%2Fespace%2Ffamille",
    });
  });

  it("opens the family profile to a parent only", () => {
    expect(accessFor("parent", "/espace/famille/profil")).toEqual({ kind: "allow" });
    expect(accessFor("professionnel", "/espace/famille/profil")).toEqual({
      kind: "redirect",
      to: "/espace/professionnelle",
    });
    expect(accessFor("admin", "/espace/famille/profil")).toEqual({
      kind: "redirect",
      to: "/admin",
    });
    expect(accessFor(null, "/espace/famille/profil")).toEqual({
      kind: "redirect",
      to: "/connexion?retour=%2Fespace%2Ffamille%2Fprofil",
    });
  });

  it.each([
    "/espace/famille/demandes",
    "/espace/famille/demandes/nouvelle",
    "/espace/famille/demandes/0b8f3c3e-2a51-4a7e-9d33-5d2f3b1c9a10/modifier",
  ])("opens the family's requests to a parent only: %s", (path) => {
    expect(accessFor("parent", path)).toEqual({ kind: "allow" });
    expect(accessFor("professionnel", path)).toEqual({ kind: "redirect", to: "/espace/professionnelle" });
    expect(accessFor("admin", path)).toEqual({ kind: "redirect", to: "/admin" });
    expect(accessFor(null, path)).toEqual({
      kind: "redirect",
      to: `/connexion?retour=${encodeURIComponent(path)}`,
    });
  });

  it("opens the requests of a professional's zone to a professional only", () => {
    const path = "/espace/professionnelle/demandes";
    expect(accessFor("professionnel", path)).toEqual({ kind: "allow" });
    expect(accessFor("parent", path)).toEqual({ kind: "redirect", to: "/espace/famille" });
    expect(accessFor("admin", path)).toEqual({ kind: "redirect", to: "/admin" });
    expect(accessFor(null, path)).toEqual({
      kind: "redirect",
      to: "/connexion?retour=%2Fespace%2Fprofessionnelle%2Fdemandes",
    });
  });

  it("does not mistake a lookalike path for a space", () => {
    expect(accessFor("admin", "/administration")).toEqual({
      kind: "redirect",
      to: "/admin",
    });
  });
});

describe("after signing in, the user lands back where they were going (spec)", () => {
  it("honours a return path the role may open", () => {
    expect(landingFor("parent", "/espace/famille/demandes")).toBe("/espace/famille/demandes");
  });

  it("falls back to the role's space when the return path is another role's", () => {
    expect(landingFor("parent", "/admin")).toBe("/espace/famille");
    expect(landingFor("professionnel", "/espace/famille")).toBe("/espace/professionnelle");
  });

  it("never sends anyone to another origin", () => {
    for (const hostile of ["//evil.example", "https://evil.example", "/\\evil", "espace"]) {
      expect(safeReturnPath(hostile)).toBeNull();
      expect(landingFor("parent", hostile)).toBe("/espace/famille");
    }
  });

  it("only keeps paths inside a space", () => {
    expect(safeReturnPath("/tarifs")).toBeNull();
    expect(signInWithReturn("/tarifs")).toBe("/connexion");
  });
});
