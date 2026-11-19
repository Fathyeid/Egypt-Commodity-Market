import { Fragment } from "react";

/** Latin-script runs (words, slashes, spaces between them) inside Arabic text. */
const LATIN_RUN = /([A-Za-zÀ-ɏ][A-Za-zÀ-ɏ0-9'’\-]*(?:[ /]+[A-Za-zÀ-ɏ0-9][A-Za-zÀ-ɏ0-9'’\-]*)*)/g;

/**
 * Renders mixed Arabic/Latin text with each Latin run isolated (<bdi dir="ltr">),
 * so English/German fragments keep their order inside right-to-left sentences.
 */
export function Bidi({ text }: { text: string }) {
  const parts = text.split(LATIN_RUN);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <bdi key={i} dir="ltr">
            {p}
          </bdi>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
