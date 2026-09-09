import { Fragment } from "react";

const URL_REGEX = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/gi;

function toHref(match: string) {
  return match.startsWith("www.") ? `https://${match}` : match;
}

/** Renderiza texto simples detectando URLs e transformando-as em links clicáveis. */
export function Linkify({ text, className }: { text: string; className?: string }) {
  // URL_REGEX tem um grupo de captura, então split() intercala texto comum
  // (índices pares) com as URLs casadas (índices ímpares).
  const parts = text.split(URL_REGEX);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={toHref(part)}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80 break-all"
          >
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </span>
  );
}
