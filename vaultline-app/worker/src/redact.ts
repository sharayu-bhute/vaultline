export function redactSecrets(text: string): string {
  return text
    .replace(/\b[A-Za-z0-9_\-\/+=]{20,}\b/g, (match) => maskValue(match))
    .replace(
      /\b(sk-[a-zA-Z0-9\-]+|ghp_[A-Za-z0-9]+|gsk_[A-Za-z0-9]+|AKIA[A-Z0-9]{16})\b/g,
      (match) => maskValue(match)
    );
}

function maskValue(value: string): string {
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}