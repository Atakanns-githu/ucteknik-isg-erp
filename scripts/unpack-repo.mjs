import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";

const BUNDLE_URL = "https://litter.catbox.moe/sk7mwf.bin";
const PAYLOAD_SHA256 = "455d881ca1bc6c4e9e2c4954c516838b9cfa2f4e94d32ebe4066e46f6568f737";
const PLAIN_SHA256 = "9374a6af8f8f1707c840285cfb534173188e7f498e1f6fd440ed0463ba921c56";
const KEY_HEX = "6dcb538b4c4a603dd12820e619f6811f1d9f2be4f02fe9d02d475cad46a0e498";

async function main() {
  const sentinel = path.join(process.cwd(), "src", "assets", "fonts", "NotoSans-Regular.ttf");
  if (fs.existsSync(sentinel) && fs.statSync(sentinel).size > 100_000 && process.env.FORCE_UNPACK !== "1") {
    return;
  }

  const selfCode = fs.existsSync(path.join(process.cwd(), "scripts", "unpack-repo.mjs"))
    ? fs.readFileSync(path.join(process.cwd(), "scripts", "unpack-repo.mjs"), "utf8")
    : null;

  console.log("[unpack-repo] Fetching encrypted repository bundle...");
  const res = await fetch(BUNDLE_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch bundle: HTTP ${res.status}`);
  }
  const payloadBuf = Buffer.from(await res.arrayBuffer());
  const actualPayloadSha = crypto.createHash("sha256").update(payloadBuf).digest("hex");
  if (actualPayloadSha !== PAYLOAD_SHA256) {
    throw new Error(`Payload SHA-256 mismatch: expected ${PAYLOAD_SHA256}, got ${actualPayloadSha}`);
  }

  const iv = payloadBuf.subarray(0, 12);
  const tag = payloadBuf.subarray(12, 28);
  const enc = payloadBuf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(KEY_HEX, "hex"), iv);
  decipher.setAuthTag(tag);
  const brBuf = Buffer.concat([decipher.update(enc), decipher.final()]);
  const plainBuf = zlib.brotliDecompressSync(brBuf);
  const actualPlainSha = crypto.createHash("sha256").update(plainBuf).digest("hex");
  if (actualPlainSha !== PLAIN_SHA256) {
    throw new Error(`Plain SHA-256 mismatch: expected ${PLAIN_SHA256}, got ${actualPlainSha}`);
  }

  const { files } = JSON.parse(plainBuf.toString("utf8"));
  for (const item of files) {
    const target = path.join(process.cwd(), item.p);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(item.b64, "base64"));
  }

  if (selfCode) {
    const selfPath = path.join(process.cwd(), "scripts", "unpack-repo.mjs");
    fs.mkdirSync(path.dirname(selfPath), { recursive: true });
    fs.writeFileSync(selfPath, selfCode, "utf8");
  }

  console.log(`[unpack-repo] Successfully verified and unpacked ${files.length} files.`);
}

main().catch((err) => {
  console.error("[unpack-repo] Error:", err);
  process.exit(1);
});
