import "server-only";
import { SignJWT, jwtVerify } from "jose";

function getEncodedKey() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("CRITICAL: SESSION_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export async function encrypt(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getEncodedKey());
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}
