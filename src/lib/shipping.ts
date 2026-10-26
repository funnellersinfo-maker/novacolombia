import { db } from "@/lib/db";

// ── Logística: cotización y cobertura ──

export type ShippingQuote = {
  covered: boolean;
  price: number;
  etaMin: number;
  etaMax: number;
  codAvailable: boolean; // zona + productos
  zoneCity: string;
  reason?: string;
};

export async function quoteShipping(
  departamento: string,
  ciudad: string,
  allItemsCodAllowed: boolean
): Promise<ShippingQuote> {
  const dept = (departamento || "").trim();
  const city = (ciudad || "").trim();
  if (!dept || !city) {
    return { covered: false, price: 0, etaMin: 0, etaMax: 0, codAvailable: false, zoneCity: "", reason: "Selecciona departamento y ciudad." };
  }

  const exact = await db.shippingZone.findFirst({
    where: { departamento: dept, ciudad: city, active: true },
  });
  const zone = exact ?? (await db.shippingZone.findFirst({
    where: { departamento: dept, ciudad: "*", active: true },
  }));

  if (!zone) {
    return {
      covered: false,
      price: 0,
      etaMin: 0,
      etaMax: 0,
      codAvailable: false,
      zoneCity: "",
      reason: `Aún no tenemos cobertura de entrega verificable en ${city}, ${dept}. Estamos ampliando destinos constantemente.`,
    };
  }

  return {
    covered: true,
    price: zone.price,
    etaMin: zone.etaMin,
    etaMax: zone.etaMax,
    codAvailable: zone.codAvailable && allItemsCodAllowed,
    zoneCity: zone.ciudad === "*" ? "" : zone.ciudad,
  };
}

export async function getLocations() {
  const zones = await db.shippingZone.findMany({ where: { active: true } });
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
