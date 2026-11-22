export function ErrorMessages({
  messages,
}: {
  messages: Array<string | null | undefined>;
}) {
  const seen = new Set<string>();
  const unique = messages.filter((message) => {
    if (!message || seen.has(message)) return false;
    seen.add(message);
    return true;
  });

  if (unique.length === 0) return null;

  return (
    <>
      {unique.map((message) => (
        <p key={message} className="error" role="alert">
          Error: {message}
        </p>
      ))}
    </>
  );
}
