import type { Prisma, Category } from "@prisma/client";
import { parseJsonField } from "@/lib/api";
import type { CategoryDTO, ProductDTO } from "@/lib/types";

type ProductWithRelations = Prisma.ProductGetPayload<{ include: { category: true; variants: true } }>;
type CategoryRow = Category;

export function productToDTO(p: ProductWithRelations): ProductDTO {
  const images = parseJsonField<string[]>(p.images, []);
  const safeImages = images.length ? images : ["/images/placeholder-product.png"];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    seller: p.seller,
    description: p.description,
    features: parseJsonField<[string, string][]>(p.features, []),
    categoryId: p.categoryId,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    categoryColor: p.category.color,
    subcategory: p.subcategory,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    stock: p.stock,
    sku: p.sku,
    prepayEligible: p.prepayEligible,
    codAvailable: p.codAvailable,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    popularity: p.popularity,
    tags: parseJsonField<string[]>(p.tags, []),
    images: safeImages,
    videoUrl: p.videoUrl,
    hasVariants: p.variants.length > 0,
    variants: p.variants
      .map((v) => ({ id: v.id, kind: v.kind, value: v.value, priceDelta: v.priceDelta, stock: v.stock }))
      .sort((a, b) => a.value.localeCompare(b.value, "es", { numeric: true })),
    createdAt: p.createdAt.toISOString(),
  };
}

export function categoryToDTO(
  c: CategoryRow,
  productCount: number,
  subcategories: string[]
): CategoryDTO {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    icon: c.icon,
    color: c.color,
    special: c.special,
    sortOrder: c.sortOrder,
    active: c.active,
    productCount,
    subcategories,
  };
}
