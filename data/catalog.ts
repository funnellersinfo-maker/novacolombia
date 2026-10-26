// Catálogo semilla NOVA Colombia — 18 categorías, ~82 productos
// Las imágenes se resuelven vía data/image-map.json (agente de assets) usando imageQuery.

export type SeedVariant = {
  kind: string; // "Talla" | "Color" | "Tamaño" | "Modelo"
  value: string;
  priceDelta?: number;
  stock: number;
};

export type SeedProduct = {
  slug: string;
  name: string;
  brand: string;
  seller: string;
  category: string; // slug de categoría
  subcategory: string;
  price: number; // COP
  compareAt?: number; // precio anterior real definido por el admin
  stock: number;
  sku?: string;
  prepayEligible?: boolean; // default true
  codAvailable?: boolean; // default true
  isNew?: boolean;
  isFeatured?: boolean;
  popularity?: number; // métrica interna de curaduría (no es un claim al usuario)
  tags: string[];
  description: string;
  features: [string, string][];
  variants?: SeedVariant[];
  imageQuery: string; // consulta EN INGLÉS para image-search
};

export type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  icon: string; // nombre de icono lucide
  color: string; // acento de la categoría
  special?: "deals"; // categoría dinámica de ofertas
  subcategories: string[];
  order: number;
};

export const seedCategories: SeedCategory[] = [
  { slug: "tecnologia", name: "Tecnología y electrónica", description: "Todo lo que tu vida digital necesita", icon: "Cpu", color: "#FF5A36", subcategories: ["Audio", "Computadores", "Smart home", "Energía"], order: 1 },
  { slug: "celulares", name: "Celulares y accesorios", description: "Tu mundo conectado", icon: "Smartphone", color: "#E5399E", subcategories: ["Celulares", "Cargadores", "Forros y protecciones", "Smartwatches"], order: 2 },
  { slug: "hogar", name: "Hogar y cocina", description: "Tu casa, mejor que nunca", icon: "Sofa", color: "#00A76F", subcategories: ["Cocina", "Dormitorio", "Limpieza", "Decoración"], order: 3 },
  { slug: "moda", name: "Moda y ropa", description: "Estilo para todos los días", icon: "Shirt", color: "#FF7A59", subcategories: ["Camisetas", "Jeans", "Chaquetas", "Vestidos"], order: 4 },
  { slug: "calzado", name: "Calzado", description: "Del oficina al outdoors", icon: "Footprints", color: "#9333EA", subcategories: ["Tenis", "Botas", "Sandalias", "Formales"], order: 5 },
  { slug: "belleza", name: "Belleza y cuidado personal", description: "Rutinas que quieres cumplir", icon: "Sparkles", color: "#E5399E", subcategories: ["Cuidado de la piel", "Cabello", "Perfumes", "Maquillaje"], order: 6 },
  { slug: "salud", name: "Salud y bienestar", description: "Para sentirte mejor cada día", icon: "HeartPulse", color: "#00A76F", subcategories: ["Vitaminas y suplementos", "Equipos de salud", "Primeros auxilios", "Bienestar"], order: 7 },
  { slug: "deportes", name: "Deportes y fitness", description: "Muévete con todo", icon: "Dumbbell", color: "#FF5A36", subcategories: ["Gimnasio", "Ciclismo", "Fútbol", "Aire libre"], order: 8 },
  { slug: "mascotas", name: "Mascotas", description: "Premia a tu peludito", icon: "PawPrint", color: "#FFB800", subcategories: ["Perros", "Gatos", "Camas y transporte", "Juguetes"], order: 9 },
  { slug: "bebes", name: "Bebés y niños", description: "Todo para su etapa", icon: "Baby", color: "#F472B6", subcategories: ["Coches y sillas", "Higiene y cuidado", "Juegos", "Alimentación"], order: 10 },
  { slug: "juguetes", name: "Juguetes y entretenimiento", description: "Jugar nunca pasa de moda", icon: "Gamepad2", color: "#9333EA", subcategories: ["Bloques y construcción", "Juegos de mesa", "Peluches", "Control remoto"], order: 11 },
  { slug: "accesorios", name: "Accesorios y joyería", description: "Detalles que definen", icon: "Watch", color: "#FFB800", subcategories: ["Relojes", "Joyería", "Billeteras", "Bolsos"], order: 12 },
  { slug: "herramientas", name: "Herramientas y ferretería", description: "Manos a la obra", icon: "Hammer", color: "#78716C", subcategories: ["Herramientas eléctricas", "Herramientas manuales", "Pintura", "Jardín"], order: 13 },
  { slug: "oficina", name: "Oficina y estudio", description: "Trabaja y estudia mejor", icon: "Briefcase", color: "#0F766E", subcategories: ["Mobiliario", "Papelería", "Iluminación", "Organización"], order: 14 },
  { slug: "viajes", name: "Viajes y accesorios", description: "Listo para la próxima escapada", icon: "Plane", color: "#0D9488", subcategories: ["Maletas", "Morrales", "Organizadores", "Comodidad"], order: 15 },
  { slug: "automotor", name: "Automóvil y motocicleta", description: "Tu vehículo como nuevo", icon: "Car", color: "#57534E", subcategories: ["Auto", "Moto", "Cuidado y limpieza", "Accesorios interior"], order: 16 },
  { slug: "dia-a-dia", name: "Día a día", description: "Lo esencial de tu canasta", icon: "ShoppingBasket", color: "#00A76F", subcategories: ["Mercado", "Aseo del hogar", "Despensa"], order: 17 },
  { slug: "ofertas", name: "Ofertas y oportunidades", description: "Descuentos reales de la tienda", icon: "BadgePercent", color: "#FF5A36", special: "deals", subcategories: [], order: 18 },
];

const S = "NOVA Retail"; // vendedor directo por defecto

export const seedProducts: SeedProduct[] = [
  // ─── TECNOLOGÍA ───────────────────────────────────────────────
  {
    slug: "audifonos-krona-q5-anc", name: "Audífonos Krona Sound Q5 ANC", brand: "Krona", seller: "Krona Store",
    category: "tecnologia", subcategory: "Audio", price: 129990, compareAt: 189990, stock: 34, sku: "KRN-Q5-BLK",
    isFeatured: true, popularity: 98, tags: ["audifonos", "inalambricos", "bluetooth", "anc", "ruido", "musica"],
    description: "Audífonos inalámbricos over-ear con cancelación activa de ruido híbrida, 40 horas de batería y drivers de 40mm para un sonido envolvente. Incluyen estuche rígido y cable USB-C.",
    features: [["Cancelación de ruido", "ANC híbrida hasta 35dB"], ["Batería", "40 h (5 h con carga rápida de 10 min)"], ["Conectividad", "Bluetooth 5.3 + jack 3.5mm"], ["Peso", "245 g"]],
    imageQuery: "wireless over-ear black headphones product photo on clean background",
  },
  {
    slug: "bocina-turbobeat-40w", name: "Bocina Bluetooth TurboBeat 40W", brand: "Krona", seller: "Krona Store",
    category: "tecnologia", subcategory: "Audio", price: 99990, compareAt: 129990, stock: 21, sku: "TB-40-ORG",
    popularity: 84, tags: ["bocina", "parlante", "bluetooth", "fiesta", "portatil"],
    description: "Bocina portátil 40W con resistencia IPX6, luces RGB reactivas al ritmo y 18 horas de reproducción. Perfecta para planes improvisados y salidas al parque.",
    features: [["Potencia", "40W RMS"], ["Resistencia", "IPX6 a prueba de salpicaduras"], ["Batería", "18 horas"], ["Extras", "Radio FM, USB y micrófono integrado"]],
    imageQuery: "portable bluetooth speaker orange product photo",
  },
  {
    slug: "portatil-andinabook-14", name: "Portátil AndinaBook 14\" Ryzen 7", brand: "Andina Tech", seller: "Andina Tech",
    category: "tecnologia", subcategory: "Computadores", price: 2799000, compareAt: 3199000, stock: 9, sku: "AB14-R7",
    isFeatured: true, popularity: 92, tags: ["portatil", "laptop", "computador", "ryzen", "oficina", "estudio"],
    description: "Portátil de 14\" con procesador Ryzen 7, 16GB de RAM y SSD de 512GB en chasis de aluminio de 1.3kg. Pantalla IPS FHD con protección antirreflejos.",
    features: [["Procesador", "AMD Ryzen 7 5825U"], ["Memoria", "16GB DDR4"], ["Almacenamiento", "SSD 512GB NVMe"], ["Pantalla", "14\" IPS FHD 1920x1080"]],
    imageQuery: "modern silver laptop computer product photo",
  },
  {
    slug: "tablet-lumina-tab-10", name: "Tablet Lumina Tab 10.1\" 128GB", brand: "Lumina", seller: S,
    category: "tecnologia", subcategory: "Computadores", price: 649990, stock: 15, sku: "LMT10-128",
    popularity: 71, tags: ["tablet", "pantalla", "estudio", "entretenimiento"],
    description: "Tablet con pantalla 10.1\" HD+, 128GB ampliables vía microSD y batería de 6000mAh. Incluye funda y cargador rápido de 18W.",
    features: [["Pantalla", "10.1\" HD+ 1200x1920"], ["Almacenamiento", "128GB + microSD hasta 512GB"], ["Batería", "6000 mAh"], ["Incluye", "Funda kickstand y cargador 18W"]],
    imageQuery: "android tablet with case product photo",
  },
  {
    slug: "foco-inteligente-rgb-x2", name: "Focos inteligentes RGB Wi-Fi (paquete x2)", brand: "Lumina", seller: S,
    category: "tecnologia", subcategory: "Smart home", price: 59990, compareAt: 79990, stock: 48, sku: "LB-RGB-2P",
    popularity: 66, tags: ["foco", "bombilla", "inteligente", "rgb", "wifi", "asistente voz"],
    description: "Transforma cualquier espacio con 16 millones de colores, rutinas automáticas y control por voz. Sin hub adicional: se conecta directo a tu Wi-Fi de 2.4GHz.",
    features: [["Colores", "16 millones + blanco cálido/frío"], ["Control", "App móvil y asistentes de voz"], ["Vida útil", "25.000 horas"], ["Contenido", "Paquete x2 unidades"]],
    imageQuery: "smart rgb light bulb product photo colorful",
  },
  {
    slug: "bateria-portatil-20k", name: "Batería portátil 20.000mAh carga rápida", brand: "Vertex", seller: S,
    category: "tecnologia", subcategory: "Energía", price: 79990, stock: 52, sku: "VX-PB20K",
    isNew: true, popularity: 78, tags: ["bateria", "powerbank", "carga", "usb", "viaje"],
    description: "Carga tu celular hasta 4 veces con esta batería de 20.000mAh con carga rápida PD 22.5W y tres puertos. Indicador digital de porcentaje.",
    features: [["Capacidad", "20.000 mAh"], ["Carga rápida", "PD 22.5W + QC 3.0"], ["Puertos", "2 USB-A + 1 USB-C"], ["Extras", "Linterna LED integrada"]],
    imageQuery: "power bank battery charger product photo",
  },
  // ─── CELULARES ────────────────────────────────────────────────
  {
    slug: "celular-vertex-x6-256", name: "Celular Vertex X6 256GB", brand: "Vertex", seller: "Vertex Mobile",
    category: "celulares", subcategory: "Celulares", price: 1399000, compareAt: 1699000, stock: 12, sku: "VX-X6-256",
    isFeatured: true, popularity: 99, tags: ["celular", "smartphone", "android", "camara", "256gb"],
    description: "Pantalla AMOLED 120Hz, cámara triple de 108MP y batería de 5000mAh con carga de 33W. El equilibrado que estabas esperando.",
    features: [["Pantalla", "6.67\" AMOLED 120Hz"], ["Cámara", "Triple 108MP + 8MP + 2MP"], ["Batería", "5000 mAh carga 33W"], ["Memoria", "8GB RAM + 256GB"]],
    variants: [{ kind: "Color", value: "Negro medianoche", stock: 5 }, { kind: "Color", value: "Verde bosque", stock: 4 }, { kind: "Color", value: "Blanco perla", stock: 3 }],
    imageQuery: "modern android smartphone product photo with triple camera",
  },
  {
    slug: "celular-orbis-a5-128", name: "Celular Orbis A5 128GB", brand: "Orbis", seller: "Orbis Mobile",
    category: "celulares", subcategory: "Celulares", price: 749990, stock: 18, sku: "ORB-A5-128",
    popularity: 85, tags: ["celular", "smartphone", "economico", "gama media"],
    description: "El aliado del día a día: pantalla 6.5\" HD+, batería de dos días y doble cámara con modo retrato. Viene desbloqueado para cualquier operador.",
    features: [["Pantalla", "6.5\" HD+ 90Hz"], ["Cámara", "Doble 50MP + 2MP"], ["Batería", "6000 mAh"], ["Memoria", "6GB RAM + 128GB"]],
    imageQuery: "budget smartphone product photo back view",
  },
  {
    slug: "cargador-gan-65w", name: "Cargador rápido GaN 65W + cable USB-C", brand: "Vertex", seller: S,
    category: "celulares", subcategory: "Cargadores", price: 69990, compareAt: 89990, stock: 60, sku: "VX-GAN65",
    popularity: 88, tags: ["cargador", "gan", "usb-c", "rapido", "adaptador"],
    description: "Cargador de tecnología GaN ultra compacto con 65W de potencia para cargar celular, tablet y hasta portátil. Incluye cable USB-C a USB-C de 1.5m trenzado.",
    features: [["Potencia", "65W PD 3.0 / PPS"], ["Tecnología", "GaN compacta y fresca"], ["Puertos", "2 USB-C + 1 USB-A"], ["Incluye", "Cable trenzado 1.5m"]],
    imageQuery: "gan usb-c wall charger with cable product photo",
  },
  {
    slug: "forro-antigolpes-militar", name: "Forro antigolpes militar", brand: "Kaimán", seller: S,
    category: "celulares", subcategory: "Forros y protecciones", price: 34990, stock: 80, sku: "KM-CA-MIL",
    popularity: 74, tags: ["forro", "carcasa", "proteccion", "celular", "antigolpes"],
    description: "Esquinas reforzadas con tecnología de absorción de impacto y labio elevado para proteger cámara y pantalla. Material antiamarilleo.",
    features: [["Protección", "Certificación de caída 3m"], ["Material", "TPU + policarbonato"], ["Compatibilidad", "Múltiples modelos (elige al pedir)"], ["Diseño", "Compacto con agarre suave"]],
    variants: [{ kind: "Modelo", value: "Vertex X6", stock: 30 }, { kind: "Modelo", value: "Orbis A5", stock: 30 }, { kind: "Modelo", value: "Genérico 6.5\"", stock: 20 }],
    imageQuery: "rugged phone case product photo black",
  },
  {
    slug: "smartwatch-krona-fit-2", name: "Smartwatch Krona Fit 2 GPS", brand: "Krona", seller: "Krona Store",
    category: "celulares", subcategory: "Smartwatches", price: 189990, compareAt: 249990, stock: 16, sku: "KRF2-GPS",
    isFeatured: true, isNew: true, popularity: 90, tags: ["smartwatch", "reloj", "deporte", "gps", "fitness", "salud"],
    description: "Reloj inteligente con GPS integrado, monitor de ritmo cardíaco y SpO2, 100+ modos deportivos y batería para 14 días. Resistente 5ATM.",
    features: [["Pantalla", "AMOLED 1.43\" 466x466"], ["Sensores", "HR, SpO2, sueño, estrés"], ["GPS", "Integrado con rutas"], ["Resistencia", "5ATM (natación)"]],
    imageQuery: "sport smartwatch product photo with heart rate display",
  },
  // ─── HOGAR ────────────────────────────────────────────────────
  {
    slug: "licuadora-vortexpro-900", name: "Licuadora VortexPro 900W", brand: "VortexPro", seller: "Casa & Sabor Ltda.",
    category: "hogar", subcategory: "Cocina", price: 189990, compareAt: 249990, stock: 25, sku: "VP-900-BLK",
    isFeatured: true, popularity: 91, tags: ["licuadora", "cocina", "jugos", "batidos", "electrodomestico"],
    description: "Motor de 900W y cuchillas de acero inoxidable de 6 puntas que licuan hielo, fruta congelada y hasta granos. Jarra de vidrio de 1.5L apta para lavavajillas.",
    features: [["Potencia", "900W"], ["Jarra", "Vidrio 1.5L"], ["Velocidades", "6 + función Pulso"], ["Cuchillas", "Acero inoxidable 6 puntas"]],
    imageQuery: "kitchen blender glass jar product photo",
  },
  {
    slug: "sarten-premium-26cm", name: "Sartén antiadherente Premium 26cm", brand: "Casa & Sabor", seller: "Casa & Sabor Ltda.",
    category: "hogar", subcategory: "Cocina", price: 74990, stock: 40, sku: "CS-ST26",
    popularity: 69, tags: ["sarten", "cocina", "antiadherente", "gratis"],
    description: "Recubrimiento antiadherente de 5 capas libre de PFOA, base inducción-compatible y mango ergonómico que no calienta. Para cocinar con menos aceite.",
    features: [["Diámetro", "26 cm"], ["Antiadherente", "5 capas sin PFOA"], ["Compatibilidad", "Gas, eléctrica e inducción"], ["Mango", "Baquelita termoaislante"]],
    imageQuery: "nonstick frying pan product photo",
  },
  {
    slug: "sabanas-algodon-400", name: "Juego de sábanas algodón 400 hilos", brand: "Nube", seller: "Textiles Nube",
    category: "hogar", subcategory: "Dormitorio", price: 129990, compareAt: 159990, stock: 30, sku: "NB-400-SET",
    popularity: 76, tags: ["sabanas", "cama", "algodon", "dormitorio", "descanso"],
    description: "Algodón de 400 hilos, suavidad que mejora con cada lavada. Incluye sábana de abajo ajustable, sábana superior y 2 fundas.",
    features: [["Material", "100% algodón 400 hilos"], ["Incluye", "4 piezas"], ["Cuidado", "Lavadora en frío"], ["Colores", "Blanco, gris, beige"]],
    variants: [{ kind: "Tamaño", value: "Cama 1.5 plazas", stock: 12 }, { kind: "Tamaño", value: "Cama 2 plazas", stock: 10 }, { kind: "Tamaño", value: "Queen", stock: 8 }],
    imageQuery: "white cotton bed sheets set product photo",
  },
  {
    slug: "robot-aspirador-cleanbot", name: "Robot aspiradora CleanBot láser", brand: "CleanBot", seller: "Andina Tech",
    category: "hogar", subcategory: "Limpieza", price: 899990, compareAt: 1199900, stock: 7, sku: "CB-L20",
    isFeatured: true, popularity: 94, tags: ["aspiradora", "robot", "limpieza", "smart", "casa"],
    description: "Navegación láser LiDAR con mapeo multi-piso, succión de 4000Pa y trapeado inteligente. Prográmalo desde la app y llega a casa con el piso impecable.",
    features: [["Navegación", "LiDAR + mapas multi-piso"], ["Succión", "4000 Pa"], ["Autonomía", "180 minutos"], ["Control", "App + asistentes de voz"]],
    imageQuery: "robot vacuum cleaner product photo",
  },
  {
    slug: "freidora-aire-crispy-55", name: "Freidora de aire Crispy 5.5L", brand: "Casa & Sabor", seller: "Casa & Sabor Ltda.",
    category: "hogar", subcategory: "Cocina", price: 319990, compareAt: 399990, stock: 19, sku: "CS-AF55",
    popularity: 95, tags: ["freidora", "aire", "cocina", "saludable", "papas"],
    description: "Cocina crujiente sin aceite con 8 programas predefinidos, canasta de 5.5L para toda la familia y panel digital táctil. Incluye recetario colombiano.",
    features: [["Capacidad", "5.5 litros"], ["Potencia", "1700W"], ["Programas", "8 predefinidos"], ["Extras", "Recetario incluido"]],
    imageQuery: "digital air fryer kitchen appliance product photo",
  },
  {
    slug: "organizador-closet-6niveles", name: "Organizador de closet modular 6 niveles", brand: "Ordena+", seller: S,
    category: "hogar", subcategory: "Decoración", price: 49990, stock: 45, sku: "OR-C6",
    popularity: 58, tags: ["organizador", "closet", "ropa", "orden", "hogar"],
    description: "Sistema modular resistente que multiplica el espacio de tu closet. Se instala sin herramientas y soporta hasta 8kg por nivel.",
    features: [["Niveles", "6 ajustables"], ["Carga", "8 kg por nivel"], ["Instalación", "Sin herramientas"], ["Material", "Tubo de acero + conexiones ABS"]],
    imageQuery: "closet shelf organizer product photo",
  },
  // ─── MODA ─────────────────────────────────────────────────────
  {
    slug: "camiseta-algodon-premium", name: "Camiseta premium algodón peinado", brand: "Nova Basics", seller: S,
    category: "moda", subcategory: "Camisetas", price: 49990, compareAt: 64990, stock: 90, sku: "NB-TEE-001",
    popularity: 87, tags: ["camiseta", "algodon", "basica", "unisex", "moda"],
    description: "Algodón peinado de 180g, corte recto que no se deforma y cuello reforzado. El básico que necesitas en todos los colores.",
    features: [["Material", "Algodón peinado 180g/m²"], ["Corte", "Recto unisex"], ["Cuidado", "No se encoge con lavado en frío"], ["Origen", "Confección nacional"]],
    variants: [{ kind: "Talla", value: "S", stock: 20 }, { kind: "Talla", value: "M", stock: 25 }, { kind: "Talla", value: "L", stock: 25 }, { kind: "Talla", value: "XL", stock: 20 }],
    imageQuery: "plain premium t-shirt product photo folded",
  },
  {
    slug: "jean-slim-stretch", name: "Jean slim stretch confort", brand: "Urban", seller: "Denim del Valle",
    category: "moda", subcategory: "Jeans", price: 109990, compareAt: 139990, stock: 35, sku: "UR-JN-SLM",
    popularity: 82, tags: ["jean", "pantalon", "denim", "slim", "moda"],
    description: "Denim con 2% de elastano para libertad total de movimiento, bolsillos reforzados y acabados que no destiñen.",
    features: [["Material", "98% algodón + 2% elastano"], ["Corte", "Slim fit tiro medio"], ["Cuidado", "Lavar al revés"], ["Garantía", "Cosería de por vida"]],
    variants: [{ kind: "Talla", value: "28", stock: 5 }, { kind: "Talla", value: "30", stock: 8 }, { kind: "Talla", value: "32", stock: 10 }, { kind: "Talla", value: "34", stock: 7 }, { kind: "Talla", value: "36", stock: 5 }],
    imageQuery: "blue slim fit jeans product photo",
  },
  {
    slug: "chaqueta-bomber-impermeable", name: "Chaqueta bomber urbana impermeable", brand: "Urban", seller: "Denim del Valle",
    category: "moda", subcategory: "Chaquetas", price: 179990, compareAt: 219990, stock: 14, sku: "UR-BMB-01",
    isNew: true, popularity: 73, tags: ["chaqueta", "bomber", "impermeable", "lluvia", "urbano"],
    description: "Tejido repelente al agua con interior térmico ligero, puños ajustables y bolsillos internos con cierre. Ideal para las tardes de lluvia.",
    features: [["Impermeabilidad", "Repelente DWR"], ["Interior", "Térmico ligero"], ["Bolsillos", "2 externos + 2 internos"], ["Unisex", "Sí"]],
    variants: [{ kind: "Talla", value: "S", stock: 3 }, { kind: "Talla", value: "M", stock: 5 }, { kind: "Talla", value: "L", stock: 4 }, { kind: "Talla", value: "XL", stock: 2 }],
    imageQuery: "urban bomber jacket product photo",
  },
  {
    slug: "vestido-floral-verano", name: "Vestido floral verano", brand: "Malva", seller: "Malva Diseño",
    category: "moda", subcategory: "Vestidos", price: 89990, stock: 22, sku: "MV-VS-101",
    popularity: 64, tags: ["vestido", "floral", "verano", "femenino", "moda"],
    description: "Vestido midi con estampado floral exclusivo diseñado por talentos locales, tela fresca con caída fluida y ajuste en cintura.",
    features: [["Largo", "Midi"], ["Material", "Viscosa fresca"], ["Diseño", "Estampado exclusivo"], ["Detalle", "Cintura ajustable"]],
    variants: [{ kind: "Talla", value: "S", stock: 6 }, { kind: "Talla", value: "M", stock: 8 }, { kind: "Talla", value: "L", stock: 5 }, { kind: "Talla", value: "XL", stock: 3 }],
    imageQuery: "floral summer midi dress product photo",
  },
  {
    slug: "hoodie-basico-unisex", name: "Hoodie básico unisex", brand: "Nova Basics", seller: S,
    category: "moda", subcategory: "Camisetas", price: 79990, stock: 40, sku: "NB-HD-001",
    popularity: 79, tags: ["hoodie", "buso", "capucha", "unisex", "moda", "frio"],
    description: "Franela con capucha en felpa peinada de 320g, cordones metálicos y bolsillo canguro amplio. Abrigo sin volumen.",
    features: [["Material", "Felpa peinada 320g/m²"], ["Capucha", "Doble capa con cordón"], ["Bolsillo", "Canguro"], ["Unisex", "Sí"]],
    variants: [{ kind: "Talla", value: "S", stock: 10 }, { kind: "Talla", value: "M", stock: 12 }, { kind: "Talla", value: "L", stock: 10 }, { kind: "Talla", value: "XL", stock: 8 }],
    imageQuery: "plain hoodie sweatshirt product photo",
  },
  // ─── CALZADO ──────────────────────────────────────────────────
  {
    slug: "tenis-urban-runner", name: "Tenis Urban Runner amortiguados", brand: "Urban", seller: "Calzado Andino",
    category: "calzado", subcategory: "Tenis", price: 149990, compareAt: 199990, stock: 28, sku: "UR-RUN-01",
    isFeatured: true, popularity: 93, tags: ["tenis", "zapatos", "deportivos", "correr", "comodos"],
    description: "Mediasuela con espuma reactiva, upper transpirable de malla y suela de goma con agarre multidireccional. Camina todo el día sin cansancio.",
    features: [["Amortiguación", "Espuma reactiva EVA+"], ["Upper", "Malla transpirable"], ["Suela", "Goma de alta abrasión"], ["Peso", "270 g (talla 40)"]],
    variants: [{ kind: "Talla", value: "38", stock: 4 }, { kind: "Talla", value: "39", stock: 5 }, { kind: "Talla", value: "40", stock: 6 }, { kind: "Talla", value: "41", stock: 7 }, { kind: "Talla", value: "42", stock: 4 }, { kind: "Talla", value: "43", stock: 2 }],
    imageQuery: "running sneakers shoes product photo",
  },
  {
    slug: "botas-montana-trekker", name: "Botas de montaña Trekker impermeables", brand: "Trekker", seller: "Montaña Verde",
    category: "calzado", subcategory: "Botas", price: 229990, stock: 11, sku: "TK-BT-PRO",
    popularity: 70, tags: ["botas", "montana", "senderismo", "impermeables", "outdoor"],
    description: "Membrana impermeable transpirable, caña alta con soporte de tobillo y suela de gran tracción para trochas andinas.",
    features: [["Impermeables", "Membrana transpirable"], ["Suela", "Tracción profunda"], ["Soporte", "Caña alta con refuerzo"], ["Uso", "Senderismo y camping"]],
    variants: [{ kind: "Talla", value: "39", stock: 2 }, { kind: "Talla", value: "40", stock: 3 }, { kind: "Talla", value: "41", stock: 3 }, { kind: "Talla", value: "42", stock: 2 }, { kind: "Talla", value: "43", priceDelta: 10000, stock: 1 }],
    imageQuery: "hiking boots waterproof product photo",
  },
  {
    slug: "sandalias-comfort-gel", name: "Sandalias Comfort Gel", brand: "Comfort", seller: "Calzado Andino",
    category: "calzado", subcategory: "Sandalias", price: 59990, compareAt: 79990, stock: 33, sku: "CF-SD-001",
    popularity: 61, tags: ["sandalias", "comodas", "verano", "gel", "playa"],
    description: "Plantilla de gel memory que se adapta a tu pisada, tira suave que no roza y suela antideslizante. Comodidad inmediata.",
    features: [["Plantilla", "Gel memory foam"], ["Suela", "Antideslizante"], ["Tiras", "Poliéster suave"], ["Secado", "Rápido, ideal para playa"]],
    variants: [{ kind: "Talla", value: "36", stock: 6 }, { kind: "Talla", value: "37", stock: 7 }, { kind: "Talla", value: "38", stock: 7 }, { kind: "Talla", value: "39", stock: 6 }, { kind: "Talla", value: "40", stock: 7 }],
    imageQuery: "comfort sandals product photo",
  },
  {
    slug: "zapatos-cuero-clasicos", name: "Zapatos de cuero clásicos", brand: "CRA Cueros", seller: "CRA Cueros",
    category: "calzado", subcategory: "Formales", price: 169990, stock: 12, sku: "CRA-ZP-01",
    popularity: 67, tags: ["zapatos", "cuero", "formales", "oficina", "elegantes"],
    description: "Cuero genuino curtido artesanalmente, costuras a mano y plantilla acolchada. Elegancia que dura años con cuidado básico.",
    features: [["Material", "Cuero genuino"], ["Construcción", "Curtido artesanal"], ["Plantilla", "Acolchada extraíble"], ["Suela", "Caucho silencioso"]],
    variants: [{ kind: "Talla", value: "39", stock: 2 }, { kind: "Talla", value: "40", stock: 3 }, { kind: "Talla", value: "41", stock: 4 }, { kind: "Talla", value: "42", stock: 3 }],
    imageQuery: "brown leather dress shoes product photo",
  },
  // ─── BELLEZA ──────────────────────────────────────────────────
  {
    slug: "serum-vitamina-c-30ml", name: "Sérum vitamina C 15% 30ml", brand: "Lumière", seller: "Belleza Simple",
    category: "belleza", subcategory: "Cuidado de la piel", price: 79990, compareAt: 99990, stock: 38, sku: "LM-VC15",
    isFeatured: true, popularity: 89, tags: ["serum", "vitamina c", "skincare", "antioxidante", "rutina"],
    description: "Vitamina C estabilizada al 15% con ácido hialurónico para uniformar el tono y dar luminosidad. Fórmula libre de fragancias, apta para piel sensible.",
    features: [["Activo", "Vitamina C 15% + Vitamina E"], ["Complemento", "Ácido hialurónico"], ["Uso", "Mañana, antes del bloqueador"], ["Test", "Dermatológicamente probado"]],
    imageQuery: "vitamin c serum dropper bottle skincare product photo",
  },
  {
    slug: "secadora-ion-2000", name: "Secadora iónica profesional 2000W", brand: "Lumière", seller: "Belleza Simple",
    category: "belleza", subcategory: "Cabello", price: 149990, compareAt: 189990, stock: 17, sku: "LM-SC2000",
    popularity: 77, tags: ["secadora", "cabello", "ionica", "pelo", "profesional"],
    description: "Motor AC de larga vida, tecnología iónica que reduce el frizz y 3 niveles de temperatura con chorro de aire frío para fijar peinados.",
    features: [["Potencia", "2000W motor AC"], ["Tecnología", "Iónica anti-frizz"], ["Configuraciones", "3 calor + 2 velocidad"], ["Incluye", "2 boquillas concentradoras"]],
    imageQuery: "professional hair dryer product photo",
  },
  {
    slug: "kit-skincare-diario", name: "Kit skincare diario (5 pasos)", brand: "Lumière", seller: "Belleza Simple",
    category: "belleza", subcategory: "Cuidado de la piel", price: 129990, stock: 24, sku: "LM-KIT5",
    isNew: true, popularity: 72, tags: ["skincare", "kit", "rutina", "limpieza", "hidratacion"],
    description: "Todo lo esencial: limpiador, tónico, sérum, hidratante y bloqueador SPF50 en tamaños de viaje para probar la rutina completa.",
    features: [["Contenido", "5 productos miniatura"], ["Tipo de piel", "Todo tipo, incluye sensibles"], ["Bloqueador", "SPF 50 PA++++"], ["Ideal para", "Iniciar tu rutina"]],
    imageQuery: "skincare set bottles product photo flat lay",
  },
  {
    slug: "perfume-noche-bogota", name: "Eau de parfum 'Noche de Bogotá' 100ml", brand: "Esencia Colombia", seller: "Esencia Colombia",
    category: "belleza", subcategory: "Perfumes", price: 189990, stock: 20, sku: "EC-NB100",
    popularity: 68, tags: ["perfume", "eau de parfum", "fragancia", "regalo"],
    description: "Notas de salida de bergamota y cardamomo, corazón de rosa y café de Colombia, base de maderas y vainilla. Una fragancia que abraza.",
    features: [["Familia", "Amaderada oriental"], ["Concentración", "Eau de parfum"], ["Duración", "8-10 horas"], ["Presentación", "100ml con atomizador"]],
    imageQuery: "luxury perfume bottle product photo",
  },
  {
    slug: "plancha-ceramica-iris", name: "Plancha alisadora cerámica Iris", brand: "Lumière", seller: "Belleza Simple",
    category: "belleza", subcategory: "Cabello", price: 119990, stock: 19, sku: "LM-PL-IR",
    popularity: 63, tags: ["plancha", "alisadora", "cabello", "ceramica", "pelo"],
    description: "Placas de cerámica turmalina que alisan sin dastrar, calentamiento en 30 segundos y control digital hasta 230°C con apagado automático.",
    features: [["Placas", "Cerámica + turmalina"], ["Temperatura", "120-230°C digital"], ["Calentamiento", "30 segundos"], ["Seguridad", "Auto-apagado a los 60 min"]],
    imageQuery: "ceramic hair straightener flat iron product photo",
  },
  // ─── SALUD ────────────────────────────────────────────────────
  {
    slug: "multivitaminico-adulto-60", name: "Multivitamínico adulto 60 tabletas", brand: "VitaAndes", seller: "VitaAndes",
    category: "salud", subcategory: "Vitaminas y suplementos", price: 45990, stock: 50, sku: "VA-MV60",
    popularity: 75, tags: ["vitaminas", "multivitaminico", "suplemento", "energia", "salud"],
    description: "23 vitaminas y minerales esenciales en dosis diaria única, con hierro de alta absorción. Libre de gluten y azúcar.",
    features: [["Contenido", "60 tabletas (2 meses)"], ["Composición", "23 vitaminas y minerales"], ["Libre de", "Gluten y azúcar"], ["Registro", "Notificación sanitaria vigente"]],
    imageQuery: "vitamin supplement bottle with pills product photo",
  },
  {
    slug: "tensiometro-digital-brazalete", name: "Tensiómetro digital de brazalete", brand: "VitaCheck", seller: "VitaAndes",
    category: "salud", subcategory: "Equipos de salud", price: 119990, compareAt: 149990, stock: 16, sku: "VC-BP01",
    popularity: 66, tags: ["tensiometro", "presion", "salud", "digital", "adulto mayor"],
    description: "Medición automática de presión y pulso con detección de arritmias, memoria para 2 usuarios x 90 mediciones y brazalete universal.",
    features: [["Medición", "Automática oscilométrica"], ["Memoria", "2 usuarios, 90 lecturas c/u"], ["Detección", "Indicador de arritmia"], ["Validación", "Clínica internacional"]],
    imageQuery: "digital blood pressure monitor product photo",
  },
  {
    slug: "botiquin-primeros-auxilios-45", name: "Botiquín primeros auxilios 45 piezas", brand: "VitaCheck", seller: S,
    category: "salud", subcategory: "Primeros auxilios", price: 59990, stock: 26, sku: "VC-K45",
    popularity: 54, tags: ["botiquin", "primeros auxilios", "emergencia", "casa", "auto"],
    description: "Estuche resistente con 45 piezas esenciales: gasas, vendas, antisépticos, pinzas, tijera y guía rápida de primeros auxilios.",
    features: [["Contenido", "45 piezas"], ["Estuche", "Rígido con asa"], ["Incluye", "Guía ilustrativa"], ["Ideal", "Hogar, auto y trabajo"]],
    imageQuery: "first aid kit box product photo",
  },
  {
    slug: "colchoneta-yoga-6mm", name: "Colchoneta yoga antideslizante 6mm", brand: "ZenAndes", seller: "ZenAndes",
    category: "salud", subcategory: "Bienestar", price: 54990, compareAt: 69990, stock: 31, sku: "ZA-YG6",
    popularity: 62, tags: ["yoga", "colchoneta", "pilates", "ejercicio", "bienestar"],
    description: "Doble capa antideslizante de 6mm que protege tus rodillas y columna, con marca de alineación corporal y banda de transporte.",
    features: [["Grosor", "6 mm doble capa"], ["Material", "TPE ecológico"], ["Extras", "Líneas de alineación + banda"], ["Medidas", "183 x 61 cm"]],
    imageQuery: "yoga mat rolled product photo",
  },
  // ─── DEPORTES ─────────────────────────────────────────────────
  {
    slug: "mancuernas-ajustables-20kg", name: "Mancuernas ajustables 20kg (par)", brand: "IronFlex", seller: "IronFlex Colombia",
    category: "deportes", subcategory: "Gimnasio", price: 189990, compareAt: 239990, stock: 13, sku: "IF-DB20",
    isFeatured: true, popularity: 86, tags: ["mancuernas", "pesas", "gimnasio", "fuerza", "musculacion"],
    description: "Par de mancuernas ajustables de 2.5kg a 10kg c/u con discos recubiertos de neopreno. Monta tu gym en casa sin ocupar espacio.",
    features: [["Peso total", "20 kg (2x10 kg ajustables)"], ["Ajuste", "Discos de 1.25 y 2.5 kg"], ["Recubrimiento", "Neopreno que no raya el piso"], ["Agarre", "Antideslizante"]],
    imageQuery: "adjustable dumbbells pair product photo",
  },
  {
    slug: "bicicleta-montana-29", name: "Bicicleta de montaña 29\" 21 velocidades", brand: "AndesBike", seller: "AndesBike",
    category: "deportes", subcategory: "Ciclismo", price: 1299000, compareAt: 1499000, stock: 5, sku: "AB-MTB29",
    popularity: 83, codAvailable: false, tags: ["bicicleta", "montana", "mtb", "29", "ciclismo", "deporte"],
    description: "Cuadro de aluminio 6061, horquilla con bloqueo, frenos de disco mecánicos y 21 velocidades. Lista para ciclovía y trochas suaves.",
    features: [["Cuadro", "Aluminio 6061 tamaño M"], ["Ruedas", "29\" doble pared"], ["Frenos", "Disco mecánico 160mm"], ["Cambios", "21 velocidades"]],
    imageQuery: "mountain bike product photo side view",
  },
  {
    slug: "balon-futbol-pro-5", name: "Balón de fútbol profesional talla 5", brand: "AndesBike", seller: S,
    category: "deportes", subcategory: "Fútbol", price: 79990, stock: 42, sku: "SPT-BL5",
    popularity: 80, tags: ["balon", "futbol", "soccer", "talla 5", "deporte"],
    description: "Balón cosido a máquina con superficie texturizada para mayor control y cámara de látex que mantiene el aire por semanas.",
    features: [["Tamaño", "Talla 5 oficial"], ["Construcción", "32 paneles cosidos"], ["Cámara", "Látex con válvula butílica"], ["Uso", "Césped y sintético"]],
    imageQuery: "soccer football ball product photo",
  },
  {
    slug: "rodilleras-deportivas-par", name: "Rodilleras deportivas (par)", brand: "IronFlex", seller: "IronFlex Colombia",
    category: "deportes", subcategory: "Gimnasio", price: 44990, stock: 36, sku: "IF-KN01",
    popularity: 57, tags: ["rodilleras", "proteccion", "gimnasio", "crossfit", "deporte"],
    description: "Soporte de neopreno con refuerzos laterales flexibles para sentadillas pesadas y deportes de impacto. Talla ajustable con velcro.",
    features: [["Material", "Neopreno 5mm"], ["Refuerzo", "Laterales flexibles"], ["Cierre", "Velcro ajustable"], ["Contenido", "Par (2 unidades)"]],
    imageQuery: "knee support braces sports product photo",
  },
  {
    slug: "cuerda-salto-velocidad", name: "Cuerda de salto de velocidad", brand: "IronFlex", seller: S,
    category: "deportes", subcategory: "Gimnasio", price: 29990, compareAt: 39990, stock: 48, sku: "IF-JR01",
    popularity: 55, tags: ["cuerda", "salto", "cardio", "crossfit", "box"],
    description: "Cuerda de acero recubierta con rodamientos de alta velocidad y mangos antideslizantes. El cardio más eficiente por peso.",
    features: [["Cuerda", "Acero recubierto 3m ajustable"], ["Rodamientos", "De bolas de alta velocidad"], ["Mangos", "Aluminio con grip"], ["Incluye", "Estuche transportador"]],
    imageQuery: "speed jump rope product photo",
  },
  // ─── MASCOTAS ─────────────────────────────────────────────────
  {
    slug: "alimento-perro-adulto-15kg", name: "Alimento para perro adulto 15kg", brand: "PetNutri", seller: "PetNutri",
    category: "mascotas", subcategory: "Perros", price: 134990, compareAt: 159990, stock: 27, sku: "PN-AD15",
    popularity: 88, tags: ["alimento", "perro", "concentrado", "mascota", "15kg"],
    description: "Croquetas con pollo como primer ingrediente, omega 3 y 6 para pelaje brillante y prebióticos para digestión sana. Saco resellable de 15kg.",
    features: [["Ingrediente", "Pollo (22% proteína)"], ["Beneficios", "Pelaje, digestión, energía"], ["Presentación", "Saco resellable 15 kg"], ["Etapa", "Adulto todas las razas"]],
    imageQuery: "dog food kibble bag product photo",
  },
  {
    slug: "cama-mascota-ortopedica", name: "Cama para mascota ortopédica", brand: "PetComfort", seller: "PetComfort",
    category: "mascotas", subcategory: "Camas y transporte", price: 89990, stock: 23, sku: "PC-BED-XL",
    popularity: 65, tags: ["cama", "mascota", "perro", "gato", "descanso"],
    description: "Base de espuma ortopédica que cuida las articulaciones, funda removible lavable a máquina y base antideslizante. Para peluditos que duermen como humanos.",
    features: [["Relleno", "Espuma ortopédica 10cm"], ["Funda", "Removible lavable"], ["Base", "Antideslizante"], ["Tamaños", "M, L y XL"]],
    variants: [{ kind: "Tamaño", value: "M (70cm)", stock: 8 }, { kind: "Tamaño", value: "L (90cm)", stock: 8 }, { kind: "Tamaño", value: "XL (110cm)", priceDelta: 20000, stock: 7 }],
    imageQuery: "orthopedic dog bed product photo",
  },
  {
    slug: "rascador-gatos-3niveles", name: "Rascador para gatos 3 niveles", brand: "PetComfort", seller: "PetComfort",
    category: "mascotas", subcategory: "Gatos", price: 119990, compareAt: 149990, stock: 14, sku: "PC-SCR3",
    popularity: 71, tags: ["rascador", "gato", "mascota", "juguete", "mueble"],
    description: "Tres niveles con sisal natural, cueva para dormir y peluche colgante. Salva tus muebles y entretiene a tu michi por horas.",
    features: [["Niveles", "3 plataformas + cueva"], ["Material", "Sisal natural + peluche"], ["Estabilidad", "Base reforzada antivuelco"], ["Altura", "80 cm"]],
    imageQuery: "cat tree scratching post product photo",
  },
  {
    slug: "juguete-dispensador-mascota", name: "Juguete dispensador de premios", brand: "PetComfort", seller: S,
    category: "mascotas", subcategory: "Juguetes", price: 39990, stock: 44, sku: "PC-TOY1",
    isNew: true, popularity: 53, tags: ["juguete", "mascota", "dispensador", "entretenimiento", "premios"],
    description: "Esfera que libera premios mientras tu peludito juega: estimula su mente y lo mantiene activo cuando estás fuera.",
    features: [["Material", "ABS no tóxico"], ["Mecánica", "Ajusta la dificultad"], ["Apto", "Perros y gatos"], ["Limpieza", "Se desarma fácil"]],
    imageQuery: "treat dispenser toy ball for pets product photo",
  },
  {
    slug: "transportador-mascota-rejilla", name: "Transportador de mascota con rejilla", brand: "PetComfort", seller: "PetComfort",
    category: "mascotas", subcategory: "Camas y transporte", price: 74990, stock: 18, sku: "PC-CRG",
    popularity: 59, tags: ["transportador", "mascota", "viaje", "veterinaria", "gato"],
    description: "Transportador ventilado con apertura superior y frontal, cierre de seguridad y base antideslizante. Aprobado para viajes en automóvil.",
    features: [["Aperturas", "Superior y frontal"], ["Seguridad", "Cierres con pestillo doble"], ["Ventilación", "Rejillas en 4 lados"], ["Capacidad", "Hasta 8 kg"]],
    imageQuery: "pet carrier crate product photo",
  },
  // ─── BEBÉS ────────────────────────────────────────────────────
  {
    slug: "coche-bebe-3en1", name: "Coche de bebé 3 en 1", brand: "BabyAndes", seller: "BabyAndes",
    category: "bebes", subcategory: "Coches y sillas", price: 699990, compareAt: 849990, stock: 8, sku: "BA-ST3",
    isFeatured: true, popularity: 85, tags: ["coche", "bebe", "carriola", "3 en 1", "paseo"],
    description: "Sistema de viaje completo: cochecito, portabebé y silla para auto. Reclinado total, ruedas todo terreno y plegado con una mano.",
    features: [["Sistema", "3 en 1 modular"], ["Reclinado", "Total (180°)"], ["Ruedas", "Todo terreno con suspensión"], ["Plegado", "Con una mano"]],
    imageQuery: "baby stroller travel system product photo",
  },
  {
    slug: "panales-etapa3-84", name: "Pañales etapa 3 caja 84 unidades", brand: "BabySoft", seller: "BabySoft",
    category: "bebes", subcategory: "Higiene y cuidado", price: 92990, stock: 30, prepayEligible: false, sku: "BS-D3-84",
    popularity: 82, tags: ["panales", "bebe", "etapa 3", "caja", "higiene"],
    description: "Máxima absorción hasta 12 horas con canales de aire para evitar irritación. Caja económica de 84 unidades etapa 3 (6-10kg).",
    features: [["Unidades", "84 pañales"], ["Peso", "6 a 10 kg (etapa 3)"], ["Absorción", "Hasta 12 horas"], ["Extras", "Indicador de humedad"]],
    imageQuery: "baby diapers pack product photo",
  },
  {
    slug: "biberones-anticolicos-set3", name: "Set 3 biberones anticólicos", brand: "BabySoft", seller: S,
    category: "bebes", subcategory: "Alimentación", price: 42990, stock: 35, sku: "BS-BT3",
    popularity: 60, tags: ["biberones", "bebe", "anticolico", "mamadera", "alimentacion"],
    description: "Tres biberones de 150/260/330ml con válvula anticólica, material libre de BPA y tetinas de flujo variable que imitan la lactancia.",
    features: [["Contenido", "3 tamaños + escobilla"], ["Material", "PP libre de BPA"], ["Válvula", "Anticólica certificada"], ["Compatible", "Esterilizador y lavavajillas"]],
    imageQuery: "baby bottles set product photo",
  },
  {
    slug: "monitor-bebe-video", name: "Monitor de bebé con cámara", brand: "BabyAndes", seller: "BabyAndes",
    category: "bebes", subcategory: "Juegos", price: 249990, compareAt: 299990, stock: 10, sku: "BA-MON01",
    popularity: 67, tags: ["monitor", "bebe", "camara", "vigilabebes", "dormir"],
    description: "Cámara con visión nocturna infrarroja, audio bidireccional y pantalla portátil de 3.2\" con alcance de 250m. Duerme tranquilo.",
    features: [["Pantalla", "3.2\" LCD portátil"], ["Visión", "Nocturna infrarroja"], ["Audio", "Bidireccional"], ["Alcance", "250 metros"]],
    imageQuery: "baby monitor with camera product photo",
  },
  // ─── JUGUETES ─────────────────────────────────────────────────
  {
    slug: "bloques-construccion-500", name: "Set de bloques de construcción 500 piezas", brand: "ArmaBloq", seller: "ArmaBloq",
    category: "juguetes", subcategory: "Bloques y construcción", price: 99990, compareAt: 129990, stock: 21, sku: "AB-500",
    isFeatured: true, popularity: 84, tags: ["bloques", "construccion", "juguetes", "niños", "creatividad"],
    description: "500 piezas compatibles con marcas estándar en 20 colores, con base de armado y guía de 12 modelos. Creatividad sin pantallas.",
    features: [["Piezas", "500 en 20 colores"], ["Compatibilidad", "Con marcas estándar"], ["Edad", "4+ años"], ["Incluye", "Base + guía de modelos"]],
    imageQuery: "colorful building blocks set for kids product photo",
  },
  {
    slug: "peluche-oso-gigante-80", name: "Peluche gigante oso 80cm", brand: "Cuddly", seller: S,
    category: "juguetes", subcategory: "Peluches", price: 69990, stock: 19, sku: "CD-OS80",
    popularity: 76, tags: ["peluche", "oso", "gigante", "regalo", "niños"],
    description: "Oso de 80cm relleno de fibra siliconada súper suave, ojos bordados (seguros para bebés) y relleno que no se deforma con abrazos intensos.",
    features: [["Altura", "80 cm"], ["Relleno", "Fibra siliconada premium"], ["Seguridad", "Ojos bordados a mano"], ["Lavado", "A mano o en bolsa"]],
    imageQuery: "giant teddy bear plush toy product photo",
  },
  {
    slug: "juego-mesa-familia-edicion-co", name: "Juego de mesa familiar edición Colombia", brand: "Mesa & Cía", seller: "Mesa & Cía",
    category: "juguetes", subcategory: "Juegos de mesa", price: 54990, stock: 26, sku: "MC-FAM01",
    isNew: true, popularity: 69, tags: ["juego", "mesa", "familia", "colombia", "fiestas"],
    description: "Preguntas y retos sobre cultura, geografía y saberes colombianos para 2 a 6 jugadores. La diversión garantizada de los domingos.",
    features: [["Jugadores", "2 a 6"], ["Edad", "8+ años"], ["Duración", "45 minutos por partida"], ["Contenido", "Tablero + 300 tarjetas"]],
    imageQuery: "family board game box product photo",
  },
  {
    slug: "auto-rc-todoterreno", name: "Auto a control remoto todoterreno", brand: "SpeedyToys", seller: "SpeedyToys",
    category: "juguetes", subcategory: "Control remoto", price: 89990, compareAt: 109990, stock: 15, sku: "ST-RC4x4",
    popularity: 73, tags: ["auto", "control", "remoto", "rc", "juguetes", "niños"],
    description: "Camioneta RC 4x4 con doble motor, llantas de grip profundo, batería recargable y control de 2.4GHz sin interferencias.",
    features: [["Tracción", "4x4 doble motor"], ["Batería", "Recargable 25 min de juego"], ["Control", "2.4GHz 40m de alcance"], ["Escala", "1:16"]],
    imageQuery: "remote control rc monster truck toy product photo",
  },
  // ─── ACCESORIOS ───────────────────────────────────────────────
  {
    slug: "reloj-cuero-clasico-40", name: "Reloj de cuero clásico 40mm", brand: "CRA Cueros", seller: "CRA Cueros",
    category: "accesorios", subcategory: "Relojes", price: 179990, compareAt: 219990, stock: 13, sku: "CRA-RW40",
    popularity: 72, isFeatured: true, tags: ["reloj", "cuero", "clasico", "caballero", "regalo"],
    description: "Caja de acero inoxidable 40mm, movimiento japonés de cuarzo, correa de cuero CRA intercambiable y cristal mineral reforzado.",
    features: [["Caja", "Acero inoxidable 40mm"], ["Movimiento", "Cuarzo japonés"], ["Correa", "Cuero genuino intercambiable"], ["Resistencia", "3ATM salpicaduras"]],
    imageQuery: "classic leather strap wrist watch product photo",
  },
  {
    slug: "billetera-cuero-cra", name: "Billetera de cuero CRA delgada", brand: "CRA Cueros", seller: "CRA Cueros",
    category: "accesorios", subcategory: "Billeteras", price: 64990, stock: 32, sku: "CRA-WL01",
    popularity: 64, tags: ["billetera", "cartera", "cuero", "rfid", "delgada"],
    description: "Billetera slim con protección RFID, 6 ranuras para tarjetas y costuras reforzadas a mano. Cuero que envejece con carácter.",
    features: [["Material", "Cuero CRA genuino"], ["Protección", "Bloqueo RFID"], ["Capacidad", "6 tarjetas + billetes"], ["Grosor", "12mm llena"]],
    imageQuery: "slim leather wallet product photo",
  },
  {
    slug: "aretes-plata-925", name: "Aretes de plata 925 gota", brand: "Plata Andina", seller: "Plata Andina",
    category: "accesorios", subcategory: "Joyería", price: 49990, stock: 28, sku: "PA-ER925",
    popularity: 61, tags: ["aretes", "plata", "925", "joyeria", "regalo"],
    description: "Aretes artesanales en plata 925 con acabado pulido y brida hipoalergénica. Diseñados y elaborados por artesanos colombianos.",
    features: [["Material", "Plata 925 con sello"], ["Peso", "3.2 g el par"], ["Hipoalergénico", "Sí"], ["Origen", "Artesanía nacional"]],
    imageQuery: "silver drop earrings jewelry product photo",
  },
  {
    slug: "bolso-tote-lona", name: "Bolso tote en lona resistente", brand: "Malva", seller: "Malva Diseño",
    category: "accesorios", subcategory: "Bolsos", price: 84990, stock: 22, sku: "MV-TT01",
    popularity: 58, tags: ["bolso", "tote", "lona", "mercado", "eco"],
    description: "Lona encerada de 16oz que aguanta el mercado completo, bolsillo interno con cierre y asas reforzadas. Elegante y práctico.",
    features: [["Material", "Lona encerada 16oz"], ["Bolsillos", "Interno con cierre + porta botella"], ["Asas", "Reforzadas hasta 15 kg"], ["Medidas", "40 x 35 x 14 cm"]],
    imageQuery: "canvas tote bag product photo",
  },
  // ─── HERRAMIENTAS ─────────────────────────────────────────────
  {
    slug: "taladro-percutor-800w", name: "Taladro percutor 800W con maletín", brand: "Kaimán", seller: "Ferretería Kaimán",
    category: "herramientas", subcategory: "Herramientas eléctricas", price: 229990, compareAt: 289990, stock: 12, sku: "KM-DR800",
    isFeatured: true, popularity: 87, tags: ["taladro", "percutor", "herramienta", "ferreteria", "diy"],
    description: "Taladro percutor de 800W con mango antivibración, velocidad variable y maletín con 20 accesorios. Para colgar cuadros hasta remodelar.",
    features: [["Potencia", "800W velocidad variable"], ["Función", "Taladro + percutor"], ["Incluye", "Maletín + 20 accesorios"], ["Garantía", "2 años"]],
    imageQuery: "corded hammer drill power tool with case product photo",
  },
  {
    slug: "kit-llaves-108-piezas", name: "Kit de llaves combinadas 108 piezas", brand: "Kaimán", seller: "Ferretería Kaimán",
    category: "herramientas", subcategory: "Herramientas manuales", price: 139990, stock: 16, sku: "KM-KT108",
    popularity: 79, tags: ["kit", "llaves", "herramientas", "mecanica", "ferreteria"],
    description: "108 piezas en acero cromo-vanadio: dados, llaves combinadas, extensiones y manivela en estuche organizado. El kit que resuelve.",
    features: [["Piezas", "108 en acero Cr-V"], ["Incluye", "Dados 4-32mm + llaves 6-24mm"], ["Estuche", "Rígido organizado"], ["Acabado", "Cromado anticorrosión"]],
    imageQuery: "mechanics tool kit socket set product photo",
  },
  {
    slug: "caja-herramientas-16", name: "Caja de herramientas organizada 16\"", brand: "Kaimán", seller: "Ferretería Kaimán",
    category: "herramientas", subcategory: "Herramientas manuales", price: 74990, stock: 24, sku: "KM-BX16",
    popularity: 62, tags: ["caja", "herramientas", "organizacion", "ferreteria"],
    description: "Caja de 16\" con bandejas removibles, compartimentos con divisores y cierre de seguridad. Todo en su sitio, siempre.",
    features: [["Tamaño", "16 pulgadas"], ["Bandejas", "2 removibles"], ["Divisores", "Ajustables"], ["Material", "Polipropileno reforzado"]],
    imageQuery: "tool box storage case product photo",
  },
  {
    slug: "pintura-interior-premium-5l", name: "Pintura interior premium mate 5L", brand: "Colores del Valle", seller: "Colores del Valle",
    category: "herramientas", subcategory: "Pintura", price: 89990, stock: 20, codAvailable: false, sku: "CV-PT5",
    popularity: 55, tags: ["pintura", "interior", "mate", "casa", "remodelacion"],
    description: "Pintura lavable mate de alta cobertura (rendimiento 40m²/galón), baja en COV y lista para aplicar con rodillo. Blanco y colores bajo pedido.",
    features: [["Rendimiento", "Hasta 40 m² por galón"], ["Acabado", "Mate lavable"], ["Cobertura", "Alta en 2 manos"], ["Presentación", "5 litros"]],
    imageQuery: "interior wall paint bucket product photo",
  },
  // ─── OFICINA ──────────────────────────────────────────────────
  {
    slug: "silla-ergonomica-pro", name: "Silla ergonómica Pro respaldo malla", brand: "WorkFlow", seller: "WorkFlow",
    category: "oficina", subcategory: "Mobiliario", price: 349990, compareAt: 449990, stock: 11, sku: "WF-CH-PRO",
    isFeatured: true, popularity: 90, tags: ["silla", "ergonomica", "oficina", "escritorio", "home office"],
    description: "Respaldo de malla transpirable con soporte lumbar ajustable, reposabrazos 3D y reclinado hasta 135°. Tu espalda te lo va a agradecer.",
    features: [["Respaldo", "Malla + soporte lumbar ajustable"], ["Reposabrazos", "3D ajustables"], ["Reclinado", "90° a 135°"], ["Carga", "Hasta 130 kg"]],
    imageQuery: "ergonomic office chair mesh product photo",
  },
  {
    slug: "escritorio-ajustable-120", name: "Escritorio ajustable en altura 120cm", brand: "WorkFlow", seller: "WorkFlow",
    category: "oficina", subcategory: "Mobiliario", price: 549990, compareAt: 649990, stock: 6, codAvailable: false, sku: "WF-DK120",
    popularity: 81, tags: ["escritorio", "ajustable", "oficina", "standing desk", "home office"],
    description: "Escritorio eléctrico con memoria de 4 alturas, superficie de 120x60cm resistente a rayaduras y motor silencioso de doble columna.",
    features: [["Superficie", "120 x 60 cm"], ["Ajuste", "Eléctrico 70-115 cm"], ["Memoria", "4 posiciones"], ["Carga", "60 kg"]],
    imageQuery: "height adjustable standing desk product photo",
  },
  {
    slug: "set-papeleria-ejecutivo", name: "Set de papelería ejecutivo", brand: "WorkFlow", seller: S,
    category: "oficina", subcategory: "Papelería", price: 39990, stock: 38, sku: "WF-ST01",
    popularity: 52, tags: ["papeleria", "set", "oficina", "regalo", "escritorio"],
    description: "Set de escritorio con portalápices, agenda A5 encuadernada, bolígrafo metálico y tarjetero. El detalle que ordena tu mesa.",
    features: [["Contenido", "4 piezas"], ["Agenda", "A5 120 páginas"], ["Material", "Cuero sintético"], ["Empaque", "Caja regalo"]],
    imageQuery: "executive desk stationery set product photo",
  },
  {
    slug: "lampara-led-escritorio", name: "Lámpara LED de escritorio regulable", brand: "Lumina", seller: S,
    category: "oficina", subcategory: "Iluminación", price: 64990, compareAt: 79990, stock: 29, sku: "LM-LD01",
    popularity: 60, tags: ["lampara", "led", "escritorio", "estudio", "luz"],
    description: "Luz LED sin parpadeo con 5 temperaturas y 10 niveles de brillo, brazo flexible y puerto USB para cargar tu celular mientras estudias.",
    features: [["Control", "Táctil 5 temperaturas"], ["Brillo", "10 niveles"], ["Extras", "Puerto USB de carga"], ["Vida útil", "50.000 horas"]],
    imageQuery: "led desk lamp product photo",
  },
  // ─── VIAJES ───────────────────────────────────────────────────
  {
    slug: "maleta-cabina-rigida-20", name: "Maleta de cabina rígida 20\"", brand: "Nomad", seller: "Nomad Travel",
    category: "viajes", subcategory: "Maletas", price: 199990, compareAt: 259990, stock: 17, sku: "NM-SP20",
    isFeatured: true, popularity: 88, tags: ["maleta", "cabina", "viaje", "equipaje", "20"],
    description: "Carcasa de ABS texturizado anti-rayaduras, cierre TSA, ruedas giratorias 360° y interior organizado con compartimento para laptops.",
    features: [["Tamaño", "20\" (cabina)"], ["Cierre", "TSA de seguridad"], ["Ruedas", "Dobles giratorias 360°"], ["Interior", "Organizador + bolsillo laptop"]],
    imageQuery: "hard shell carry on suitcase product photo",
  },
  {
    slug: "morral-antirrobo-35l", name: "Morral antirrobo 35L con USB", brand: "Nomad", seller: "Nomad Travel",
    category: "viajes", subcategory: "Morrales", price: 99990, stock: 25, sku: "NM-BP35",
    popularity: 78, tags: ["morral", "mochila", "antirrobo", "viaje", "usb"],
    description: "Compartimentos ocultos, candado integrado, puerto USB externo y banda para fijarlo al trolley. Impermeable y con respaldo ventilado.",
    features: [["Capacidad", "35 litros"], ["Seguridad", "Candado + cierres ocultos"], ["USB", "Puerto de carga externo"], ["Compartimento", "Laptop hasta 15.6\""]],
    imageQuery: "anti theft travel backpack product photo",
  },
  {
    slug: "organizadores-equipaje-set6", name: "Organizadores de equipaje set 6", brand: "Nomad", seller: S,
    category: "viajes", subcategory: "Organizadores", price: 44990, stock: 33, sku: "NM-OR6",
    popularity: 57, tags: ["organizadores", "viaje", "equipaje", "maleta", "orden"],
    description: "Seis bolsos compresibles en diferentes tamaños para separar ropa limpia, sucia y zapatos. Encuentra todo sin desarmar la maleta.",
    features: [["Contenido", "6 bolsos compresibles"], ["Tamaños", "S, M, L, XL + zapatos + laundry"], ["Material", "Poliéster transpirable"], ["Colores", "Variados"]],
    imageQuery: "luggage packing cubes set product photo",
  },
  {
    slug: "almohada-viaje-memory", name: "Almohada de viaje memory foam", brand: "Nube", seller: "Textiles Nube",
    category: "viajes", subcategory: "Comodidad", price: 39990, compareAt: 49990, stock: 41, sku: "NB-PIL01",
    popularity: 63, tags: ["almohada", "viaje", "memory foam", "comodidad", "avion"],
    description: "Memory foam con funda lavable, cierre ajustable que no aprieta y broche para colgarla del equipaje. Llega descansado, llegue donde llegue.",
    features: [["Relleno", "Memory foam"], ["Funda", "Removible y lavable"], ["Cierre", "Ajustable con broche"], ["Extras", "Tapaoídos y tapabocas de regalo"]],
    imageQuery: "memory foam travel neck pillow product photo",
  },
  // ─── AUTOMOTOR ────────────────────────────────────────────────
  {
    slug: "kit-limpieza-auto-9", name: "Kit de limpieza profesional auto 9 piezas", brand: "AutoBrillo", seller: "AutoBrillo",
    category: "automotor", subcategory: "Cuidado y limpieza", price: 64990, stock: 30, sku: "AB-K9",
    popularity: 68, tags: ["kit", "limpieza", "auto", "carro", "detalle"],
    description: "Todo para el detailing en casa: microfibras, cera líquida, limpiador de rinones, aplicadores y cepillos en estuche organizado.",
    features: [["Piezas", "9 profesionales"], ["Microfibras", "3 de alta densidad"], ["Cera", "Líquida con polímeros"], ["Incluye", "Estuche organizador"]],
    imageQuery: "car cleaning kit product photo",
  },
  {
    slug: "casco-moto-integral", name: "Casco integral moto certificado", brand: "RutaSegura", seller: "RutaSegura",
    category: "automotor", subcategory: "Moto", price: 159990, compareAt: 199990, stock: 18, sku: "RS-HLM1",
    isFeatured: true, popularity: 84, tags: ["casco", "moto", "integral", "seguridad", "motocicleta"],
    description: "Certificación de seguridad internacional, visor antiempañante con tratamiento UV, interior removible lavable y sistema de retención micrométrico.",
    features: [["Certificación", "Seguridad internacional"], ["Visor", "Antiempañante UV400"], ["Interior", "Removible y lavable"], ["Retención", "Cierre micrométrico"]],
    variants: [{ kind: "Talla", value: "S (55-56cm)", stock: 5 }, { kind: "Talla", value: "M (57-58cm)", stock: 7 }, { kind: "Talla", value: "L (59-60cm)", stock: 6 }],
    imageQuery: "full face motorcycle helmet product photo",
  },
  {
    slug: "soporte-celular-magnetico", name: "Soporte de celular magnético para auto", brand: "AutoBrillo", seller: S,
    category: "automotor", subcategory: "Accesorios interior", price: 34990, stock: 55, sku: "AB-MG01",
    popularity: 66, tags: ["soporte", "celular", "auto", "magnetico", "gps"],
    description: "Base magnética con 6 imanes de neodimio, rotación 360° y adhesivo 3M que no marca el tablero. Tu GPS siempre a la vista.",
    features: [["Imanes", "6 de neodimio N45"], ["Rotación", "360°"], ["Instalación", "Adhesivo 3M sin marcas"], ["Incluye", "2 placas metálicas"]],
    imageQuery: "magnetic car phone mount product photo",
  },
  {
    slug: "compresor-aire-portatil", name: "Compresor de aire portátil digital", brand: "RutaSegura", seller: "RutaSegura",
    category: "automotor", subcategory: "Auto", price: 89990, compareAt: 109990, stock: 14, sku: "RS-CP01",
    popularity: 74, tags: ["compresor", "aire", "inflador", "auto", "llantas"],
    description: "Inflador digital con presión preestablecida, luz LED de emergencia y auto-apagado al llegar al PSI deseado. Funciona desde el encendedor.",
    features: [["Presión", "Hasta 150 PSI"], ["Presets", "Auto-apagado digital"], ["Alimentación", "12V encendedor"], ["Extras", "Luz LED + boquillas extra"]],
    imageQuery: "portable tire inflator air compressor product photo",
  },
  // ─── DÍA A DÍA ────────────────────────────────────────────────
  {
    slug: "cafe-molido-huila-500", name: "Café molido origen Huila 500g", brand: "Cafés del Sur", seller: "Cafés del Sur",
    category: "dia-a-dia", subcategory: "Mercado", price: 27990, compareAt: 32990, stock: 60, prepayEligible: false, sku: "CS-HU500",
    isFeatured: true, popularity: 92, tags: ["cafe", "huila", "molido", "origen", "colombiano"],
    description: "Café de origen Huila tostado medio, notas de caramelo y panela, molienda para filtrado. Tostado y empacado en finca familiar.",
    features: [["Origen", "Huila, 1.750 msnm"], ["Tueste", "Medio"], ["Notas", "Caramelo y panela"], ["Presentación", "Bolsa valvular 500g"]],
    imageQuery: "ground coffee bag product photo",
  },
  {
    slug: "panela-redonda-1kg", name: "Panela redonda artesanal 1kg", brand: "Panela del Campo", seller: "Panela del Campo",
    category: "dia-a-dia", subcategory: "Despensa", price: 7990, stock: 80, prepayEligible: false, sku: "PC-PN1",
    popularity: 56, tags: ["panela", "artesanal", "dulce", "agua de panela", "colombiano"],
    description: "Panela elaborada en trapiches artesanales del suroeste antioqueño, sin aditivos. Endulza como la abuela.",
    features: [["Peso", "1 kg"], ["Origen", "Antioquia, trapiche artesanal"], ["Ingredientes", "100% jugo de caña"], ["Usos", "Bebidas y repostería"]],
    imageQuery: "colombian panela sugar round block product photo",
  },
  {
    slug: "detergente-liquido-3l", name: "Detergente líquido concentrado 3L", brand: "Limpia+", seller: "Limpia+",
    category: "dia-a-dia", subcategory: "Aseo del hogar", price: 32990, stock: 45, prepayEligible: false, sku: "LP-DT3",
    popularity: 70, tags: ["detergente", "ropa", "lavado", "aseo", "hogar"],
    description: "Fórmula concentrada que rinde hasta 90 lavadas, remueve manchas difíciles en agua fría y deja suavidad sin suavizante.",
    features: [["Rendimiento", "Hasta 90 lavadas"], ["Agua fría", "Eficaz desde 15°C"], ["Aroma", "Limpio duradero"], ["Presentación", "3 litros"]],
    imageQuery: "liquid laundry detergent bottle product photo",
  },
  {
    slug: "papel-higienico-x16", name: "Papel higiénico doble hoja x16", brand: "Nube", seller: S,
    category: "dia-a-dia", subcategory: "Aseo del hogar", price: 34990, compareAt: 41990, stock: 50, prepayEligible: false, sku: "NB-PH16",
    popularity: 77, tags: ["papel", "higienico", "doble hoja", "pack", "aseo"],
    description: "Paquete económico de 16 rollos de 200 hojas doble capa, biodegradable y sin cloro elemental. La compra que nunca puede faltar.",
    features: [["Rollos", "16 x 200 hojas"], ["Capas", "Doble hoja suave"], ["Ambiental", "Biodegradable sin cloro"], ["Presentación", "Pack familiar"]],
    imageQuery: "toilet paper pack rolls product photo",
  },
  {
    slug: "canasta-mercado-termica", name: "Canasta térmica de mercado", brand: "Ordena+", seller: S,
    category: "dia-a-dia", subcategory: "Mercado", price: 49990, stock: 27, sku: "OR-CM01",
    isNew: true, popularity: 59, tags: ["canasta", "mercado", "termica", "reutilizable", "eco"],
    description: "Canasta plegable con aislamiento térmico que mantiene frío lo frío por horas, asa reforzada y tela lavable. Adiós a las bolsas plásticas.",
    features: [["Aislamiento", "Térmico PE + EPE"], ["Capacidad", "35 litros"], ["Plegado", "Ocupa 5cm"], ["Carga", "Hasta 12 kg"]],
    imageQuery: "thermal insulated shopping bag product photo",
  },
];
