import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, getCartToken, ensureCartToken, parseJsonField } from "@/lib/api";
import { allocateDiscount, computePricing, getPrepayPromo } from "@/lib/pricing";
import { quoteShipping } from "@/lib/shipping";
import { getSessionUser, newOrderNumber } from "@/lib/auth";
import { generatePaymentReference, isTestMode, providerLabel } from "@/lib/payments";

export const dynamic = "force-dynamic";

type CreateOrderBody = {
  paymentMethod?: "PREPAID" | "COD";
  customerName?: string;
  phone?: string;
  email?: string;
  departamento?: string;
  ciudad?: string;
  direccion?: string;
  complemento?: string;
  indicaciones?: string;
  idempotencyKey?: string;
  acceptTerms?: boolean;
  saveAddress?: boolean;
  // Campos de precio enviados por el cliente que SE IGNORAN deliberadamente:
  subtotal?: unknown;
  total?: unknown;
  discount?: unknown;
  shippingCost?: unknown;
};

// POST /api/orders — crea el pedido. TODOS los precios se calculan en servidor.
export async function POST(req: NextRequest) {
  const body = await readJson<CreateOrderBody>(req);
  if (!body) return fail("Cuerpo inválido.");

  const base = new NextResponse();
  const cartToken = ensureCartToken(req, base);
  const user = await getSessionUser(req);

  // Validaciones de formulario
  const errors: Record<string, string> = {};
  const customerName = (body.customerName ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const email = (body.email ?? user?.email ?? "").trim();
  const departamento = (body.departamento ?? "").trim();
  const ciudad = (body.ciudad ?? "").trim();
  const direccion = (body.direccion ?? "").trim();
  const complemento = (body.complemento ?? "").trim();
  const indicaciones = (body.indicaciones ?? "").trim();
  const paymentMethod = body.paymentMethod === "COD" ? "COD" : body.paymentMethod === "PREPAID" ? "PREPAID" : null;

  if (customerName.length < 5) errors.customerName = "Escribe tu nombre y apellido completos.";
  if (!/^[0-9+\s()-]{7,15}$/.test(phone)) errors.phone = "Escribe un teléfono de contacto válido (10 dígitos).";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Necesitamos un correo válido para enviarte el estado del pedido.";
  if (!departamento) errors.departamento = "Selecciona el departamento.";
  if (!ciudad) errors.ciudad = "Selecciona la ciudad o municipio.";
  if (direccion.length < 6) errors.direccion = "Escribe la dirección completa de entrega.";
  if (!paymentMethod) errors.paymentMethod = "Selecciona una modalidad de pago.";
  if (body.acceptTerms !== true) errors.acceptTerms = "Debes aceptar los términos y la política de datos.";
  if (Object.keys(errors).length) return fail({ message: "Revisa los datos de entrega.", errors }, 422);

  // Carrito desde el servidor
  const rows = await db.cartItem.findMany({
    where: { cartToken },
    include: { product: { include: { category: true, variants: true } }, variant: true },
    orderBy: { createdAt: "asc" },
  });
  if (!rows.length) return fail("Tu carrito está vacío.", 409);

  // Idempotencia: si ya existe un pedido con esta clave, devolverlo tal cual
  const idemKey = (body.idempotencyKey ?? "").trim();
  if (idemKey) {
    const existing = await db.order.findUnique({
      where: { idempotencyKey: idemKey },
      include: { items: true, payments: true },
    });
    if (existing) {
      const payment = existing.payments[0];
      const res = ok({
        order: existing,
        payment: payment
          ? { reference: payment.reference, amount: payment.amount, status: payment.status, testMode: isTestMode(), provider: providerLabel() }
          : null,
        duplicate: true,
      });
      base.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c));
      return res;
    }
  }

  // Verificación de inventario ANTES de crear el pedido
  for (const r of rows) {
    const available = r.variant ? r.variant.stock : r.product.stock;
    if (r.quantity > available) {
      const images = parseJsonField<string[]>(r.product.images, []);
      return fail(
        {
          message: `Inventario insuficiente para "${r.product.name}"${r.variant ? ` (${r.variant.kind}: ${r.variant.value})` : ""}. Disponible: ${available}.`,
          productId: r.productId,
        },
        409
      );
    }
  }

  // Cobertura logística
  const allCodAllowed = rows.every((r) => r.product.codAvailable);
  const quote = await quoteShipping(departamento, ciudad, allCodAllowed);
  if (!quote.covered) {
    return fail({ message: quote.reason ?? "Sin cobertura en el destino seleccionado." }, 409);
  }
  if (paymentMethod === "COD" && !quote.codAvailable) {
    return fail(
      {
        message:
          "El pago contraentrega no está disponible para este destino o para alguno de los productos de tu carrito. Puedes pagar anticipado con 10% de descuento.",
      },
      409
    );
  }

  // ── Motor de precios del servidor ──
  const promo = await getPrepayPromo();
  const pricingItems = rows.map((r) => ({
    productId: r.productId,
    unitPrice: r.product.price + (r.variant?.priceDelta ?? 0),
    quantity: r.quantity,
    prepayEligible: r.product.prepayEligible,
  }));
  const pricing = computePricing(pricingItems, promo, paymentMethod);
  const total = (paymentMethod === "PREPAID" ? pricing.prepayTotal : pricing.subtotal) + quote.price;
  const { lineDiscounts } = allocateDiscount(pricingItems, pricing.prepayDiscount);

  const number = newOrderNumber();

  const order = await db.$transaction(async (tx) => {
    // Reserva de inventario
    for (const r of rows) {
      if (r.variantId) {
        await tx.variant.update({
          where: { id: r.variantId },
          data: { stock: { decrement: r.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: r.productId },
          data: { stock: { decrement: r.quantity } },
        });
      }
    }

    const created = await tx.order.create({
      data: {
        number,
        idempotencyKey: idemKey || null,
        userId: user?.id ?? null,
        status: paymentMethod === "PREPAID" ? "PENDING_PAYMENT" : "PENDING",
        paymentMethod,
        paymentStatus: paymentMethod === "PREPAID" ? "PENDING" : "COD_PENDING",
        customerName,
        phone,
        email,
        departamento,
        ciudad,
        direccion,
        complemento: complemento || null,
        indicaciones: indicaciones || null,
        subtotal: pricing.subtotal,
        prepayDiscount: pricing.prepayDiscount,
        shippingCost: quote.price,
        total,
        etaMin: quote.etaMin,
        etaMax: quote.etaMax,
        history: {
          create: {
            to: paymentMethod === "PREPAID" ? "PENDING_PAYMENT" : "PENDING",
            note:
              paymentMethod === "PREPAID"
                ? "Pedido creado, esperando pago."
                : "Pedido contraentrega recibido, pendiente de confirmación.",
          },
        },
        items: {
          create: rows.map((r, idx) => {
            const images = parseJsonField<string[]>(r.product.images, []);
            const unitPrice = r.product.price + (r.variant?.priceDelta ?? 0);
            return {
              productId: r.productId,
              variantId: r.variantId,
              name: r.product.name,
              brand: r.product.brand,
              variantLabel: r.variant ? `${r.variant.kind}: ${r.variant.value}` : "",
              image: images[0] ?? "/images/placeholder-product.png",
              unitPrice,
              quantity: r.quantity,
              prepayEligible: r.product.prepayEligible,
              lineSubtotal: unitPrice * r.quantity,
              lineDiscount: lineDiscounts[idx] ?? 0,
            };
          }),
        },
      },
      include: { items: true },
    });

    if (paymentMethod === "PREPAID") {
      await tx.payment.create({
        data: {
          orderId: created.id,
          provider: isTestMode() ? "test" : "wompi",
          status: "PENDING",
          amount: total,
          reference: generatePaymentReference(number),
        },
      });
    }

    // Vaciar carrito
    await tx.cartItem.deleteMany({ where: { cartToken } });

    // Guardar dirección del usuario si lo pidió
    if (user && body.saveAddress) {
      const count = await tx.address.count({ where: { userId: user.id } });
      await tx.address.create({
        data: {
          userId: user.id,
          label: count === 0 ? "Casa" : `Dirección ${count + 1}`,
          name: customerName,
          phone,
          email,
          departamento,
          ciudad,
          direccion,
          complemento: complemento || null,
          indicaciones: indicaciones || null,
          isDefault: count === 0,
        },
      });
    }

    return created;
  });

  const payment = await db.payment.findFirst({ where: { orderId: order.id } });
  const res = ok({
    order: {
      ...order,
      items: order.items,
    },
    payment: payment
      ? {
          reference: payment.reference,
          amount: payment.amount,
          status: payment.status,
          testMode: isTestMode(),
          provider: providerLabel(),
        }
      : null,
  });
  base.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c));
  return res;
}
