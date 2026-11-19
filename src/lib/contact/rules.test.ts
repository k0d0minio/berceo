import { afterEach, describe, expect, it, vi } from "vitest";

import { contactEnabled, contactRecipient } from "./config";
import { contactErrors, MESSAGE_MAX, readContact, TRAP_FIELD } from "./rules";

/**
 * Spec (JAM-327, the contact page): three required fields, a message of 2,000
 * characters at most, a trap field, and no page where `CONTACT_EMAIL` is empty.
 */

const valid = { nom: "Camille", email: "camille@example.com", message: "Bonjour." };

describe("the contact form's fields", () => {
  it("lets a complete message go", () => {
    expect(contactErrors(valid)).toEqual({});
  });

  it("blocks each empty field", () => {
    expect(contactErrors({ nom: "", email: "", message: "" })).toEqual({
      nom: "nom",
      email: "email",
      message: "message",
    });
  });

  it.each(["camille", "camille@", "@example.com", "camille@example", "a b@example.com", "a@example.com\nBcc: x@example.com"])(
    "blocks the malformed address %s",
    (email) => {
      expect(contactErrors({ ...valid, email })).toEqual({ email: "email" });
    },
  );

  it("blocks a message past 2,000 characters, and takes one of exactly 2,000", () => {
    expect(contactErrors({ ...valid, message: "a".repeat(MESSAGE_MAX) })).toEqual({});
    expect(contactErrors({ ...valid, message: "a".repeat(MESSAGE_MAX + 1) })).toEqual({ message: "messageLong" });
  });

  it("reads the form trimmed, with the trap field", () => {
    const form = new FormData();
    form.set("nom", "  Camille ");
    form.set("email", " camille@example.com ");
    form.set("message", " Bonjour. ");
    form.set(TRAP_FIELD, "http://spam.example");
    expect(readContact(form)).toEqual({ ...valid, trap: "http://spam.example" });
  });
});

describe("the contact address of the environment", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("has no page where CONTACT_EMAIL is empty", () => {
    vi.stubEnv("CONTACT_EMAIL", "");
    expect(contactRecipient()).toBeNull();
    expect(contactEnabled()).toBe(false);
    vi.stubEnv("CONTACT_EMAIL", "   ");
    expect(contactEnabled()).toBe(false);
  });

  it("has the page where CONTACT_EMAIL is set", () => {
    vi.stubEnv("CONTACT_EMAIL", " equipe@example.com ");
    expect(contactRecipient()).toBe("equipe@example.com");
    expect(contactEnabled()).toBe(true);
  });
});
