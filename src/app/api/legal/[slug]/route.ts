import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, parseJsonField } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/legal/[slug] — documento legal editable
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const row = await db.siteConfig.findUnique({ where: { key: `legal:${slug}` } });
  if (!row) return fail("Documento no encontrado.", 404);
  const doc = parseJsonField<{ title: string; body: string }>(row.value, { title: "", body: "" });
  return ok({ doc });
}
