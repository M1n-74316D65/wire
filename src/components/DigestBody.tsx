/** Render a daily digest (opening line, labeled sections, items) as HTML. */
export function DigestBody({ text }: { text: string }) {
  const blocks = splitBlocks(text);

  return (
    <div className="digest">
      {blocks.map((block, i) =>
        block.type === "label" ? (
          <h3 key={i} className="digest__label">
            {block.text}
          </h3>
        ) : block.type === "list" ? (
          <ul key={i} className="digest__list">
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="digest__p">
            {block.text}
          </p>
        ),
      )}
    </div>
  );
}

type Block =
  | { type: "p"; text: string }
  | { type: "label"; text: string }
  | { type: "list"; items: string[] };

/**
 * A section label is a short, lowercase, single-token line that does not end
 * with sentence punctuation — e.g. "tech", "world", "spain". Everything else
 * is flowing text or a bullet list.
 */
function splitBlocks(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let bullets: string[] = [];

  const flushPara = () => {
    const t = para.join(" ").trim();
    if (t) blocks.push({ type: "p", text: t });
    para = [];
  };
  const flushList = () => {
    if (bullets.length) blocks.push({ type: "list", items: bullets });
    bullets = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
  };

  for (const line of lines) {
    const bullet = line.match(/^\s*[-–—•*]\s+(.+)$/);
    if (bullet) {
      flushPara();
      bullets.push(bullet[1].trim());
      continue;
    }
    if (!line.trim()) {
      flushAll();
      continue;
    }
    const trimmed = line.trim();
    if (isLabel(trimmed)) {
      flushAll();
      blocks.push({ type: "label", text: trimmed });
      continue;
    }
    flushList();
    para.push(trimmed);
  }
  flushAll();

  return blocks;
}

function isLabel(line: string): boolean {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  if (line.length > 20) return false;
  // Must not look like a sentence: ends with punctuation, or has 3+ words.
  if (/[.!?…:]\s*$/.test(line)) return false;
  if (words.length > 2) return false;
  // Lowercase, letters/digits/spaces only (no leading article-like capital).
  if (!/^[a-z0-9][a-z0-9\- ]*$/.test(line)) return false;
  return true;
}
