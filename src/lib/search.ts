import type { TussCode, Product } from "@/types";
import { normalizeText } from "./utils";

export function searchTussCodes(
  tussData: TussCode[],
  query: string,
  limit = 50
): TussCode[] {
  if (!query.trim()) return [];

  const normalized = normalizeText(query);
  const isCodeSearch = /^\d+$/.test(query.trim());

  const results = tussData.filter((item) => {
    if (isCodeSearch) {
      return item.code.startsWith(query.trim());
    }
    const desc = normalizeText(item.description);
    const terms = normalized.split(/\s+/);
    return terms.every(
      (term) => desc.includes(term) || item.code.includes(term)
    );
  });

  return results.slice(0, limit);
}

export function getDistinctPlanNames(products: Product[]): string[] {
  const names = new Set<string>();
  for (const p of products) {
    names.add(p.planName);
  }
  return Array.from(names).sort();
}

export function getDistinctProductCodes(products: Product[]): string[] {
  const codes = new Set<string>();
  for (const p of products) {
    codes.add(p.productCode);
  }
  return Array.from(codes).sort((a, b) => Number(a) - Number(b));
}

export function getDistinctSegments(products: Product[]): string[] {
  const segments = new Set<string>();
  for (const p of products) {
    segments.add(p.segment);
  }
  return Array.from(segments).sort();
}

export function getDistinctClassifications(products: Product[]): string[] {
  const classifications = new Set<string>();
  for (const p of products) {
    classifications.add(p.classification);
  }
  return Array.from(classifications).sort();
}

export function getDistinctStatuses(products: Product[]): string[] {
  const statuses = new Set<string>();
  for (const p of products) {
    statuses.add(p.status);
  }
  return Array.from(statuses).sort();
}

export function filterProducts(
  products: Product[],
  filters: {
    productCode?: string;
    planName?: string;
    segment?: string;
    classification?: string;
    status?: string;
    search?: string;
  }
): Product[] {
  return products.filter((p) => {
    if (filters.productCode && p.productCode !== filters.productCode)
      return false;
    if (filters.planName && p.planName !== filters.planName) return false;
    if (filters.segment && p.segment !== filters.segment) return false;
    if (filters.classification && p.classification !== filters.classification)
      return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.search) {
      const q = normalizeText(filters.search);
      const searchable = normalizeText(
        `${p.productCode} ${p.planName} ${p.ansRegisteredName} ${p.ansCode}`
      );
      return q.split(/\s+/).every((term) => searchable.includes(term));
    }
    return true;
  });
}
