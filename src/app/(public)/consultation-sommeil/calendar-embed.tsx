"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { Button } from "@/components/ui/button";
import { embedAddress, isBookingMessage } from "@/lib/consultation-sommeil/embed";

type Labels = {
  bouton: string;
  service: string;
  cadre: string;
  confirme: { title: string; text: string; accueil: string; espace: string };
};

/**
 * The calendar of the consultation page (JAM-352). At first it is one button
 * and one sentence that names Calendly: the page makes no request to Calendly
 * before the visitor's click. The click puts a plain `<iframe>` of the
 * calendar in the page. No script and no stylesheet of Calendly is loaded.
 *
 * With no JavaScript, or where the calendar is not a page of Calendly
 * (`embed` is false), the button is a plain link that opens the calendar in
 * the same tab.
 *
 * When Calendly posts the message of a booking, the confirmation of Berceo
 * shows above the frame. The handler gives the message to `isBookingMessage`,
 * which reads the event's name only, and keeps nothing of it. If no message
 * comes, the visitor sees Calendly's own confirmation in the frame.
 */
export function CalendarEmbed({
  url,
  embed,
  labels,
  homePath,
  spacePath,
}: {
  url: string;
  embed: boolean;
  labels: Labels;
  homePath: string;
  spacePath: string;
}) {
  const [frame, setFrame] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const confirmation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!frame) return;
    function onMessage(event: MessageEvent) {
      if (isBookingMessage(event.origin, event.data)) setBooked(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frame]);

  useEffect(() => {
    if (booked) confirmation.current?.focus();
  }, [booked]);

  function open(event: MouseEvent<HTMLAnchorElement>) {
    if (!embed) return;
    event.preventDefault();
    setFrame(embedAddress(url, window.location.host));
  }

  if (!frame) {
    return (
      <div className="flex flex-col gap-4">
        <Button asChild className="self-start">
          <a href={url} rel="noreferrer" onClick={open}>
            {labels.bouton}
          </a>
        </Button>
        <p className="max-w-3xl text-taupe">{labels.service}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {booked ? (
        <div
          ref={confirmation}
          tabIndex={-1}
          role="status"
          className="flex scroll-mt-24 flex-col gap-4 rounded-carte bg-perle p-6 text-taupe md:p-8"
        >
          <h3 className="font-sans text-h3 font-bold text-balance">{labels.confirme.title}</h3>
          <p>{labels.confirme.text}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild>
              <Link href={homePath}>{labels.confirme.accueil}</Link>
            </Button>
            <Button asChild>
              <Link href={spacePath}>{labels.confirme.espace}</Link>
            </Button>
          </div>
        </div>
      ) : null}
      <iframe
        src={frame}
        title={labels.cadre}
        loading="lazy"
        referrerPolicy="strict-origin"
        className="h-[1100px] w-full rounded-carte border border-solid border-perle bg-blanc md:h-[760px]"
      />
      <p className="max-w-3xl text-taupe">{labels.service}</p>
    </div>
  );
}
