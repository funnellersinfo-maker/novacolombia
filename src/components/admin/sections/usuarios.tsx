"use client";

// Sección Usuarios — búsqueda, cambio de rol y activación/desactivación.
// API: GET/PATCH /api/admin/users.

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { Search, ShieldCheck, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useApp } from "@/store/app";
import { fmtCOP, fmtDate } from "@/lib/format";
import {
  ConfirmAction, EmptyBlock, ErrorBlock, Field, LoadingBlock, PageHeader, Pager,
  toastError, useAdminQuery, useDebounced, type AdminUser,
} from "../ui";

type UsersResponse = { users: AdminUser[]; total: number; page: number; pages: number };

export function UsuariosSection() {
  const me = useApp((s) => s.user);
  const [qInput, setQInput] = useState("");
  const q = useDebounced(qInput);
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const path = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    p.set("page", String(page));
    return `/api/admin/users?${p.toString()}`;
  }, [q, page]);

  const { data, loading, error, refetch } = useAdminQuery<UsersResponse>(path);
  const users = data?.users ?? [];

  async function patchUser(u: AdminUser, body: { role?: string; active?: boolean }, msg: string) {
    setBusyId(u.id);
    try {
      await api.patch("/api/admin/users", { id: u.id, ...body });
      toast.success(msg);
      refetch();
    } catch (e) {
      toastError(e);
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Usuarios" desc="Cuentas de clientes y administradores de la tienda." />

      <div className="card-pop-sm mb-4 rounded-2xl bg-card p-3">
        <Field label="Búsqueda" className="max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={qInput}
              onChange={(e) => { setQInput(e.target.value); setPage(1); }}
              placeholder="Nombre o correo…"
              className="rounded-xl border-2 border-input pl-9"
            />
          </div>
        </Field>
      </div>

      {loading ? <LoadingBlock rows={6} /> : null}
      {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}
      {!loading && !error && data && users.length === 0 ? (
        <EmptyBlock title="Sin usuarios" desc="Ninguna cuenta coincide con la búsqueda." />
      ) : null}

      {!loading && !error && data && users.length > 0 ? (
        <>
          {/* ── Tabla desktop ── */}
          <div className="card-pop hidden overflow-hidden rounded-2xl bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-ink bg-muted/60 [&>th]:font-extrabold [&>th]:text-muted-foreground">
                  <TableHead>Usuario</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead className="text-right">Total gastado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Activo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const self = u.id === me?.id;
                  return (
                    <TableRow key={u.id} className="border-b border-dashed border-input last:border-0">
                      <TableCell>
                        <p className="flex items-center gap-1.5 text-xs font-bold">
                          {u.name}
                          {self ? <span className="sticker">tú</span> : null}
                          {u.role === "ADMIN" ? <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-label="Administrador" /> : null}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{u.email}</p>
                      </TableCell>
                      <TableCell className="text-xs">{u.phone || "—"}</TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(v) => void patchUser(u, { role: v }, `Rol de ${u.name} actualizado.`)}
                          disabled={busyId === u.id || self}
                        >
                          <SelectTrigger className="w-36 rounded-xl border-2 border-input text-xs" aria-label={`Rol de ${u.name}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUSTOMER">Cliente</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right text-xs font-extrabold tabular-nums">{u.orderCount}</TableCell>
                      <TableCell className="text-right text-xs font-extrabold tabular-nums">{fmtCOP(u.totalSpent)}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground">{fmtDate(u.createdAt)}</TableCell>
                      <TableCell>
                        {self ? (
                          <span className="text-[11px] italic text-muted-foreground">protegido</span>
                        ) : (
                          <ConfirmAction
                            render={(open) => (
                              <Switch
                                checked={u.active}
                                onCheckedChange={(v) => (v ? void patchUser(u, { active: true }, `${u.name} activado.`) : open())}
                                disabled={busyId === u.id}
                                aria-label={`Activar ${u.name}`}
                              />
                            )}
                            title="¿Desactivar usuario?"
                            desc={`${u.name} (${u.email}) no podrá iniciar sesión hasta que lo reactives.`}
                            confirmLabel="Desactivar"
                            onConfirm={() => patchUser(u, { active: false }, `${u.name} desactivado.`)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* ── Tarjetas móviles ── */}
          <div className="space-y-2 md:hidden">
            {users.map((u) => {
              const self = u.id === me?.id;
              return (
                <div key={u.id} className="card-pop-sm rounded-2xl bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-bold">
                        {u.name}
                        {self ? <span className="sticker">tú</span> : null}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{u.phone || "sin teléfono"} · desde {fmtDate(u.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Select
                        value={u.role}
                        onValueChange={(v) => void patchUser(u, { role: v }, `Rol de ${u.name} actualizado.`)}
                        disabled={busyId === u.id || self}
                      >
                        <SelectTrigger className="h-8 w-32 rounded-xl border-2 border-input text-xs" aria-label={`Rol de ${u.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUSTOMER">Cliente</SelectItem>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t-2 border-dashed border-input pt-2">
                    <p className="text-[11px] text-muted-foreground">
                      {u.orderCount} pedido(s) · {fmtCOP(u.totalSpent)}
                    </p>
                    {self ? (
                      <span className="text-[11px] italic text-muted-foreground">protegido</span>
                    ) : (
                      <ConfirmAction
                        render={(open) => (
                          <Switch
                            checked={u.active}
                            onCheckedChange={(v) => (v ? void patchUser(u, { active: true }, `${u.name} activado.`) : open())}
                            disabled={busyId === u.id}
                            aria-label={`Activar ${u.name}`}
                          />
                        )}
                        title="¿Desactivar usuario?"
                        desc={`${u.name} (${u.email}) no podrá iniciar sesión hasta que lo reactives.`}
                        confirmLabel="Desactivar"
                        onConfirm={() => patchUser(u, { active: false }, `${u.name} desactivado.`)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} disabled={loading} />
        </>
      ) : null}

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <UserCog className="h-3.5 w-3.5" aria-hidden />
        El sistema impide quitarte tus propios permisos de administración.
      </p>
    </div>
  );
}
