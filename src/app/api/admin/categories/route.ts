import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { categoryToDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// GET /api/admin/categories — incluye inactivas y conteos
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.product.findMany({ where: { active: true }, select: { categoryId: true, subcategory: true } }),
  ]);

  const counts = new Map<string, number>();
  const subs = new Map<string, Set<string>>();
  for (const p of products) {
    counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
    if (p.subcategory) {
      if (!subs.has(p.categoryId)) subs.set(p.categoryId, new Set());
      subs.get(p.categoryId)!.add(p.subcategory);
    }
  }

  return ok({
    categories: categories.map((c) =>
      categoryToDTO(c, counts.get(c.id) ?? 0, Array.from(subs.get(c.id) ?? []).sort())
    ),
  });
}

// POST /api/admin/categories — crear categoría
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const body = await readJson<Record<string, unknown>>(req);
  const name = String(body?.name ?? "").trim();
  if (name.length < 3) return fail("El nombre de la categoría es muy corto.", 422);

  let slug = String(body?.slug ?? "").trim() || slugify(name);
  if (await db.category.findUnique({ where: { slug } })) {
    return fail("Ya existe una categoría con ese identificador.", 409);
  }

  const maxOrder = await db.category.aggregate({ _max: { sortOrder: true } });
  const category = await db.category.create({
    data: {
      slug,
      name,
      description: String(body?.description ?? "").trim(),
      icon: String(body?.icon ?? "Tag"),
      color: String(body?.color ?? "#FF5A36"),
      special: body?.special ? String(body.special) : null,
      sortOrder: body?.sortOrder != null ? Math.round(Number(body.sortOrder)) : (maxOrder._max.sortOrder ?? 0) + 1,
      active: body?.active !== false,
    },
  });

  await logAdmin(admin, "category.create", "Category", category.id, name);
  return ok({ category });
}
