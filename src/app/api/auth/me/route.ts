import { NextResponse } from "next/server";
import { getSessionFromCookies, toSafeUser } from "@/lib/auth";
import { findUserById, getStorageMode } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const safeUser = toSafeUser(user);
  if (safeUser.role === "admin") {
    const storageMode = await getStorageMode();
    return NextResponse.json({ user: safeUser, storageMode }, { status: 200 });
  }
  return NextResponse.json({ user: safeUser }, { status: 200 });
}
