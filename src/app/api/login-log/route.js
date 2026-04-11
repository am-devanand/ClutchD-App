import { appendFile, access, mkdir } from "node:fs/promises";
import * as path from "node:path";

function toCsvCell(value) {
  const s = String(value ?? "");
  // CSV escaping: double quotes are escaped as double double-quotes.
  return `"${s.replaceAll('"', '""')}"`;
}

export async function POST(request) {
  const { email, role } = await request.json();

  // Security: we never store plaintext passwords.
  const timestamp = Date.now();
  const row = [email, role, timestamp].map(toCsvCell).join(",") + "\n";

  const dir = path.join(process.cwd(), "data");
  const filePath = path.join(dir, "login_attempts.csv");

  await mkdir(dir, { recursive: true });

  // Add header if file doesn't exist yet.
  try {
    await access(filePath);
  } catch {
    await appendFile(
      filePath,
      'email,role,timestamp\n',
      "utf8"
    );
  }

  await appendFile(filePath, row, "utf8");

  return Response.json({ ok: true });
}

