import { NextResponse } from "next/server";
import { getSessionFromCookies, toSafeUser } from "@/lib/auth";
import { findUserById, getStorageMode } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getSessionFromCookies();
  const storageMode = await getStorageMode();
  if (!session) {
    return NextResponse.json({ user: null, storageMode }, { status: 200 });
  }
  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ user: null, storageMode }, { status: 200 });
  }
  return NextResponse.json(
    { user: toSafeUser(user), storageMode },
    { status: 200 }
  );
}
