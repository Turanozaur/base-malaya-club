/** Plain-text excerpt for page bodies and long strings. */
export function textExcerpt(text: string, maxLength = 160): string {
  const plain = text.replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) return plain;
  const cut = plain.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}
