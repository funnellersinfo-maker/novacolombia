import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/auth/me — usuario de la sesión actual
export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return ok({ user: null });
  return ok({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
  });
}
