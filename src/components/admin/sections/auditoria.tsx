"use client";

// Sección Auditoría — registro cronológico de la actividad administrativa.
// API: GET /api/admin/audit.

import { useState } from "react";
import { History } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { fmtDate } from "@/lib/format";
import {
  EmptyBlock, ErrorBlock, LoadingBlock, PageHeader, Pager, useAdminQuery,
  type AdminAuditLog,
} from "../ui";

type AuditResponse = { logs: AdminAuditLog[]; total: number; page: number; pages: number };

const ENTITY_TONES: Record<string, string> = {
  Product: "bg-secondary text-secondary-foreground",
  Category: "bg-secondary text-secondary-foreground",
  Carrier: "bg-muted",
  ShippingZone: "bg-muted",
  Order: "bg-accent",
  Promotion: "bg-accent",
  Media: "bg-accent",
  SiteConfig: "bg-muted",
  User: "bg-success text-success-foreground",
};

function shortId(entityId: string): string {
  if (!entityId) return "—";
  return entityId.length > 12 ? `${entityId.slice(0, 10)}…` : entityId;
}

export function AuditoriaSection() {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useAdminQuery<AuditResponse>(`/api/admin/audit?page=${page}`);
  const logs = data?.logs ?? [];

  return (
    <div>
      <PageHeader title="Auditoría" desc="Trazabilidad de todas las acciones administrativas (más recientes primero).">
        <span className="sticker-flat bg-muted flex items-center gap-1">
          <History className="h-3.5 w-3.5" aria-hidden /> {data ? `${data.total} evento(s)` : "…"}
        </span>
      </PageHeader>

      {loading ? <LoadingBlock rows={8} /> : null}
      {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}
      {!loading && !error && data && logs.length === 0 ? (
        <EmptyBlock title="Sin eventos" desc="Aún no se ha registrado actividad administrativa." />
      ) : null}

      {!loading && !error && data && logs.length > 0 ? (
        <>
          <div className="card-pop overflow-x-auto rounded-2xl bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-ink bg-muted/60 [&>th]:font-extrabold [&>th]:text-muted-foreground">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id} className="border-b border-dashed border-input last:border-0 align-top">
                    <TableCell className="whitespace-nowrap text-[11px] text-muted-foreground">{fmtDate(l.createdAt)}</TableCell>
                    <TableCell>
                      <p className="text-xs font-bold">{l.userName}</p>
                      {l.userEmail ? <p className="text-[11px] text-muted-foreground">{l.userEmail}</p> : null}
                    </TableCell>
                    <TableCell>
                      <span className="sticker-flat bg-muted font-mono text-[10px]">{l.action}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`sticker-flat ${ENTITY_TONES[l.entity] ?? "bg-muted"}`}>{l.entity}</span>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{shortId(l.entityId)}</p>
                    </TableCell>
                    <TableCell className="max-w-80">
                      <p className="whitespace-pre-wrap break-words text-[11px] leading-snug text-muted-foreground">{l.detail || "—"}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} disabled={loading} />
        </>
      ) : null}
    </div>
  );
}
