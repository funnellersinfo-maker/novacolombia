# NOVA Colombia 🛍️

**Supertienda digital colombiana** — plataforma de e-commerce mobile-first con catálogo
administrable, carrito, checkout de doble modalidad de pago (**contraentrega** según cobertura
y **pago anticipado con 10% de descuento** en productos elegibles), seguimiento de pedidos,
cuenta de cliente y panel administrativo completo.

> **Nota de identidad:** "NOVA Colombia" es un nombre comercial **provisional y editable** desde
> el panel administrativo (marca, colores, textos, banners y dominio). No supone disponibilidad
> legal del nombre.

---

## 🚀 Ejecución

```bash
bun install          # dependencias
bun run db:push      # aplica el esquema Prisma a SQLite (db/custom.db)
bun run db:seed      # catálogo: 18 categorías, 78 productos, 90 zonas, promociones, config
bun run dev          # servidor de desarrollo en http://localhost:3000
bun run lint         # calidad de código
```

## 👤 Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@novacolombia.co` | `NovaAdmin2025*` |
| Cliente | `cliente@ejemplo.co` | `Cliente2025*` |

- La tienda vive en `/` (SPA con hash-routing: `#/c/:categoría`, `#/p/:producto`, `#/carrito`, …).
- El panel administrativo está en `#/admin` (requiere rol ADMIN) con secciones:
  Resumen, Pedidos, Productos, Categorías, Promociones, Envíos, Contenido, Usuarios y Auditoría.
- También puedes comprar **como invitado** (guest checkout habilitado en configuración).

## 🔐 Variables de entorno (`.env`)

| Variable | Valor actual | Descripción |
|---|---|---|
| `DATABASE_URL` | `file:/home/z/my-project/db/custom.db` | SQLite (Prisma) |
| `SESSION_SECRET` | dev | Firma HMAC de las sesiones. **Cambiar en producción.** |
| `PAYMENTS_MODE` | `test` | `test` \| `wompi` \| `mercadopago` |
| `PAYMENTS_WEBHOOK_SECRET` | dev | Secreto HMAC del webhook de pagos. **Cambiar en producción.** |
| `WOMPI_PUBLIC_KEY` | — | Credenciales reales (pendientes de contratación) |
| `WOMPI_INTEGRITY_SECRET` | — | Firma de integridad de transacciones Wompi |

---

## 💳 Regla central de precios: 10% por pago anticipado

Implementada **100% en el servidor** (`src/lib/pricing.ts`):

```
descuento = 10% × Σ(precio×qty de productos ELEGIBLES y no excluidos)
total_prePaid  = (subtotal − descuento) + envío
total_COD      = subtotal + envío        (sin descuento)
```

- El descuento **nunca** aplica sobre envío ni cargos.
- El frontend **solo muestra**; el backend recalcula en carrito, checkout y creación de pedido.
- Los totales enviados por el cliente se **ignoran** (verificado en pruebas).
- Configurable desde `#/admin/promociones`: porcentaje, mínimo, tope máximo, vigencia y
  exclusiones por producto. Queda registrado en el pedido (`prepayDiscount` + `lineDiscount`
  por línea) aunque el catálogo cambie después.
- Productos excluidos de fábrica (demo de exclusiones): mercado/despensa y pañales
  (`prepayEligible: false`).

## 🧪 Resultados de los 12 escenarios obligatorios (verificados con navegador real)

| # | Escenario | Resultado | Evidencia |
|---|---|---|---|
| 1 | Compra con pago anticipado aplica exactamente 10% al subtotal elegible | ✅ | Subtotal $204.980 → dto **−$20.498** → total $191.982 (envío $7.500) |
| 2 | Cambiar a contraentrega elimina el descuento | ✅ | Opción B: $189.990 + $8.500 = $198.490, sin línea de descuento |
| 3 | Manipulación de totales desde el navegador es rechazada | ✅ | POST con `total:1, discount:999999` → servidor calcula $2.760.582 reales |
| 4 | Pago aprobado actualiza el pedido de forma segura | ✅ | `simulate APPROVED` → estado `CONFIRMED`, `paymentStatus APPROVED`, historial |
| 5 | Pago rechazado no muestra el pedido como pagado | ✅ | `Rechazar pago` → "Pago rechazado", inventario liberado automáticamente |
| 6 | Webhook duplicado no duplica la transacción | ✅ | Mismo `eventId` dos veces → `duplicate:true`, sin doble procesamiento |
| 7 | Destino sin cobertura se informa antes de confirmar | ✅ | Leticia (Amazonas): contraentrega bloqueada con mensaje claro; cobertura y tarifa ($22.000, 6-12 días) mostradas antes de pagar |
| 8 | Inventario insuficiente impide la compra | ✅ | Stock 2 vs carrito ×7 → 409 "Inventario insuficiente… Disponible: 2" |
| 9 | Categoría creada por el admin aparece sin tocar código | ✅ | "Musica e instrumentos" creada en `#/admin/categorias` → visible en el hub sin recargar |
| 10 | Cambios de producto del admin aparecen en la tienda | ✅ | Precio $49.990→$43.990 guardado → ficha actualizada (revertido luego) |
| 11 | Usuario no autorizado no entra al panel | ✅ | `#/admin` sin sesión → "Panel restringido"; `/api/admin/*` → 403 |
| 12 | Navegación y checkout funcionan desde celular | ✅ | Viewport 390px: home, ficha, carrito y checkout OK, sin scroll horizontal, bottom-nav fija con safe-area |

**Extras verificados:** footer sticky (pegado al fondo exacto en páginas cortas, empujado
naturalmente en largas), modo claro/oscuro, autocompletado con corrección de tipeo, countdown
real de campaña (72h desde el seed), skeleton loaders, toasts, confeti de confirmación y
cero errores de consola tras recarga.

---

## 🏗️ Arquitectura

```
Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind 4 · shadcn/ui
Prisma 6 + SQLite · zustand (persistido) · zod disponible · sonner · next-themes

src/app/page.tsx                → SPA única (única ruta de página)
src/components/store/*          → tienda (header, home, browse, producto, carrito,
                                  checkout, pasarela de pruebas, confirmación,
                                  seguimiento, cuenta, legales, footer, bottom-nav)
src/components/admin/*          → panel administrativo (guard por rol + 9 secciones)
src/app/api/*                   → API Routes (backend)
src/lib/pricing.ts              → motor de precios (autoridad del servidor)
src/lib/payments.ts             → capa de pagos modular + webhook seguro
src/lib/shipping.ts             → cobertura y tarifas (ciudad → resto de departamento)
src/lib/auth.ts                 → sesiones HMAC httpOnly + scrypt
src/store/app.ts                → estado global (carrito servidor, ciudad, favoritos…)
prisma/schema.prisma            → 18 modelos
prisma/seed.ts + data/*         → catálogo, zonas de Colombia, contenido editorial
```

### Modelo de datos (18 modelos)

`User, Address, Category, Product, Variant, CartItem, Order, OrderItem (snapshot de precio),
Payment (idempotente por eventId/providerTxId), Shipment, OrderStatusHistory, Carrier,
ShippingZone, Promotion, PriceHistory, Favorite, AuditLog, SiteConfig (marca/contenido editable)`.

### Seguridad implementada

- Precios, descuentos y totales **siempre** recalculados en servidor; los del cliente se ignoran.
- Inventario validado y reservado en transacción al crear el pedido; devuelto en cancelación/rechazo.
- Pedidos idempotentes (`idempotencyKey` del cliente) → sin duplicados por doble clic.
- Webhook de pagos con firma HMAC-SHA256 del cuerpo crudo + idempotencia por evento.
- Sesiones firmadas (HMAC) en cookies httpOnly; contraseñas con scrypt + salt.
- Panel y APIs admin protegidos por rol + registro de auditoría de cada mutación.
- Nunca se almacenan números de tarjeta ni CVV (la pasarela de pruebas es explícita).
- Seguimiento público requiere número de pedido + teléfono (o sesión del dueño).

---

## 🔌 Integraciones reales vs. pendientes

### Pagos — MODO PRUEBAS (activo)
- Pasarela simulada en el checkout (`Pago aprobado` / `Rechazar pago`) que invoca la **misma
  lógica** que el webhook real (verificación de firma, idempotencia, actualización de pedido).
- **Para producción con Wompi:** 1) contratar cuenta; 2) setear `PAYMENTS_MODE=wompi`,
   `WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`; 3) registrar el webhook
   `https://<dominio>/api/payments/webhook` (header `x-nova-signature: sha256=HMAC(body)`),
   o adaptar el verificador al formato de eventos de Wompi (la utilidad
   `computeWompiIntegrity()` ya deja preparada la firma de integridad referencia+monto+moneda).
   Mercado Pago sigue el mismo patrón de adaptador.
- No se muestran logos de medios de pago como "habilitados" — el checkout declara honestamente
  el modo pruebas y el proveedor que se conecte.

### Logística — gestión manual (activa) + APIs pendientes
- 90 zonas sembradas (32 departamentos: capitales, principales ciudades y "resto del
  departamento") con tarifa, ETA y disponibilidad de contraentrega.
- Transportadoras sembradas (Coordinadora, TCC, Interrapidísimo, Envía, Servientrega) en modo
  **gestión manual de guías** desde `#/admin/pedidos` (asignar transportadora + número de guía
  + incidencias). No se afirma tener APIs activas; al contratarlas, el modelo `Shipment` ya
  soporta el número de guía y los estados de despacho.
- La cobertura se verifica en checkout por destino; los mensajes informan claramente cuando
  no hay servicio o la contraentrega no está disponible.

### Almacenamiento de medios
- `POST /api/admin/upload` guarda imágenes/videos en `public/uploads/` (válido para este
  entorno de desarrollo). **En producción migrar a S3/GCS** y servir por CDN; el endpoint ya
  devuelve la URL, así que el cambio es transparente para el panel.

### Legal
- 7 documentos editables (términos, privacidad, datos, cambios, envíos, vendedor, SAC) en
  `#/admin/contenido → Legales`. Todos marcados **"pendiente de revisión profesional"**.
- Consentimiento de personalización (recomendaciones por categorías vistas, guardado solo en
  el dispositivo) con opt-out en la cuenta.

---

## 📝 Notas operativas

- **Moneda:** COP entero (sin decimales) en toda la plataforma.
- **Seed idempotente:** `bun run db:seed` puede ejecutarse repetidamente (upserts).
- **Campaña de ofertas:** la campaña sembrada expira 72h después del seed (countdown real);
  crea una nueva desde `#/admin/promociones` o re-siembra para renovarla.
- **No hay reseñas inventadas:** los productos no muestran valoraciones falsas; la curaduría
  ("favoritos de la tienda", novedades) es configuración de merchandising del admin.
- El dev server corre en el puerto 3000 (único puerto expuesto).
