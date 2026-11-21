import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// Runtime volume contents are never build inputs.
const DEFAULT_STORAGE_DIR =
  process.env.VERCEL === "1" ? "/tmp/ucteknik-storage" : "./storage";
export const STORAGE_ROOT = path.resolve(
  /* turbopackIgnore: true */ process.env.STORAGE_DIR ?? DEFAULT_STORAGE_DIR
);
const ROOT = STORAGE_ROOT;

function resolveKey(key: string): string {
  if (!key || typeof key !== "string" || key.includes("\0") || path.isAbsolute(key) || /^[a-zA-Z]:/.test(key)) {
    throw new Error("Geçersiz depo anahtarı");
  }
  const normalized = path.posix.normalize(key.replace(/\\/g, "/"));
  if (normalized === "." || normalized === ".." || normalized.startsWith("../")) {
    throw new Error("Geçersiz depo anahtarı");
  }
  const full = path.resolve(ROOT, normalized);
  if (full === ROOT || !full.startsWith(ROOT + path.sep)) {
    throw new Error("Geçersiz depo anahtarı");
  }
  return full;
}

export async function putFile(key: string, data: Buffer | Uint8Array): Promise<{ key: string; sha256: string; size: number }> {
  const full = resolveKey(key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  const buf = Buffer.from(data);
  const tempPath = `${full}.tmp-${crypto.randomUUID()}`;
  try {
    await fs.writeFile(tempPath, buf);
    await fs.rename(tempPath, full);
  } catch (err) {
    await fs.unlink(tempPath).catch(() => {});
    throw err;
  }
  return { key, sha256: crypto.createHash("sha256").update(buf).digest("hex"), size: buf.length };
}

export async function getFile(key: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(/* turbopackIgnore: true */ resolveKey(key));
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

export async function deleteFile(key: string): Promise<boolean> {
  try {
    await fs.unlink(resolveKey(key));
    return true;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      return false;
    }
    throw err;
  }
}
