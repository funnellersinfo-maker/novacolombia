# Worklog — NOVA Colombia (supertienda e-commerce)

Proyecto: supertienda colombiana mobile-first con catálogo dinámico, carrito,
checkout con pago anticipado (-10% en elegibles) y contraentrega según cobertura,
tracking, cuenta de cliente y panel administrativo completo.

## Decisiones globales (FASE 1-2)

- Stack existente: Next.js 16.1.3 (Turbopack) + TS + Tailwind 4 + shadcn/ui completo
  + Prisma 6 (SQLite en `db/custom.db`) + zustand + zod 4 + sonner + framer-motion.
- Dev server corriendo en :3000 (log en `dev.log`).
- **Restricción clave**: solo existe la página `/` (src/app/page.tsx). Toda la tienda
  es una SPA con **hash routing** (`#/`, `#/c/:slug`, `#/p/:slug`, `#/buscar?q=`,
  `#/carrito`, `#/checkout`, `#/pedido/:number`, `#/seguimiento`, `#/cuenta`,
  `#/ingresar`, `#/favoritos`, `#/legal/:slug`, `#/admin/:section`).
  El backend vive en API routes bajo `/api/*`.
- **Identidad**: "NOVA Colombia" (nombre provisional, editable desde BD `SiteConfig`).
  Estética propia "pop colombiano neo-brutalista": crema cálido + tinta oscura +
  coral #FF5A36 + esmeralda #00A76F + ámbar #FFB800; tipografía display
  Bricolage Grotesque; tarjetas con borde tinta y sombra dura; badges tipo sticker.
  Sin indigo/azul como color principal. Light + dark mode (next-themes).
- **Regla de precios (servidor)**: `src/lib/pricing.ts` calcula todo. Descuento
  pago anticipado = 10% sobre subtotal de productos elegibles (excluye envío).
  Configurable en `Promotion` (percent, min, cap, vigencia, exclusiones por producto).
- **Pagos**: capa modular `src/lib/payments/` (adaptador Wompi + modo pruebas).
  Sin credenciales reales → modo pruebas con pasarela simulada + webhook firmado
  (HMAC-SHA256) con idempotencia por eventId. Nunca se procesan tarjetas reales.
- **Logística**: `ShippingZone` (departamento/ciudad/"resto"), `Carrier` (Coordinadora,
  TCC, Interrapidísimo, Envía, Servientrega — gestión manual, sin API activa).
  Cobertura verificada en checkout; contraentrega solo donde la zona lo permita
  y el producto lo admita.
- **Seguridad**: precios/totales SIEMPRE recalculados en servidor (se ignoran los
  del cliente); stock validado en transacción; pedidos idempotentes por
  `idempotencyKey`; sesión httpOnly firmada (HMAC); admin protegido por rol + audit log.
- Moneda: COP entero (sin decimales). `fmtCOP` en `src/lib/format.ts`.
- Imágenes: `next.config.ts` con `images.unoptimized` + remotePatterns wildcard
  (URLs OSS de image-search + uploads locales). Banners de marca generados con IA
  en `public/images/`.

## Contrato de APIs (resumen para todos los agentes)

Todas las respuestas JSON. Cookies: `nova_cart` (carrito invitado, httpOnly),
`nova_session` (login, httpOnly). Errores: `{ error: "mensaje" }` con 4xx/5xx.

- `GET  /api/store` → { brand, promo, banners, categories (árbol), locations, legalSlugs, codCities }
- `GET  /api/products?category&subcategory&q&sort&min&max&prepay&deals&featured&new&popular&page&perPage` → { items, total, page, pages }
- `GET  /api/products/:slug` → producto completo (con variantes, relacionados)
- `GET  /api/search?q` → { suggestions: products[], categories[], corrected? }
- `GET/POST/PATCH/DELETE /api/cart` (body: productId, variantId, quantity)
- `POST /api/checkout/quote` {departamento, ciudad} → { covered, price, etaMin, etaMax, codAvailable, reason? }
- `POST /api/orders` {cartToken?, address…, paymentMethod PREPAID|COD, idempotencyKey, acceptTerms} → { order, payment? } — precios servidor
- `GET  /api/orders/:number?phone=` → tracking (pedido + history + shipment)
- `POST /api/payments/simulate` {reference, outcome APPROVED|REJECTED} — SOLO modo pruebas
- `POST /api/payments/webhook` — firma HMAC + idempotente
- `POST /api/auth/login|register|logout`, `GET /api/auth/me`
- `GET/POST/PATCH/DELETE /api/account/favorites|addresses`, `GET /api/account/orders`
- Admin (requiere rol ADMIN): `GET/POST/PATCH/DELETE /api/admin/products|categories`,
  `GET/PATCH /api/admin/orders`, `GET /api/admin/stats`, `GET/PATCH /api/admin/promotions`,
  `GET/PATCH /api/admin/users`, `GET/POST/PATCH /api/admin/carriers|zones`,
  `GET/PATCH /api/admin/content`, `GET /api/admin/audit`, `POST /api/admin/upload`

Cuentas de prueba (seed): admin `admin@novacolombia.co` / `NovaAdmin2025*`,
cliente `cliente@ejemplo.co` / `Cliente2025*`.

---
Task ID: 1
Agent: main (Z.ai Code)
Task: FASE 1 — Inspección del entorno

Work Log:
- Verificado dev server Next 16.1.3 en :3000 (200 OK, log limpio).
- Inventario: shadcn/ui completo, prisma 6 + SQLite (db/custom.db), zod4, zustand,
  framer-motion, sonner, next-themes, embla, lucide. Esquema Prisma actual es
  plantilla vacía (User/Post) — se reemplazará por el modelo de la tienda.
- Leídas skills image-search e image-generation (CLI `z-ai`).
- .env: DATABASE_URL=file:/home/z/my-project/db/custom.db

Stage Summary:
- Entorno OK; se define plan y contrato API; siguiente: datos de catálogo + assets.

---
Task ID: 3-a
Agent: general-purpose (assets)
Task: Imágenes de productos (image-search) y banners de marca (image-generation)

Work Log:
- Leído worklog + inventario: `seedProducts` en data/catalog.ts tiene 78 productos
  (no 82 como decía el brief), todos con `slug` e `imageQuery` válidos.
- Escrito `scripts/fetch-images.ts`: importa seedProducts, ejecuta
  `z-ai image-search --query "<imageQuery>" --count 3 --gl us --no-rank` con pool de
  concurrencia 3, timeout de 100s por llamada, parse robusto del stdout (extrae el
  primer objeto JSON parseable tras las líneas de banner del CLI), toma hasta 3
  `original_url` (OSS). Si falla reintenta UNA vez con las primeras 3 palabras del
  imageQuery; si vuelve a fallar omite el producto. Escritura incremental del mapa
  y log de progreso línea a línea en /tmp/fetch-progress.log. Modo reanudable:
  si image-map.json ya existe, conserva sus entradas y solo busca slugs pendientes.
- Hallazgo del entorno: los procesos en background (nohup/setsid/disown) son
  eliminados al cerrar la sesión del Bash tool (verificado con proceso test), por lo
  que el script se ejecutó en foreground con timeout en varias pasadas:
  pasada 1 parcial (8 slugs, proceso matado), pasada 2 (73/78; 5 fallos por HTTP 429
  "Too many requests" del servicio tras agotar reintento), espera ~10 min al reset
  de cuota, pasada 3 (78/78, 0 fallos).
- Banners generados con `z-ai image`: el tamaño 1440x720 listado por el CLI es
  rechazado por la API (requiere múltiplos de 32) → generados a 1344x768 los 3 heroes
  y 1024x1024 el placeholder. El CLI escribe bytes JPEG en .png → convertidos a PNG
  real con ffmpeg. Los 4 archivos pesan >20KB.
- Verificación final: image-map.json JSON válido con 78 slugs (=100% del catálogo),
  234 URLs OSS únicas (3 por producto, todas https://z-cdn.chatglm.cn/...), 0 slugs
  extra, 6 URLs sampleadas responden 200 image/jpeg. Banners: PNG válidos
  (1344x768 / 1024x1024).

Stage Summary:
- 78 productos con imagen, 0 sin imagen (100% del catálogo; el brief decía 82 pero
  seedProducts contiene 78). 234 URLs OSS (3 por producto) en
  /home/z/my-project/data/image-map.json. Script:
  /home/z/my-project/scripts/fetch-images.ts (re-ejecutable/resumable). Banners
  generados en /home/z/my-project/public/images/: hero-main.png (498KB, 1344x768),
  hero-prepay.png (676KB, 1344x768), hero-tech.png (1.2MB, 1344x768),
  placeholder-product.png (282KB, 1024x1024) — PNG reales, >20KB todos.
  Nota: el servicio image-search devuelve 429 al saturar cuota (~78 consultas
  seguidas); re-ejecutar el script tras unos minutos recupera lo pendiente.

---
Task ID: 4-a, 4-b, 5-a, 5-b, 7-a
Agent: main (Z.ai Code)
Task: Backend completo — esquema, librerías, APIs públicas y admin, seed

Work Log:
- prisma/schema.prisma: 17 modelos (User, Address, Category, Product, Variant, CartItem,
  Order, OrderItem, Payment, Shipment, OrderStatusHistory, Carrier, ShippingZone,
  Promotion, PriceHistory, Favorite, AuditLog, SiteConfig). db push OK.
- Librerías: pricing.ts (motor 10% servidor), auth.ts (scrypt + sesión HMAC httpOnly),
  shipping.ts (cobertura ciudad/resto-departamento), payments.ts (capa modular, webhook
  HMAC + idempotencia por eventId, applyPaymentResult transaccional), search.ts
  (Levenshtein), api.ts, serialize.ts, format.ts, types.ts.
- APIs públicas: /api/store, /api/products (+filtros/facetas), /api/products/[slug],
  /api/search (con corrección de tipeo), /api/cart (CRUD servidor), /api/checkout/quote,
  /api/orders (idempotente, ignora precios del cliente, valida stock+cobertura),
  /api/orders/[number] (tracking con verificación teléfono/sesión),
  /api/payments/simulate (solo modo pruebas), /api/payments/webhook (firma+idempotente),
  /api/legal/[slug], auth (login con merge de carrito, register, logout, me),
  account (favorites, addresses, orders).
- APIs admin (rol ADMIN): products, categories, orders (+estados/guías/incidencias),
  promotions, users, carriers, zones, content, audit, stats, upload (a public/uploads).
- prisma/seed.ts + package.json db:seed: 18 categorías, 78 productos (78 con imágenes
  reales OSS del task 3-a), 5 transportadoras, 90 zonas, PREPAY10 + campaña FLASH72,
  config completa (marca/banners/colecciones/7 legales), admin+cliente de prueba.

Stage Summary:
- Verificado por curl: GET store/products/search OK; flujo carrito→quote→order OK;
  regla 10% exacta (subtotal 3.058.980 → dto 305.898 → total 2.760.582 con envío 7.500);
  totales falsos del cliente IGNORADOS; simulate APPROVED → CONFIRMED; webhook duplicado
  → duplicate:true; webhook sin firma → 401. Siguiente: frontend tienda.

---
Task ID: 6-a, 6-b
Agent: main (Z.ai Code)
Task: Frontend completo de la tienda (SPA hash-routing en /)

Work Log:
- Diseño "pop colombiano neo-brutalista": crema #FAF3E9 + tinta #241A12 + coral #D93C0A +
  esmeralda #0A8A50 + ámbar #FFC838; Bricolage Grotesque (display) + Geist; tokens light/dark
  en globals.css; utilidades card-pop, sticker, marker-title, shimmer, confetti, reduced-motion.
- Infra: lib/router.ts (hash router), lib/client-api.ts (fetch tipado + ApiError),
  store/app.ts (zustand persistido: ciudad, vistos recientes, historial búsqueda, consentimiento).
- Componentes: header (búsqueda con autocompletado/corrección/historial, selector de ciudad,
  carrito con badge animado, tema claro/oscuro), bottom-nav móvil con safe-area, footer sticky
  (min-h-screen flex + mt-auto), product-card (badges, favorito, add con feedback),
  rails con scroll-snap, home (hero carrusel, categorías, ofertas con countdown real de campaña,
  banner 10%, populares, colecciones, anticipado, novedades, vistos, para ti, confianza),
  hub de categorías, browse (filtros precio/prepay/stock + facets + orden + cargar más),
  ficha de producto (galería, variantes, comparador A/B de pago, cotización de envío por ciudad,
  relacionadas), carrito (comparación de modalidades), checkout (direcciones guardadas, cotización
  en vivo, tarjetas A/B, términos, idempotencia), pasarela de pruebas (aprobar/rechazar),
  confirmación (confeti + timeline + snapshot económico), seguimiento (timeline, guía, incidencias),
  cuenta (login/registro, pedidos, favoritos, direcciones CRUD, preferencias), legales (markdown).
- Corregidos errores de lint (setState-in-effect → remount por key, tipos, directivas).
- GET / → 200, `bun run lint` limpio.

Stage Summary:
- Tienda funcional completa en /. Pendiente: panel admin (task 7-b, agente) y pruebas E2E.

---
Task ID: 7-b
Agent: full-stack (Z.ai Code)
Task: Panel administrativo completo (SPA #/admin, solo src/components/admin/**)

Work Log:
- Leído worklog + APIs admin reales (routes) para tipar el frontend con exactitud
  (shipment.incidents es string JSON; promotions traen updatedAt; orders list trae
  history vacío y el detalle lo completa GET /api/admin/orders/[id]).
- admin-app.tsx (entry): guard por rol (pantalla "Panel restringido" + CTA #/ingresar),
  header sticky con mini-logo NOVA·Admin + admin logueado + "Ver tienda" + "Cerrar sesión"
  (logout + redirect #/), sidebar desktop sticky y tabs scrollables en móvil, switch de las
  9 secciones (resumen por defecto). Navegación con anclas #/admin/<seccion>.
- ui.tsx (helpers): tipos de todas las APIs admin; useAdminQuery con loading DERIVADO
  (state.path !== path) para cumplir react-hooks/set-state-in-effect (plugin v7) sin
  setState síncrono en effects; useDebounced; errText/toastError; btnPop*; PageHeader;
  Loading/Error/EmptyBlock; Pager; badges de estado/pago/modalidad/envío; Field;
  ConfirmAction (AlertDialog reutilizable con render-prop); Thumb; ProductSearchBox
  (usa /api/admin/products includeInactive); uploadFile (FormData directo, client-api
  fuerza JSON); parseIncidents; toLocalInput; numOr.
- Secciones: resumen (6 KPIs con ticket promedio div/0-safe, banner dto anticipado total,
  stock bajo, top vendidos, pedidos por estado con barras); pedidos (filtros
  estado/modalidad/texto/ciudad/fechas, tabla+cards, paginación, detalle Dialog con
  items snapshot, desglose, pago, envío+incidencias, historial y acciones estado+nota /
  transportadora+guía / incidencia / paymentStatus; export CSV client-side recorriendo
  páginas del filtro, BOM + separador ;); productos (tabla con thumb/precio/stock rojo
  <=5/stickers/switch publicado/dropdown archivar+eliminar, editor Dialog 4 tabs:
  básicos, precio+inventario con validaciones, multimedia con subida de archivos, y
  variantes editables); categorías (grid con icon+color, orden ↑↓ PATCH, switch activo,
  editor con picker de iconos lucide sugeridos y swatches); promociones (PREPAY10
  destacada: toggle, percent 0-50, mínimo, tope, vigencia datetime-local, exclusiones
  con buscador y chips; campañas: crear/activar/pausar/uso); envíos (tabs
  transportadoras —con alert de gestión manual de guías— y zonas: filtro por
  departamento, tabla paginada, edición inline switches, dialogs crear/editar/eliminar);
  contenido (marca, homeTexts + banners editor con upload, colecciones con slugs por
  búsqueda, legales con actualización de legalIndex al cambiar título); usuarios
  (búsqueda, rol Select, switch activo con confirmación, fila propia protegida);
  auditoría (tabla descendente paginada con badges por entidad).
- Corregido warning Radix "DialogContent requires DialogTitle" (detalle de pedido ahora
  siempre renderiza header, con fallback mientras carga).
- Verificación: tsc sin errores; eslint admin + `bun run lint` limpios; GET / 200;
  dev.log sin errores. E2E con agent-browser: guard sin sesión, login admin, las 9
  secciones renderizan (desktop+móvil), cambio de estado CONFIRMED→PREPARING con nota
  (historial OK), asignación Coordinadora+guía (verificado por API), auditoría registró
  order.update, CSV descargado con 18 columnas correctas, Ver tienda y Cerrar sesión OK.

Stage Summary:
- Panel admin completo y funcional en #/admin (9 secciones, guard por rol, diseño
  neo-brutalista consistente con la tienda, dark mode vía tokens). Archivos: admin-app.tsx,
  ui.tsx y sections/{resumen,pedidos,productos,categorias,promociones,envios,contenido,
  usuarios,auditoria}.tsx. Nota: no existe DELETE de promociones en el contrato API, las
  campañas solo se pausan/activan. Registro detallado en /home/z/agent-ctx/7-b-admin-panel.md.

---
Task ID: 8
Agent: main (Z.ai Code)
Task: FASE 6 — Pruebas E2E con navegador real (12 escenarios) y correcciones

Work Log:
- Bugs encontrados y corregidos:
  1) StatusFlow sin exportar (error compilación) → exportado.
  2) <Link> de next/link usa history.pushState para rutas hash → NO dispara
     hashchange → la vista no navegaba. Reemplazados TODOS los Link por <a>
     nativos en componentes store y admin. Navegación verificada end-to-end.
  3) Bootstrap de la SPA cacheado tras mutaciones admin → añadido
     refreshBootstrap() al store + refreshStorefront() invocado tras cada
     mutación admin (categorías, contenido, productos, promociones).
  4) Lint: setState síncrono en efectos (legal/product/browse) → patrón
     cancelled-flag + remount por key; directivas no usadas eliminadas.
- Verificación con agent-browser (escritorio + móvil 390px + viewport alto):
  ver detalles en README (tabla de escenarios). Sin errores de consola tras
  reload; footer sticky exacto en páginas cortas; bottom-nav fija respeta
  safe-area; modo oscuro correcto; sin scroll horizontal en móvil.
- Datos de prueba restaurados (precio canasta, categorías libros/musica
  eliminadas, carritos vaciados).

Stage Summary:
- 12/12 escenarios del plan verificados ✓. Tienda + admin operativos.

---
Task ID: 9
Agent: main (Z.ai Code)
Task: FASE 7 — Documentación y entrega final

Work Log:
- README.md completo: ejecución, cuentas, variables de entorno, regla del 10%,
  tabla de los 12 escenarios con evidencia, arquitectura, modelo de datos,
  seguridad, integraciones reales vs pendientes (Wompi, transportadoras, S3),
  notas operativas.
- Limpieza final: lint sin errores, GET / 200, bootstrap verificado.

Stage Summary:
- Entrega completa: tienda + admin + APIs + BD + pagos en modo pruebas +
  logística manual + documentación. 12/12 escenarios verificados.
