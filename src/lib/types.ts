// Tipos compartidos entre API y frontend

export type VariantDTO = {
  id: string;
  kind: string;
  value: string;
  priceDelta: number;
  stock: number;
};

export type ProductDTO = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  seller: string;
  description: string;
  features: [string, string][];
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  categoryColor: string;
  subcategory: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string;
  prepayEligible: boolean;
  codAvailable: boolean;
  isFeatured: boolean;
  isNew: boolean;
  popularity: number;
  tags: string[];
  images: string[];
  videoUrl: string | null;
  hasVariants: boolean;
  variants: VariantDTO[];
  createdAt: string;
};

export type CategoryDTO = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  special: string | null;
  sortOrder: number;
  active: boolean;
  productCount: number;
  subcategories: string[];
};

export type CartLineDTO = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  variantId: string | null;
  variantKind: string;
  variantValue: string;
  unitPrice: number;
  quantity: number;
  stock: number;
  prepayEligible: boolean;
  codAvailable: boolean;
  lineSubtotal: number;
};

export type CartSummaryDTO = {
  items: CartLineDTO[];
  itemCount: number;
  subtotal: number;
  eligibleSubtotal: number;
  prepayDiscount: number;
  prepayTotal: number;
  codTotal: number;
  promo: { active: boolean; percent: number; inEffect: boolean };
};

export type QuoteDTO = {
  covered: boolean;
  price: number;
  etaMin: number;
  etaMax: number;
  codAvailable: boolean;
  reason?: string;
};

export type OrderItemDTO = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  variantLabel: string;
  image: string;
  unitPrice: number;
  quantity: number;
  prepayEligible: boolean;
  lineSubtotal: number;
  lineDiscount: number;
};

export type OrderDTO = {
  id: string;
  number: string;
  status: string;
  paymentMethod: "PREPAID" | "COD";
  paymentStatus: string;
  customerName: string;
  phone: string;
  email: string | null;
  departamento: string;
  ciudad: string;
  direccion: string;
  complemento: string | null;
  indicaciones: string | null;
  subtotal: number;
  prepayDiscount: number;
  shippingCost: number;
  total: number;
  etaMin: number | null;
  etaMax: number | null;
  createdAt: string;
  items: OrderItemDTO[];
  history: { id: string; from: string; to: string; note: string; createdAt: string }[];
  shipment: {
    carrierName: string;
    trackingNumber: string;
    status: string;
    incidents: { at: string; note: string }[];
  } | null;
};

export type BannerDTO = {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  active: boolean;
  order: number;
};

export type CollectionDTO = {
  slug: string;
  name: string;
  description: string;
  color: string;
  productSlugs: string[];
};

export type StoreBootstrapDTO = {
  brand: {
    name: string;
    shortName: string;
    tagline: string;
    domain: string;
    supportEmail: string;
    supportPhone: string;
    guestCheckoutAllowed: boolean;
  };
  promo: { active: boolean; percent: number; inEffect: boolean; maxDiscount: number | null };
  banners: BannerDTO[];
  collections: CollectionDTO[];
  categories: CategoryDTO[];
  locations: { departamento: string; ciudades: string[] }[];
  legalSlugs: { slug: string; title: string }[];
  payments: { testMode: boolean; providerLabel: string };
  campaign: { active: boolean; name: string; endsAt: string | null } | null;
  homeTexts: { trustTitle: string; prepayBannerTitle: string; prepayBannerText: string };
};

export type SessionUserDTO = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
};
