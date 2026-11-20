import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { fill } from "@/content/locale";
import { professionnelle } from "@/content/professionnelle";

import { RemoveFile } from "./remove-file";

/**
 * JAM-343: a press on « Retirer » removed the file at once. The removal now
 * waits for the answer of the confirmation dialog. These tests run without a
 * DOM, so they hold what the server render shows: the button, a closed dialog,
 * and nothing removed. The press on each answer is a test for the browser.
 */

const t = professionnelle.fr.justificatifs;

function render(props: { busy?: boolean; disabled?: boolean; onRemove?: () => void }) {
  return renderToStaticMarkup(
    createElement(RemoveFile, { fileName: "diplome.pdf", onRemove: () => {}, ...props }),
  );
}

describe("the removal of a file", () => {
  it("shows the button and keeps the dialog closed", () => {
    const html = render({});
    expect(html).toContain(`>${t.retirer}</button>`);
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain(t.retrait.titre);
    expect(html).not.toContain(t.retrait.confirmer);
  });

  it("removes nothing before an answer", () => {
    const onRemove = vi.fn();
    render({ onRemove });
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("disables the button on a locked file", () => {
    expect(render({ disabled: true })).toMatch(/<button[^>]* disabled=""/);
  });

  it("keeps the button focusable while the slot is busy", () => {
    const html = render({ busy: true });
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toMatch(/<button[^>]* disabled=""/);
  });
});

describe("the words of the confirmation", () => {
  it("names the file and says that it leaves her dossier", () => {
    expect(fill(t.retrait.description, { fichier: "diplome.pdf" })).toBe(
      "Le fichier « diplome.pdf » sera retiré de votre dossier.",
    );
  });

  it("has a different answer for each choice", () => {
    expect(t.retrait.confirmer).toMatch(/^Oui, /);
    expect(t.retrait.annuler).toMatch(/^Non, /);
  });
});
