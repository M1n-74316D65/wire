/** An error whose message is written for the reader and safe to show as-is. */
export class DeskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeskError";
  }
}

/**
 * Message to render on the page. Our own errors pass through; provider and
 * network errors are flattened, because their text carries base URLs, model
 * names and key fragments the reader should never see.
 */
export function readerMessage(err: unknown, fallback: string): string {
  return err instanceof DeskError ? err.message : fallback;
}
