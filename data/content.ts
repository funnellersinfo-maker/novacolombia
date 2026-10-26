// Contenido editorial semilla: colecciones, banners, textos legales y config de marca.

export type SeedCollection = {
  slug: string;
  name: string;
  description: string;
  color: string;
  productSlugs: string[];
};

export const seedCollections: SeedCollection[] = [
  {
    slug: "rincon-gamer",
    name: "Rincón gamer",
    description: "Todo el setup para jugar en serio",
    color: "#9333EA",
    productSlugs: ["audifonos-krona-q5-anc", "portatil-andinabook-14", "tablet-lumina-tab-10", "smartwatch-krona-fit-2", "auto-rc-todoterreno", "bateria-portatil-20k"],
  },
  {
    slug: "cafe-en-casa",
    name: "Café y cocina en casa",
    description: "Sabores colombianos y electrodomésticos que facilitan todo",
    color: "#FF5A36",
    productSlugs: ["cafe-molido-huila-500", "freidora-aire-crispy-55", "licuadora-vortexpro-900", "sarten-premium-26cm", "panela-redonda-1kg", "canasta-mercado-termica"],
  },
  {
    slug: "casa-inteligente",
    name: "Casa inteligente",
    description: "Tu hogar trabajando por ti",
    color: "#00A76F",
    productSlugs: ["robot-aspirador-cleanbot", "foco-inteligente-rgb-x2", "bocina-turbobeat-40w", "monitor-bebe-video", "lampara-led-escritorio"],
  },
  {
    slug: "volver-al-gym",
    name: "Volver al gym",
    description: "Equipo para retomar la rutina sin excusas",
    color: "#FF7A59",
    productSlugs: ["mancuernas-ajustables-20kg", "colchoneta-yoga-6mm", "cuerda-salto-velocidad", "rodilleras-deportivas-par", "smartwatch-krona-fit-2", "tenis-urban-runner"],
  },
  {
    slug: "mascotas-felices",
    name: "Mascotas felices",
    description: "Porque son parte de la familia",
    color: "#FFB800",
    productSlugs: ["alimento-perro-adulto-15kg", "cama-mascota-ortopedica", "rascador-gatos-3niveles", "juguete-dispensador-mascota", "transportador-mascota-rejilla"],
  },
  {
    slug: "escapate",
    name: "Escálpate",
    description: "Equipaje y comodidad para tu próximo viaje",
    color: "#0D9488",
    productSlugs: ["maleta-cabina-rigida-20", "morral-antirrobo-35l", "organizadores-equipaje-set6", "almohada-viaje-memory", "bateria-portatil-20k"],
  },
];

export type SeedBanner = {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  active: boolean;
  order: number;
};

export const seedBanners: SeedBanner[] = [
  {
    id: "hero-main",
    title: "Descubre tu próxima compra favorita",
    subtitle: "Miles de productos con envío a toda Colombia y dos formas de pagar: contraentrega o anticipado con 10% de descuento.",
    ctaText: "Explorar ofertas",
    ctaLink: "#/c/ofertas",
    image: "/images/hero-main.png",
    active: true,
    order: 1,
  },
  {
    id: "hero-prepay",
    title: "Paga anticipado y ahorra 10%",
    subtitle: "En miles de productos elegibles. Compara las dos modalidades antes de pagar y elige la que te convenga.",
    ctaText: "Ver productos con descuento",
    ctaLink: "#/c/ofertas",
    image: "/images/hero-prepay.png",
    active: true,
    order: 2,
  },
  {
    id: "hero-tech",
    title: "Tecnología que te mueve",
    subtitle: "Renueva tu setup con envíos rápidos a las principales ciudades del país.",
    ctaText: "Ver tecnología",
    ctaLink: "#/c/tecnologia",
    image: "/images/hero-tech.png",
    active: true,
    order: 3,
  },
];

export type SeedLegalDoc = {
  slug: string;
  title: string;
  body: string;
};

export const seedLegalDocs: SeedLegalDoc[] = [
  {
    slug: "terminos",
    title: "Términos y condiciones",
    body: `**Texto editable — pendiente de revisión legal profesional antes del lanzamiento.**

Estos términos y condiciones regulan el uso de la tienda en línea (en adelante "la tienda") operada por el vendedor registrado en la sección Información del vendedor.

1. **Objeto.** La tienda ofrece productos de catálogo propio y de proveedores aliados, con despachos a destinos con cobertura en Colombia.
2. **Precios y promociones.** Todos los precios se expresan en pesos colombianos (COP) e incluyen impuestos aplicables. La promoción de pago anticipado aplica un descuento del 10% sobre el subtotal de productos elegibles, sin incluir envíos ni otros cargos. La vigencia, topes y exclusiones se publican en cada campaña.
3. **Modalidades de pago.** (a) Pago anticipado mediante los medios de pago habilitados por el proveedor de pagos contratado; (b) pago contraentrega, sujeto a cobertura, producto y transportadora.
4. **Pedidos.** La tienda puede confirmar, modificar o cancelar pedidos ante errores de precio, falta de inventario o imposibilidad logística, informando al cliente.
5. **Propiedad intelectual.** Los contenidos de la tienda son de propiedad del operador o de sus titulares.
6. **Ley aplicable.** Estos términos se rigen por la legislación colombiana, en especial el Estatuto del Consumidor (Ley 1480 de 2011).`,
  },
  {
    slug: "privacidad",
    title: "Política de privacidad",
    body: `**Texto editable — pendiente de revisión legal profesional antes del lanzamiento.**

Tratamos tus datos personales conforme a la Ley 1581 de 2012 (régimen general de protección de datos personales) y el Decreto 1377 de 2013.

1. **Datos que recopilamos:** nombre, correo, teléfono y dirección de entrega; datos de navegación anónimos y, solo con tu autorización, historial de productos vistos para sugerencias.
2. **Finalidad:** procesar pedidos, despachos, cobros, atención al cliente y —con tu consentimiento— personalizar recomendaciones.
3. **Tus derechos:** conocer, actualizar, rectificar y suprimir tus datos, y revocar autorizaciones. Ejércelos escribiendo al canal de atención publicado en esta tienda.
4. **Seguridad:** aplicamos medidas técnicas razonables. Nunca almacenamos números completos de tarjetas ni códigos de seguridad.
5. **Menores:** la tienda no está dirigida a menores de edad.`,
  },
  {
    slug: "datos",
    title: "Tratamiento de datos personales",
    body: `**Texto editable — pendiente de revisión legal profesional antes del lanzamiento.**

Como titular de datos personales tienes derecho a acceder, actualizar, rectificar, suprimir, revocar autorización y/o solicitar prueba de la misma. Para ello contacta al canal oficial de atención (SAC) publicado en la sección de atención al cliente.

La autorización para el tratamiento de tus datos se solicita de manera previa y separada en el registro y en el checkout. Puedes retirar tu consentimiento para fines no esenciales (por ejemplo, recomendaciones personalizadas) en cualquier momento desde tu cuenta, sin afectar la compra.`,
  },
  {
    slug: "cambios",
    title: "Política de cambios y devoluciones",
    body: `**Texto editable — pendiente de revisión legal profesional antes del lanzamiento.**

En cumplimiento del Estatuto del Consumidor (Ley 1480 de 2011, art. 47 y ss.) y de la resolución 704 de 2021 sobre retracto en ventas a distancia:

1. **Retracto:** dentro de los 5 días hábiles siguientes a la recepción del producto, siempre que este esté sin usar, con empaque original y accesorios completos.
2. **Garantía:** los productos tienen garantía legal mínima de 1 año por defectos de fabricación (Ley 1480, art. 23). Presenta tu factura o número de pedido.
3. **Reembolso:** una vez recibido y verificado el producto, el reembolso se gestiona por el mismo medio de pago en los plazos del proveedor (pagos anticipados) o en efectivo/transferencia (contraentrega).
4. **No aplican retracto:** productos personalizados, íntimos, perecederos y otros exceptuados por la ley.`,
  },
  {
    slug: "envios",
    title: "Condiciones de envío",
    body: `**Texto editable — pendiente de revisión legal profesional antes del lanzamiento.**

1. **Cobertura:** despachamos a los destinos publicados en el selector de ciudad del checkout. Si tu municipio no aparece o el sistema indica sin cobertura, aún no tenemos servicio logístico confiable para esa zona.
2. **Tiempos:** los plazos estimados se muestran al confirmar la dirección y se cuentan desde la confirmación del pedido (pago aprobado o pedido contraentrega confirmado).
3. **Costos:** la tarifa de envío depende del destino y se muestra siempre antes de confirmar la compra. No hay cargos sorpresa.
4. **Contraentrega:** disponible en ciudades y productos habilitados; el pago se realiza al recibir, al transportador asignado.
5. **Entregas fallidas:** si no hay quien reciba, la transportadora intentará nuevamente o dejará aviso. Pasados los intentos, el pedido retorna a bodega y se coordina reembolso según política de cambios.`,
  },
  {
    slug: "vendedor",
    title: "Información del vendedor",
    body: `**Texto editable — pendiente de completar datos reales antes del lanzamiento.**

- **Nombre comercial:** NOVA Colombia (nombre provisional, editable en configuración)
- **Razón social:** [Completar razón social registrada]
- **NIT:** [Completar NIT]
- **Dirección:** [Completar dirección principal]
- **Correo de contacto:** contacto@novacolombia.co (editable)
- **Teléfono / WhatsApp SAC:** [Completar]

Este sitio es una plataforma de comercio electrónico operada por el vendedor arriba identificado, con destino a clientes en Colombia.`,
  },
  {
    slug: "sac",
    title: "Canales de atención y reclamaciones (SAC)",
    body: `**Texto editable — pendiente de completar datos reales antes del lanzamiento.**

**Canales oficiales de atención:**
- Correo: sac@novacolombia.co (editable)
- WhatsApp: [Completar]
- Horario: [Completar]

**Para reclamos** (Ley 1480 de 2011): presenta tu número de pedido, descripción del inconveniente y soportes. Responderemos en los plazos legales.

**Productos financieros:** si la reclamación involucra un cobro con tarjetas emitidas en Colombia, también puedes acudir a la Superintendencia Financiera.`,
  },
];

export const seedBrandConfig = {
  name: "NOVA Colombia",
  shortName: "NOVA",
  tagline: "Descubre, compra, disfruta",
  domain: "novacolombia.co",
  supportEmail: "sac@novacolombia.co",
  supportPhone: "+57 601 000 0000",
  guestCheckoutAllowed: true,
};

export const seedHomeTexts = {
  trustTitle: "Comprar aquí es confiable",
  prepayBannerTitle: "Paga anticipado y ahorra 10%",
  prepayBannerText: "Miles de productos elegibles con descuento real al pagar por adelantado. Compara las dos modalidades antes de confirmar tu compra.",
};
