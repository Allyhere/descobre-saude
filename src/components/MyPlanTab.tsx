import { useState, useMemo } from "react";
import {
  Search,
  ExternalLink,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
  Shield,
  Tag,
  Hash,
} from "lucide-react";
import {
  getDistinctPlanNames,
  getDistinctProductCodes,
  getDistinctSegments,
  getDistinctClassifications,
  filterProducts,
} from "@/lib/search";
import { buildSearchUrl, buildPortalUrl } from "@/lib/utils";
import type { Product } from "@/types";

interface MyPlanTabProps {
  products: Product[];
}

export function MyPlanTab({ products }: MyPlanTabProps) {
  const [selectedProductCode, setSelectedProductCode] = useState("");
  const [selectedPlanName, setSelectedPlanName] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedClassification, setSelectedClassification] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const productCodes = useMemo(
    () => getDistinctProductCodes(products),
    [products]
  );
  const planNames = useMemo(
    () => getDistinctPlanNames(products),
    [products]
  );
  const segments = useMemo(
    () => getDistinctSegments(products),
    [products]
  );
  const classifications = useMemo(
    () => getDistinctClassifications(products),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return filterProducts(products, {
      productCode: selectedProductCode || undefined,
      planName: selectedPlanName || undefined,
      segment: selectedSegment || undefined,
      classification: selectedClassification || undefined,
      search: searchQuery || undefined,
    });
  }, [
    products,
    selectedProductCode,
    selectedPlanName,
    selectedSegment,
    selectedClassification,
    searchQuery,
  ]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  function clearFilters() {
    setSelectedProductCode("");
    setSelectedPlanName("");
    setSelectedSegment("");
    setSelectedClassification("");
    setSearchQuery("");
    setCurrentPage(1);
  }

  const hasActiveFilters =
    selectedProductCode ||
    selectedPlanName ||
    selectedSegment ||
    selectedClassification ||
    searchQuery;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          size={20}
        />
        <input
          type="text"
          placeholder="Search products, plans, or ANS names..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
        >
          <Filter size={16} />
          Filters
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-surface rounded-xl border border-border shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Product Code
              </label>
              <select
                value={selectedProductCode}
                onChange={(e) => {
                  setSelectedProductCode(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">All</option>
                {productCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Plan Name
              </label>
              <select
                value={selectedPlanName}
                onChange={(e) => {
                  setSelectedPlanName(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">All</option>
                {planNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Segment
              </label>
              <select
                value={selectedSegment}
                onChange={(e) => {
                  setSelectedSegment(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">All</option>
                {segments.map((seg) => (
                  <option key={seg} value={seg}>
                    {seg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Classification
              </label>
              <select
                value={selectedClassification}
                onChange={(e) => {
                  setSelectedClassification(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">All</option>
                {classifications.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-text-muted">
        Showing{" "}
        <span className="font-semibold text-text">
          {filteredProducts.length}
        </span>{" "}
        plan{filteredProducts.length !== 1 ? "s" : ""}
      </div>

      {/* Results Table */}
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-text-muted text-xs uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-muted text-xs uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-muted text-xs uppercase tracking-wider hidden md:table-cell">
                  ANS Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-muted text-xs uppercase tracking-wider hidden lg:table-cell">
                  Segment
                </th>
                <th className="px-4 py-3 text-left font-semibold text-text-muted text-xs uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-text-muted text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedProducts.map((product, index) => (
                <tr
                  key={`${product.apiProductCode}-${product.apiPlanCode}-${index}`}
                  className="hover:bg-surface-alt/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-primary shrink-0" />
                      <span className="font-mono font-medium text-text">
                        {product.productCode}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-secondary shrink-0" />
                      <span className="text-text font-medium">
                        {product.planName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-text-muted text-xs">
                      {product.ansRegisteredName}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary text-xs rounded-md font-medium">
                      {product.segment}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md font-medium ${
                        product.status === "Ativo"
                          ? "bg-secondary-light text-secondary"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={buildSearchUrl(
                          product.apiProductCode,
                          product.apiPlanCode
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary hover:text-primary-dark hover:bg-primary-light rounded-lg transition-colors"
                        title="Search providers"
                      >
                        <ExternalLink size={12} />
                        Providers
                      </a>
                      <a
                        href={buildPortalUrl(
                          product.productCode,
                          product.planName
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:bg-surface-alt rounded-lg transition-colors"
                        title="View on SulAmerica portal"
                      >
                        <Building2 size={12} />
                        Portal
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-surface-alt border-t border-border">
            <span className="text-xs text-text-muted">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? "bg-primary text-white"
                        : "text-text-muted hover:text-text hover:bg-surface"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ANS Code Quick Search */}
      {filteredProducts.length > 0 && (
        <div className="bg-surface rounded-xl border border-border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-text mb-2 flex items-center gap-2">
            <Hash size={16} className="text-primary" />
            ANS Codes in Current Results
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              new Set(filteredProducts.map((p) => p.ansCode))
            )
              .sort()
              .slice(0, 20)
              .map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center px-2 py-1 bg-surface-alt text-text-muted text-xs font-mono rounded-md border border-border"
                >
                  {code}
                </span>
              ))}
            {new Set(filteredProducts.map((p) => p.ansCode)).size > 20 && (
              <span className="text-xs text-text-light self-center">
                +{new Set(filteredProducts.map((p) => p.ansCode)).size - 20} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
