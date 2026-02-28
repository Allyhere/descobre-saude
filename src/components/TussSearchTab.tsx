import { useState, useMemo } from "react";
import { Search, ExternalLink, Hash, FileText } from "lucide-react";
import { searchTussCodes } from "@/lib/search";
import { buildSearchUrl } from "@/lib/utils";
import type { TussCode, Product } from "@/types";

interface TussSearchTabProps {
  tussCodes: TussCode[];
  products: Product[];
}

export function TussSearchTab({ tussCodes, products }: TussSearchTabProps) {
  const [query, setQuery] = useState("");
  const [selectedTuss, setSelectedTuss] = useState<TussCode | null>(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");

  const searchResults = useMemo(
    () => searchTussCodes(tussCodes, query),
    [tussCodes, query]
  );

  const uniqueProducts = useMemo(() => {
    const seen = new Map<string, { code: string; name: string; apiCode: string }>();
    for (const p of products) {
      if (!seen.has(p.productCode)) {
        seen.set(p.productCode, {
          code: p.productCode,
          name: p.planName,
          apiCode: p.apiProductCode,
        });
      }
    }
    return Array.from(seen.values()).sort((a, b) =>
      Number(a.code) - Number(b.code)
    );
  }, [products]);

  const availablePlans = useMemo(() => {
    if (!selectedProduct) return [];
    const plans = new Map<string, { name: string; apiPlanCode: string; apiProductCode: string }>();
    for (const p of products) {
      if (p.productCode === selectedProduct && !plans.has(p.planName)) {
        plans.set(p.planName, {
          name: p.planName,
          apiPlanCode: p.apiPlanCode,
          apiProductCode: p.apiProductCode,
        });
      }
    }
    return Array.from(plans.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products, selectedProduct]);

  const selectedPlanData = useMemo(() => {
    if (!selectedProduct || !selectedPlan) return null;
    return products.find(
      (p) => p.productCode === selectedProduct && p.planName === selectedPlan
    );
  }, [products, selectedProduct, selectedPlan]);

  function handleOpenProviderSearch() {
    if (!selectedPlanData) return;
    const url = buildSearchUrl(
      selectedPlanData.apiProductCode,
      selectedPlanData.apiPlanCode
    );
    window.open(url, "_blank");
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by TUSS code or procedure name..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedTuss(null);
          }}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base"
        />
      </div>

      {/* Search Results */}
      {query && !selectedTuss && (
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-surface-alt border-b border-border">
            <span className="text-sm text-text-muted font-medium">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
            </span>
          </div>
          {searchResults.length === 0 ? (
            <div className="px-4 py-8 text-center text-text-muted">
              No procedures found matching "{query}"
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-border">
              {searchResults.map((tuss) => (
                <button
                  key={tuss.code}
                  onClick={() => setSelectedTuss(tuss)}
                  className="w-full px-4 py-3 text-left hover:bg-primary-light/50 transition-colors flex items-start gap-3"
                >
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <Hash size={14} className="text-primary" />
                    <span className="font-mono text-sm font-semibold text-primary">
                      {tuss.code}
                    </span>
                  </div>
                  <span className="text-sm text-text">{tuss.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected TUSS Detail */}
      {selectedTuss && (
        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={18} className="text-primary" />
                  <h3 className="font-semibold text-text">Selected Procedure</h3>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-light text-primary rounded-lg font-mono text-sm font-semibold">
                    <Hash size={12} />
                    {selectedTuss.code}
                  </span>
                </div>
                <p className="mt-2 text-text-muted">{selectedTuss.description}</p>
              </div>
              <button
                onClick={() => setSelectedTuss(null)}
                className="text-sm text-text-light hover:text-text transition-colors shrink-0"
              >
                Change
              </button>
            </div>
          </div>

          {/* Plan Selection for Provider Search */}
          <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold text-text mb-4">
              Find providers for this procedure
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Select your product and plan to search for providers that cover this procedure.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Product Code
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    setSelectedPlan("");
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                >
                  <option value="">Select a product...</option>
                  {uniqueProducts.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Plan
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  disabled={!selectedProduct}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedProduct
                      ? "Select a plan..."
                      : "Select a product first"}
                  </option>
                  {availablePlans.map((plan) => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleOpenProviderSearch}
              disabled={!selectedPlanData}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink size={16} />
              Search Providers on SulAmerica
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
