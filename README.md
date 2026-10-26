# NOVA Colombia — Landing estática

Landing publicitaria de la supertienda **NOVA Colombia** ("Descubre, compra, disfruta"):
una sola página (`/`), 100% estática (Next.js `output: 'export'`), sin backend ni APIs.

## Qué incluye

- **Hero** con imagen de fondo, overlay de contraste y título animado (Framer Motion, respeta `prefers-reduced-motion`).
- **Cinta (ticker)** con beneficios en movimiento.
- **Dos formas de pagar**: explicación honesta de la regla del 10% por pago anticipado (con ejemplo numérico) y de la contraentrega.
- **Hub de 18 categorías** con iconos y enlace directo a WhatsApp por categoría.
- **12 productos destacados** con precio COP, precio anticipado (−10%) y CTA "Pedir por WhatsApp" con mensaje pre-armado.
- **Preguntas frecuentes** (acordeón, solo una abierta a la vez).
- **Formulario de contacto** con validación client-side y envío por WhatsApp (no usa POST) + fallback mailto.
- **Chatbot 100% local** (keyword matching, sin APIs): sugerencias, indicador de escritura, y sin scroll automático al cargar (`hasInteracted`).
- **Botón flotante de WhatsApp** + botón del chatbot (respetan `env(safe-area-inset-bottom)`).
- **Footer** con contacto, horarios, redes sociales y documentos legales en diálogos (T&C, privacidad, cambios, envíos, vendedor, SAC).
- **SEO**: title/description optimizados, Open Graph completo, Twitter card, favicon SVG, `lang="es-CO"`, un solo `<h1>`, alt en imágenes y aria-labels.
- **Performance**: imágenes WebP locales (hero ~31 KB, cards 14–68 KB), `next/font/google` con `display: 'swap'`, carga diferida.

## Desarrollo

```bash
bun install
bun run dev        # http://localhost:3000
bun run lint       # ESLint
```

## Build estático y deploy (Cloudflare Pages)

```bash
npm run build      # genera ./out (sitio 100% estático)
npx wrangler pages deploy ./out --project-name=novacolombia --commit-dirty=true
```

También puedes conectar el repo a Cloudflare Pages (framework: Next.js, build: `npm run build`, output: `out`).

## Datos del negocio (pendientes de reemplazar)

En `src/components/landing/data.ts` están centralizados el WhatsApp, teléfono, correo,
dirección, horarios y redes sociales. Los valores actuales son **placeholders de
demostración** (p. ej. `573001234567`) y deben reemplazarse por los reales antes de
publicitar el sitio. Los textos legales son editables en el mismo archivo.

## Versión full-stack

El proyecto completo de e-commerce (tienda SPA con carrito, checkout con regla del 10%
en servidor, pasarela de pagos en modo pruebas, logística con zonas, cuenta de cliente
y panel administrativo con Prisma + SQLite) está preservado en la rama **`fullstack`**
de este repositorio.
