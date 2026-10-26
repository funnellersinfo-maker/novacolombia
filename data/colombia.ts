// Zonas logísticas de Colombia (semilla) — precios COP, ETA en días.
// Regla de cobertura: primero match exacto (departamento + ciudad);
// si no existe, se busca zona "resto" del departamento (ciudad: "*");
// si tampoco existe, no hay cobertura.

export type SeedZone = {
  departamento: string;
  ciudad: string; // "*" = resto del departamento
  price: number;
  etaMin: number;
  etaMax: number;
  codAvailable: boolean;
};

export type SeedCarrier = {
  code: string;
  name: string;
  supportsCod: boolean;
  integration: "manual" | "api-pending";
  notes: string;
};

export const seedCarriers: SeedCarrier[] = [
  { code: "COOR", name: "Coordinadora", supportsCod: true, integration: "manual", notes: "Gestión manual de guías. Integración API pendiente de contrato." },
  { code: "TCC", name: "TCC", supportsCod: true, integration: "manual", notes: "Gestión manual de guías. Integración API pendiente de contrato." },
  { code: "INTERRA", name: "Interrapidísimo", supportsCod: true, integration: "manual", notes: "Gestión manual de guías. Integración API pendiente de contrato." },
  { code: "ENVIA", name: "Envía", supportsCod: true, integration: "manual", notes: "Gestión manual de guías. Integración API pendiente de contrato." },
  { code: "SERVI", name: "Servientrega", supportsCod: true, integration: "manual", notes: "Gestión manual de guías. Integración API pendiente de contrato." },
];

const Z = (d: string, c: string, p: number, min: number, max: number, cod: boolean): SeedZone =>
  ({ departamento: d, ciudad: c, price: p, etaMin: min, etaMax: max, codAvailable: cod });

const resto = (d: string, p: number, min: number, max: number): SeedZone =>
  Z(d, "*", p, min, max, false);

export const seedZones: SeedZone[] = [
  // ─── Región Andina ───
  Z("Bogotá D.C.", "Bogotá", 7500, 1, 3, true),
  Z("Cundinamarca", "Soacha", 9500, 1, 3, true),
  Z("Cundinamarca", "Chía", 9500, 1, 3, true),
  Z("Cundinamarca", "Zipaquirá", 10500, 2, 4, true),
  Z("Cundinamarca", "Fusagasugá", 11500, 2, 4, true),
  resto("Cundinamarca", 13000, 3, 6),
  Z("Antioquia", "Medellín", 8500, 1, 3, true),
  Z("Antioquia", "Envigado", 9500, 1, 3, true),
  Z("Antioquia", "Bello", 9500, 1, 3, true),
  Z("Antioquia", "Sabaneta", 9500, 1, 3, true),
  Z("Antioquia", "Rionegro", 11500, 2, 4, true),
  resto("Antioquia", 14000, 3, 6),
  Z("Boyacá", "Tunja", 9500, 2, 4, true),
  Z("Boyacá", "Duitama", 10500, 2, 4, true),
  Z("Boyacá", "Sogamoso", 10500, 2, 4, true),
  resto("Boyacá", 13000, 3, 6),
  Z("Santander", "Bucaramanga", 10000, 2, 4, true),
  Z("Santander", "Floridablanca", 10500, 2, 4, true),
  Z("Santander", "Girón", 10500, 2, 4, true),
  Z("Santander", "Barrancabermeja", 13000, 3, 5, true),
  resto("Santander", 14000, 3, 6),
  Z("Norte de Santander", "Cúcuta", 11000, 2, 5, true),
  Z("Norte de Santander", "Ocaña", 13500, 3, 6, false),
  resto("Norte de Santander", 15000, 4, 7),
  Z("Caldas", "Manizales", 9500, 2, 4, true),
  resto("Caldas", 12500, 3, 6),
  Z("Risaralda", "Pereira", 9500, 2, 4, true),
  Z("Risaralda", "Dosquebradas", 10000, 2, 4, true),
  resto("Risaralda", 12500, 3, 6),
  Z("Quindío", "Armenia", 10000, 2, 4, true),
  resto("Quindío", 12500, 3, 6),
  Z("Tolima", "Ibagué", 10000, 2, 4, true),
  resto("Tolima", 13000, 3, 6),
  Z("Huila", "Neiva", 10500, 2, 5, true),
  Z("Huila", "Pitalito", 13500, 3, 6, false),
  resto("Huila", 14000, 4, 7),
  // ─── Región Caribe ───
  Z("Atlántico", "Barranquilla", 11000, 2, 4, true),
  Z("Atlántico", "Soledad", 11500, 2, 4, true),
  Z("Atlántico", "Malambo", 11500, 2, 4, true),
  resto("Atlántico", 14000, 3, 7),
  Z("Bolívar", "Cartagena", 11500, 2, 5, true),
  Z("Bolívar", "Magangué", 14000, 3, 6, false),
  resto("Bolívar", 15000, 4, 8),
  Z("Magdalena", "Santa Marta", 11500, 2, 5, true),
  resto("Magdalena", 14000, 4, 8),
  Z("Cesar", "Valledupar", 12000, 3, 5, true),
  resto("Cesar", 15000, 4, 8),
  Z("Córdoba", "Montería", 12000, 3, 5, true),
  resto("Córdoba", 15000, 4, 8),
  Z("Sucre", "Sincelejo", 12500, 3, 6, true),
  resto("Sucre", 15000, 4, 8),
  Z("La Guajira", "Riohacha", 14000, 3, 6, false),
  Z("La Guajira", "Maicao", 15000, 4, 7, false),
  resto("La Guajira", 17000, 5, 10),
  // ─── Región Pacífica ───
  Z("Valle del Cauca", "Cali", 10000, 2, 4, true),
  Z("Valle del Cauca", "Palmira", 11000, 2, 4, true),
  Z("Valle del Cauca", "Buga", 11500, 2, 5, true),
  Z("Valle del Cauca", "Tuluá", 11500, 2, 5, true),
  Z("Valle del Cauca", "Buenaventura", 15000, 4, 8, false),
  resto("Valle del Cauca", 13500, 3, 7),
  Z("Cauca", "Popayán", 12500, 3, 5, true),
  resto("Cauca", 15000, 4, 8),
  Z("Nariño", "Pasto", 13000, 3, 6, true),
  Z("Nariño", "Tumaco", 16000, 4, 9, false),
  resto("Nariño", 15500, 5, 9),
  Z("Chocó", "Quibdó", 15000, 4, 8, false),
  resto("Chocó", 18000, 5, 12),
  // ─── Región Orinoquía ───
  Z("Meta", "Villavicencio", 10500, 2, 5, true),
  resto("Meta", 14000, 4, 8),
  Z("Casanare", "Yopal", 12500, 3, 6, false),
  resto("Casanare", 15500, 4, 9),
  Z("Arauca", "Arauca", 15000, 4, 8, false),
  resto("Arauca", 18000, 5, 12),
  Z("Vichada", "Puerto Carreño", 18000, 5, 10, false),
  resto("Vichada", 20000, 6, 15),
  // ─── Región Amazonía ───
  Z("Caquetá", "Florencia", 15500, 4, 8, false),
  resto("Caquetá", 18000, 5, 12),
  Z("Putumayo", "Mocoa", 16000, 4, 9, false),
  Z("Putumayo", "Puerto Asís", 17000, 5, 10, false),
  resto("Putumayo", 19000, 6, 14),
  Z("Guaviare", "San José del Guaviare", 18000, 5, 10, false),
  resto("Guaviare", 20000, 6, 15),
  Z("Guainía", "Inírida", 20000, 6, 12, false),
  resto("Guainía", 22000, 7, 18),
  Z("Vaupés", "Mitú", 22000, 6, 14, false),
  resto("Vaupés", 24000, 8, 20),
  Z("Amazonas", "Leticia", 22000, 6, 12, false),
  resto("Amazonas", 24000, 8, 20),
  // ─── Insular ───
  Z("San Andrés y Providencia", "San Andrés", 25000, 5, 8, false),
  resto("San Andrés y Providencia", 28000, 6, 12),
];

// Departamentos y ciudades para los selectores del frontend (derivado de zonas)
export function locationsFromZones(zones: SeedZone[]) {
  const map = new Map<string, Set<string>>();
  for (const z of zones) {
    if (!map.has(z.departamento)) map.set(z.departamento, new Set());
    if (z.ciudad !== "*") map.get(z.departamento)!.add(z.ciudad);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "es"))
    .map(([departamento, ciudades]) => ({
      departamento,
      ciudades: Array.from(ciudades).sort((a, b) => a.localeCompare(b, "es")),
    }));
}
