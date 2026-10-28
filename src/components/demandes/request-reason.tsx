/*
 * The family's optional reason (demande-motif-facultatif), under the request
 * card on her own request page and on the professional's request page. Never
 * on a card, in a digest or in an e-mail. The text keeps its line breaks.
 */
function RequestReason({ title, reason }: { title: string; reason: string }) {
  return (
    <section className="flex max-w-2xl flex-col gap-2 rounded-carte border border-solid border-perle bg-blanc px-6 py-6 md:px-8">
      <h2 className="text-corps font-semibold text-encre-taupe">{title}</h2>
      <p className="text-corps whitespace-pre-line break-words text-encre-taupe">{reason}</p>
    </section>
  )
}

export { RequestReason }
