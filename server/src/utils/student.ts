import { getDb } from "../db";

export function studentExists(id: string) {
  const db = getDb();

  return db
    .prepare("SELECT id FROM students WHERE id = ?")
    .get(id);
}