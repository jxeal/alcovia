export function encodeCursor(id: string) {
  return Buffer.from(JSON.stringify({ id })).toString("base64");
}

export function decodeCursor(cursor: string) {
  return JSON.parse(Buffer.from(cursor, "base64").toString());
}