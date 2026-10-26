import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/categories/[id]
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const { id } = await ctx.params;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return fail("Cuerpo inválido.");

  const category = await db.category.findUnique({ where: { id } });
  if (!category) return fail("Categoría no encontrada.", 404);

  const data: Record<string, unknown> = {};
  if (body.name != null) {
    const name = String(body.name).trim();
    if (name.length < 3) return fail("Nombre muy corto.", 422);
    data.name = name;
  }
  if (body.description != null) data.description = String(body.description).trim();
  if (body.icon != null) data.icon = String(body.icon);
  if (body.color != null) data.color = String(body.color);
  if (body.sortOrder !== undefined) data.sortOrder = Math.round(Number(body.sortOrder));
  if (body.active !== undefined) data.active = body.active === true;

  const updated = await db.category.update({ where: { id }, data });
  await logAdmin(admin, "category.update", "Category", id, updated.name);
  return ok({ category: updated });
}

// DELETE /api/admin/categories/[id] — solo si no tiene productos
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const { id } = await ctx.params;
  const category = await db.category.findUnique({ where: { id } });
  if (!category) return fail("Categoría no encontrada.", 404);

  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return fail(`No se puede eliminar: tiene ${count} producto(s). Ocúltala o mueve los productos.`, 409);
  }

  await db.category.delete({ where: { id } });
  await logAdmin(admin, "category.delete", "Category", id, category.name);
  return ok({ deleted: true });
}
