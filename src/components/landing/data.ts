// ─────────────────────────────────────────────────────────────
// NOVA Colombia — Landing estática: datos y lógica 100% local
// (sin APIs, sin backend; todo client-side)
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: "NOVA Colombia",
  shortName: "NOVA",
  tagline: "Descubre, compra, disfruta",
  // ⚠️ DATOS DE CONTACTO: reemplazar por los definitivos del negocio
  whatsapp: "573001234567", // placeholder — número real del negocio
  phone: "+57 601 000 0000",
  email: "sac@novacolombia.co",
  address: "Bogotá, Colombia",
  hours: "Lun a Sáb · 8:00 a.m. – 7:00 p.m.\nDom · 9:00 a.m. – 2:00 p.m.",
  socials: [
    { name: "Instagram", url: "https://instagram.com/novacolombia" },
    { name: "Facebook", url: "https://facebook.com/novacolombia" },
    { name: "TikTok", url: "https://tiktok.com/@novacolombia" },
    { name: "X", url: "https://x.com/novacolombia" },
  ],
};

export const PREPAY_RATE = 0.1; // 10% de descuento por pago anticipado

export function waLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function fmtCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function prepayPrice(price: number): number {
  return Math.round(price * (1 - PREPAY_RATE));
}

// ─── Categorías (18) ──────────────────────────────────────────

export type Category = {
  slug: string;
  name: string;
  short: string;
  icon: string; // nombre lucide
  color: string;
  subs: string[];
};

export const CATEGORIES: Category[] = [
  { slug: "tecnologia", name: "Tecnología y electrónica", short: "Tecnología", icon: "Cpu", color: "#d93c0a", subs: ["Audio", "Computadores", "Smart home", "Energía"] },
  { slug: "celulares", name: "Celulares y accesorios", short: "Celulares", icon: "Smartphone", color: "#e5399e", subs: ["Celulares", "Cargadores", "Forros", "Smartwatches"] },
  { slug: "hogar", name: "Hogar y cocina", short: "Hogar", icon: "Sofa", color: "#0a8a50", subs: ["Cocina", "Dormitorio", "Limpieza", "Decoración"] },
  { slug: "moda", name: "Moda y ropa", short: "Moda", icon: "Shirt", color: "#ff7a59", subs: ["Camisetas", "Jeans", "Chaquetas", "Vestidos"] },
  { slug: "calzado", name: "Calzado", short: "Calzado", icon: "Footprints", color: "#9333ea", subs: ["Tenis", "Botas", "Sandalias", "Formales"] },
  { slug: "belleza", name: "Belleza y cuidado personal", short: "Belleza", icon: "Sparkles", color: "#e5399e", subs: ["Piel", "Cabello", "Perfumes", "Maquillaje"] },
  { slug: "salud", name: "Salud y bienestar", short: "Salud", icon: "HeartPulse", color: "#0a8a50", subs: ["Vitaminas", "Equipos", "Primeros auxilios", "Bienestar"] },
  { slug: "deportes", name: "Deportes y fitness", short: "Deportes", icon: "Dumbbell", color: "#d93c0a", subs: ["Gimnasio", "Ciclismo", "Fútbol", "Aire libre"] },
  { slug: "mascotas", name: "Mascotas", short: "Mascotas", icon: "PawPrint", color: "#e5a30f", subs: ["Perros", "Gatos", "Camas", "Juguetes"] },
  { slug: "bebes", name: "Bebés y niños", short: "Bebés", icon: "Baby", color: "#f472b6", subs: ["Coches", "Higiene", "Juegos", "Alimentación"] },
  { slug: "juguetes", name: "Juguetes y entretenimiento", short: "Juguetes", icon: "Gamepad2", color: "#9333ea", subs: ["Construcción", "Juegos de mesa", "Peluches", "Control remoto"] },
  { slug: "accesorios", name: "Accesorios y joyería", short: "Accesorios", icon: "Watch", color: "#e5a30f", subs: ["Relojes", "Joyería", "Billeteras", "Bolsos"] },
  { slug: "herramientas", name: "Herramientas y ferretería", short: "Herramientas", icon: "Hammer", color: "#78716c", subs: ["Eléctricas", "Manuales", "Pintura", "Jardín"] },
  { slug: "oficina", name: "Oficina y estudio", short: "Oficina", icon: "Briefcase", color: "#0f766e", subs: ["Mobiliario", "Papelería", "Iluminación", "Organización"] },
  { slug: "viajes", name: "Viajes y accesorios", short: "Viajes", icon: "Plane", color: "#0d9488", subs: ["Maletas", "Morrales", "Organizadores", "Comodidad"] },
  { slug: "automotor", name: "Automóvil y motocicleta", short: "Automotor", icon: "Car", color: "#57534e", subs: ["Auto", "Moto", "Cuidado", "Interior"] },
  { slug: "dia-a-dia", name: "Día a día", short: "Día a día", icon: "ShoppingBasket", color: "#0a8a50", subs: ["Mercado", "Aseo", "Despensa"] },
  { slug: "ofertas", name: "Ofertas y oportunidades", short: "Ofertas", icon: "BadgePercent", color: "#d93c0a", subs: ["Descuentos reales"] },
];

// ─── Productos destacados (selección del catálogo) ────────────

export type Product = {
  slug: string;
  name: string;
  description: string;
  price: number; // COP
  prepayEligible: boolean;
  isNew?: boolean;
  category: string; // nombre corto
  image: string; // ruta local
};

export const PRODUCTS: Product[] = [
  {
    slug: "celular-vertex-x6-256",
    name: "Celular Vertex X6 256GB",
    description: "Pantalla AMOLED 120Hz, cámara triple de 108MP y batería de 5000mAh con carga rápida de 33W.",
    price: 1399900,
    prepayEligible: true,
    category: "Celulares",
    image: "/images/products/celular-vertex-x6-256.webp",
  },
  {
    slug: "audifonos-krona-q5-anc",
    name: "Audífonos Krona Sound Q5 ANC",
    description: "Inalámbricos over-ear con cancelación activa de ruido, 40 horas de batería y estuche rígido.",
    price: 129990,
    prepayEligible: true,
    category: "Tecnología",
    image: "/images/products/audifonos-krona-q5-anc.webp",
  },
  {
    slug: "portatil-andinabook-14",
    name: 'Portátil AndinaBook 14" Ryzen 7',
    description: "Ryzen 7, 16GB de RAM y SSD de 512GB en chasis de aluminio de 1.3kg. Pantalla IPS FHD.",
    price: 2799000,
    prepayEligible: true,
    category: "Tecnología",
    image: "/images/products/portatil-andinabook-14.webp",
  },
  {
    slug: "robot-aspirador-cleanbot",
    name: "Robot aspiradora CleanBot láser",
    description: "Navegación LiDAR multi-piso, succión de 4000Pa y trapeado inteligente. Contrólalo desde la app.",
    price: 899990,
    prepayEligible: true,
    category: "Hogar",
    image: "/images/products/robot-aspirador-cleanbot.webp",
  },
  {
    slug: "freidora-aire-crispy-55",
    name: "Freidora de aire Crispy 5.5L",
    description: "Cocina crujiente sin aceite con 8 programas y canasta de 5.5L. Incluye recetario colombiano.",
    price: 319990,
    prepayEligible: true,
    category: "Hogar",
    image: "/images/products/freidora-aire-crispy-55.webp",
  },
  {
    slug: "smartwatch-krona-fit-2",
    name: "Smartwatch Krona Fit 2 GPS",
    description: "GPS integrado, monitor cardíaco y SpO2, más de 100 modos deportivos y 14 días de batería. 5ATM.",
    price: 189990,
    prepayEligible: true,
    isNew: true,
    category: "Celulares",
    image: "/images/products/smartwatch-krona-fit-2.webp",
  },
  {
    slug: "tenis-urban-runner",
    name: "Tenis Urban Runner amortiguados",
    description: "Mediasuela de espuma reactiva, upper transpirable de malla y suela con agarre multidireccional.",
    price: 149990,
    prepayEligible: true,
    category: "Calzado",
    image: "/images/products/tenis-urban-runner.webp",
  },
  {
    slug: "maleta-cabina-rigida-20",
    name: 'Maleta de cabina rígida 20"',
    description: "Carcasa ABS anti-rayaduras, cierre TSA, ruedas giratorias 360° y bolsillo para laptop.",
    price: 199990,
    prepayEligible: true,
    category: "Viajes",
    image: "/images/products/maleta-cabina-rigida-20.webp",
  },
  {
    slug: "cafe-molido-huila-500",
    name: "Café molido origen Huila 500g",
    description: "Tostado medio con notas de caramelo y panela, molienda para filtrado. Finca familiar del Huila.",
    price: 27990,
    prepayEligible: false, // producto de canasta: sin descuento anticipado
    category: "Día a día",
    image: "/images/products/cafe-molido-huila-500.webp",
  },
  {
    slug: "alimento-perro-adulto-15kg",
    name: "Alimento para perro adulto 15kg",
    description: "Croquetas con pollo como primer ingrediente, omega 3 y 6, y prebióticos. Saco resellable.",
    price: 134990,
    prepayEligible: true,
    category: "Mascotas",
    image: "/images/products/alimento-perro-adulto-15kg.webp",
  },
  {
    slug: "mancuernas-ajustables-20kg",
    name: "Mancuernas ajustables 20kg (par)",
    description: "De 2.5kg a 10kg por mano con discos de neopreno que no rayan el piso. Tu gym en casa.",
    price: 189990,
    prepayEligible: true,
    category: "Deportes",
    image: "/images/products/mancuernas-ajustables-20kg.webp",
  },
  {
    slug: "monitor-bebe-video",
    name: "Monitor de bebé con cámara",
    description: "Visión nocturna infrarroja, audio bidireccional y pantalla de 3.2\" con alcance de 250m.",
    price: 249990,
    prepayEligible: true,
    category: "Bebés",
    image: "/images/products/monitor-bebe-video.webp",
  },
];

// ─── FAQ ──────────────────────────────────────────────────────

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "¿Cómo funciona el descuento del 10% por pago anticipado?",
    a: "Al pagar tu pedido por adelantado te descontamos el 10% sobre el subtotal de los productos elegibles (el envío no entra en el cálculo). Por ejemplo: si tus productos suman $500.000, pagas $450.000. El descuento se muestra siempre antes de confirmar y no se acumula con otras promociones. Algunos productos de canasta, como el café, no aplican.",
  },
  {
    q: "¿Puedo pagar contraentrega?",
    a: "Sí. Elige la modalidad contraentrega cuando esté disponible para tu ciudad y el producto que quieres. En este caso no aplica el descuento del 10%, pero tienes la misma garantía y política de devoluciones. Un asesor confirma la disponibilidad por WhatsApp antes de despachar.",
  },
  {
    q: "¿Envían a toda Colombia?",
    a: "Trabajamos con cobertura nacional a través de las principales transportadoras (Coordinadora, TCC, Interrapidísimo, Envía y Servientrega). Antes de confirmar tu pedido validamos que exista servicio confiable a tu municipio; si por alguna razón no hay cobertura, te lo decimos con anticipación y no generamos el pedido.",
  },
  {
    q: "¿Cuánto tarda mi pedido?",
    a: "Depende del destino y la transportadora asignada. En ciudades principales suele tomar entre 1 y 4 días hábiles; en otros municipios puede tomar más. El tiempo estimado exacto se confirma con el asesor al validar tu dirección, junto con el costo del envío.",
  },
  {
    q: "¿Puedo devolver un producto?",
    a: "Sí. Tienes derecho al retracto dentro de los 5 días hábiles siguientes a la entrega (Ley 1480 de 2011), siempre que el producto esté sin usar, con empaque original y accesorios completos. Además, todos los productos tienen garantía legal mínima de 1 año por defectos de fabricación.",
  },
  {
    q: "¿Cómo hablo con un asesor?",
    a: `Escríbenos por WhatsApp al ${SITE.phone} o al correo ${SITE.email}. Atendemos de lunes a sábado de 8:00 a.m. a 7:00 p.m. y domingos de 9:00 a.m. a 2:00 p.m. También puedes usar el formulario de contacto de esta página y te respondemos lo antes posible.`,
  },
];

// ─── Chatbot local (keyword matching, sin APIs) ───────────────

export const CHAT_SUGGESTIONS = [
  "¿Cómo funciona el 10%?",
  "¿Pagan contraentrega?",
  "¿Envían a mi ciudad?",
  "Quiero hablar con un asesor",
];

export const CHAT_GREETING =
  "¡Hola! Soy Nova, el asistente de NOVA Colombia. Puedo contarte sobre el descuento del 10% por pago anticipado, la contraentrega, los envíos y las devoluciones. ¿Qué quieres saber?";

type Intent = { patterns: RegExp[]; reply: string };

const INTENTS: Intent[] = [
  // Intents de contenido primero (prioridad sobre saludos/cortesías)
  {
    patterns: [/(contraentrega|contra entrega|contra-entrega|pagar al recibir|al recibir|pago en efectivo|efectivo)/],
    reply: "Sí, tenemos pago contraentrega en las ciudades y productos habilitados. En esa modalidad no aplica el descuento del 10%, pero la garantía y las devoluciones son exactamente las mismas. Un asesor confirma la disponibilidad para tu zona por WhatsApp antes de despachar.",
  },
  {
    patterns: [/(10\s*%|diez ?%|diez por|descuento|anticipado|anticipo|adelantado|promo|promocion)/],
    reply: "Es simple: pagando tu pedido por adelantado te descontamos el 10% sobre el subtotal de los productos elegibles (el envío no cuenta). Ejemplo: productos por $500.000 → pagas $450.000. Si luego cambias a contraentrega, el descuento se retira. Se muestra siempre antes de confirmar.",
  },
  {
    patterns: [/(ciudad|municipio|pueblo|cobertura|destino|departamento)/],
    reply: "Enviamos a la mayoría de municipios de Colombia con transportadoras como Coordinadora, TCC, Interrapidísimo, Envía y Servientrega. Dime tu ciudad en el WhatsApp y un asesor confirma cobertura, costo y tiempo de envío antes de confirmar tu pedido.",
  },
  {
    patterns: [/(envio|envios|envian|despacho|entrega|entregan|llega|tarda|demora|domicilio|transportadora|guia)/],
    reply: "Despachamos a toda Colombia donde haya servicio logístico confiable. En ciudades principales suele tardar entre 1 y 4 días hábiles. El costo y el tiempo exacto se confirman al validar tu dirección, y el pedido se genera solo cuando todo está claro.",
  },
  {
    patterns: [/(devolucion|devoluciones|garantia|retracto|cambio|reembolso|reclamo)/],
    reply: "Tienes 5 días hábiles de retracto desde que recibes el producto (Ley 1480 de 2011), con empaque original y accesorios completos. Además, todo tiene garantía legal mínima de 1 año por defectos de fabricación. Para iniciar un proceso, escríbenos por WhatsApp con tu número de pedido.",
  },
  {
    patterns: [/(producto|productos|catalogo|que venden|que hay|categorias|categoria|marcas)/],
    reply: "Tenemos 18 categorías: tecnología, celulares, hogar y cocina, moda, calzado, belleza, salud, deportes, mascotas, bebés, juguetes, accesorios, herramientas, oficina, viajes, automotor, día a día y ofertas. Cuéntale a un asesor por WhatsApp qué buscas y te envía opciones con precios.",
  },
  {
    patterns: [/(precio|cuanto cuesta|cuanto vale|tarifa|costo)/],
    reply: "Los precios están en pesos colombianos (COP) y los ves en cada tarjeta de producto de esta página. Recuerda: pagando anticipado ahorras el 10% en los productos elegibles. Para cotizaciones con envío incluido, escríbenos por WhatsApp.",
  },
  {
    patterns: [/(asesor|humano|persona|agente|llamar|telefono|whatsapp|contacto|correo|email|hablar)/],
    reply: `Claro, te conecto con un humano: WhatsApp ${SITE.phone} o correo ${SITE.email}. Horario: lunes a sábado de 8:00 a.m. a 7:00 p.m. y domingos de 9:00 a.m. a 2:00 p.m. También puedes usar el botón verde de WhatsApp de esta página.`,
  },
  {
    patterns: [/(horario|atienden|abren|cierran|domingo|sabado|sabados|horas)/],
    reply: "Atendemos de lunes a sábado de 8:00 a.m. a 7:00 p.m., y domingos de 9:00 a.m. a 2:00 p.m. Fuera de horario puedes escribirnos por WhatsApp y respondemos en cuanto abrimos.",
  },
  {
    patterns: [/(quienes son|que es nova|nova colombia|empresa|tienda|confiable|seguro|estafa)/],
    reply: "NOVA Colombia es una supertienda online de nueva generación: 18 categorías, dos formas de pagar (anticipado con 10% de descuento o contraentrega), envíos nacionales y devoluciones conforme a la ley colombiana. Los datos del vendedor están en el pie de página, en la sección legal.",
  },
  // Conversacionales al final (no secuestran preguntas con contenido)
  {
    patterns: [/\b(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que mas|que tal|saludos)\b/],
    reply: "¡Hola! ¿En qué te puedo ayudar? Pregúntame por el descuento del 10% por pago anticipado, la contraentrega, los envíos o cómo hablar con un asesor.",
  },
  {
    patterns: [/(gracias|muchas gracias|thank|genial|excelente|perfecto|chevere|buenisimo)/],
    reply: "¡Con gusto! Si quieres pedir algo o cotizar tu envío, usa el botón de WhatsApp. Estamos para lo que necesites.",
  },
  {
    patterns: [/(adios|chao|hasta luego|bye|nos vemos)/],
    reply: "¡Hasta pronto! Cuando quieras comprar, aquí estaremos. Recuerda: pagando anticipado ahorras el 10%.",
  },
];

const FALLBACK =
  "Mmm, no estoy seguro de haber entendido. Puedo ayudarte con: el descuento del 10% por pago anticipado, la contraentrega, los envíos y cobertura, las devoluciones y garantía, o cómo contactar un asesor. También puedes escribirnos directo por WhatsApp.";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function getBotReply(input: string): string {
  const text = normalize(input);
  if (!text) return FALLBACK;
  for (const intent of INTENTS) {
    if (intent.patterns.some((re) => re.test(text))) return intent.reply;
  }
  return FALLBACK;
}

// ─── Documentos legales (Dialogs del footer) ──────────────────

export type LegalDoc = { slug: string; title: string; body: string };

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terminos",
    title: "Términos y condiciones",
    body: `Texto editable — pendiente de revisión legal profesional antes del lanzamiento.

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
    body: `Texto editable — pendiente de revisión legal profesional antes del lanzamiento.

Tratamos tus datos personales conforme a la Ley 1581 de 2012 (régimen general de protección de datos personales) y el Decreto 1377 de 2013.

1. **Datos que recopilamos:** nombre, correo, teléfono y dirección de entrega; datos de navegación anónimos.

2. **Finalidad:** procesar pedidos, despachos, cobros y atención al cliente.

3. **Tus derechos:** conocer, actualizar, rectificar y suprimir tus datos, y revocar autorizaciones. Ejércelos escribiendo al canal de atención publicado en esta tienda.

4. **Seguridad:** aplicamos medidas técnicas razonables. Nunca almacenamos números completos de tarjetas ni códigos de seguridad.

5. **Menores:** la tienda no está dirigida a menores de edad.`,
  },
  {
    slug: "cambios",
    title: "Cambios y devoluciones",
    body: `En cumplimiento del Estatuto del Consumidor (Ley 1480 de 2011, art. 47 y ss.) y la resolución 704 de 2021 sobre retracto en ventas a distancia:

1. **Retracto:** dentro de los 5 días hábiles siguientes a la recepción del producto, siempre que esté sin usar, con empaque original y accesorios completos.

2. **Garantía:** los productos tienen garantía legal mínima de 1 año por defectos de fabricación (Ley 1480, art. 23). Presenta tu factura o número de pedido.

3. **Reembolso:** una vez recibido y verificado el producto, el reembolso se gestiona por el mismo medio de pago en los plazos del proveedor (pagos anticipados) o en efectivo/transferencia (contraentrega).

4. **No aplican retracto:** productos personalizados, íntimos, perecederos y otros exceptuados por la ley.`,
  },
  {
    slug: "envios",
    title: "Condiciones de envío",
    body: `1. **Cobertura:** despachamos a los destinos con servicio logístico confiable en Colombia. Si tu municipio no tiene cobertura, te lo informamos antes de generar el pedido.

2. **Tiempos:** los plazos estimados se confirman al validar la dirección y se cuentan desde la confirmación del pedido (pago aprobado o pedido contraentrega confirmado).

3. **Costos:** la tarifa de envío depende del destino y se muestra siempre antes de confirmar la compra. No hay cargos sorpresa.

4. **Contraentrega:** disponible en ciudades y productos habilitados; el pago se realiza al recibir, al transportador asignado.

5. **Entregas fallidas:** si no hay quien reciba, la transportadora intentará nuevamente o dejará aviso. Pasados los intentos, el pedido retorna a bodega y se coordina reembolso según política de cambios.`,
  },
  {
    slug: "vendedor",
    title: "Información del vendedor",
    body: `Texto editable — pendiente de completar datos reales antes del lanzamiento.

- **Nombre comercial:** NOVA Colombia (nombre provisional)
- **Razón social:** [Completar razón social registrada]
- **NIT:** [Completar NIT]
- **Dirección:** Bogotá, Colombia
- **Correo de contacto:** sac@novacolombia.co
- **Teléfono / WhatsApp SAC:** [Completar]

Este sitio es una plataforma de comercio electrónico operada por el vendedor arriba identificado, con destino a clientes en Colombia.`,
  },
  {
    slug: "sac",
    title: "Canales de atención (SAC)",
    body: `**Canales oficiales de atención:**
- Correo: sac@novacolombia.co
- WhatsApp: [Completar]
- Horario: Lun a Sáb 8:00 a.m. – 7:00 p.m. · Dom 9:00 a.m. – 2:00 p.m.

**Para reclamos** (Ley 1480 de 2011): presenta tu número de pedido, descripción del inconveniente y soportes. Responderemos en los plazos legales.

**Productos financieros:** si la reclamación involucra un cobro con tarjetas emitidas en Colombia, también puedes acudir a la Superintendencia Financiera.`,
  },
];
