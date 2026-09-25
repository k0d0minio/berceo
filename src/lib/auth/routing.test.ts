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

  it("answers 404 on the verification queue, a file and the journal to anyone but an admin", () => {
    const file = "/admin/dossiers/3f0c9a52-6f2e-4a8b-9d7e-1c2b3a4d5e6f";
    for (const path of ["/admin", file, "/admin/journal"]) {
      for (const role of ["parent", "professionnel", null] as const) {
        expect(accessFor(role, path)).toEqual({ kind: "not-found" });
      }
      expect(accessFor("admin", path)).toEqual({ kind: "allow" });
    }
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

  // Spec (candidature-et-reservation): the family's bookings, a professional's
  // full profile and the priority page are a parent's; the gardes a professional's.
  it.each([
    "/espace/famille/reservations",
    "/espace/famille/reservations/0b8f3c3e-2a51-4a7e-9d33-5d2f3b1c9a10",
    "/espace/famille/professionnelles/0b8f3c3e-2a51-4a7e-9d33-5d2f3b1c9a10",
    "/espace/famille/professionnelles/0b8f3c3e-2a51-4a7e-9d33-5d2f3b1c9a10/priorite",
    // avis-etoiles: the family's rating form.
    "/espace/famille/reservations/0b8f3c3e-2a51-4a7e-9d33-5d2f3b1c9a10/avis",
  ])("opens the family's bookings and the professionals' profiles to a parent only: %s", (path) => {
    expect(accessFor("parent", path)).toEqual({ kind: "allow" });
    expect(accessFor("professionnel", path)).toEqual({ kind: "redirect", to: "/espace/professionnelle" });
    expect(accessFor("admin", path)).toEqual({ kind: "redirect", to: "/admin" });
    expect(accessFor(null, path)).toEqual({
      kind: "redirect",
      to: `/connexion?retour=${encodeURIComponent(path)}`,
    });
  });

  it.each([
    "/espace/professionnelle/gardes",
    "/espace/professionnelle/gardes/0b8f3c3e-2a51-4a7e-9d33-5d2f3b1c9a10",
    // avis-etoiles: the professional's rating form.
    "/espace/professionnelle/gardes/0b8f3c3e-2a51-4a7e-9d33-5d2f3b1c9a10/avis",
  ])("opens a professional's gardes to a professional only: %s", (path) => {
    expect(accessFor("professionnel", path)).toEqual({ kind: "allow" });
    expect(accessFor("parent", path)).toEqual({ kind: "redirect", to: "/espace/famille" });
    expect(accessFor("admin", path)).toEqual({ kind: "redirect", to: "/admin" });
    expect(accessFor(null, path)).toEqual({
      kind: "redirect",
      to: `/connexion?retour=${encodeURIComponent(path)}`,
    });
  });

  // Spec (avis-etoiles, G-03): the founders' list of ratings is an admin's; /admin stays a 404 to anyone else (D-33).
  it("answers 404 on /admin/avis to anyone but an admin", () => {
    expect(accessFor("admin", "/admin/avis")).toEqual({ kind: "allow" });
    for (const role of ["parent", "professionnel", null] as const) {
      expect(accessFor(role, "/admin/avis")).toEqual({ kind: "not-found" });
    }
  });

  it("opens « Mes disponibilités » to a professional only", () => {
    const path = "/espace/professionnelle/disponibilites";
    expect(accessFor("professionnel", path)).toEqual({ kind: "allow" });
    expect(accessFor("parent", path)).toEqual({ kind: "redirect", to: "/espace/famille" });
    expect(accessFor("admin", path)).toEqual({ kind: "redirect", to: "/admin" });
    expect(accessFor(null, path)).toEqual({
      kind: "redirect",
      to: "/connexion?retour=%2Fespace%2Fprofessionnelle%2Fdisponibilites",
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
