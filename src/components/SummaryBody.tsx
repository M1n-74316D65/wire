/** Render a plain-text brief (paragraphs + "- " bullets) as structured HTML. */
export function SummaryBody({ text }: { text: string }) {
  const blocks = splitBlocks(text);

  return (
    <div className="brief">
      {blocks.map((block, i) =>
        block.type === "list" ? (
          <ul key={i} className="brief__list">
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="brief__p">
            {block.text}
          </p>
        ),
      )}
    </div>
  );
}

type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] };

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

  for (const line of lines) {
    const bullet = line.match(/^\s*[-–—•*]\s+(.+)$/);
    if (bullet) {
      flushPara();
      bullets.push(bullet[1].trim());
      continue;
    }
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return blocks;
}
