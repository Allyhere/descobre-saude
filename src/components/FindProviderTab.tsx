import { useState, useMemo } from "react";
import { ExternalLink, MapPin, Search } from "lucide-react";
import { buildSearchUrl } from "@/lib/utils";
import { normalizeText } from "@/lib/utils";
import type { Product, TussCode } from "@/types";

interface FindProviderTabProps {
  products: Product[];
  tussCodes: TussCode[];
}

export function FindProviderTab({ products, tussCodes }: FindProviderTabProps) {
  const [selectedProductCode, setSelectedProductCode] = useState("");
  const [selectedPlanName, setSelectedPlanName] = useState("");
  const [tussQuery, setTussQuery] = useState("");
  const [selectedTussCode, setSelectedTussCode] = useState("");
  const [showTussSuggestions, setShowTussSuggestions] = useState(false);

  const uniqueProducts = useMemo(() => {
    const seen = new Map<string, { code: string; names: string[] }>();
    for (const p of products) {
      const existing = seen.get(p.productCode);
      if (existing) {
        if (!existing.names.includes(p.planName)) {
          existing.names.push(p.planName);
        }
      } else {
        seen.set(p.productCode, { code: p.productCode, names: [p.planName] });
      }
    }
    return Array.from(seen.values()).sort((a, b) =>
      Number(a.code) - Number(b.code)
    );
  }, [products]);

  const availablePlans = useMemo(() => {
    if (!selectedProductCode) return [];
    const found = uniqueProducts.find((p) => p.code === selectedProductCode);
    return found ? found.names.sort() : [];
  }, [uniqueProducts, selectedProductCode]);

  const selectedPlanData = useMemo(() => {
    if (!selectedProductCode || !selectedPlanName) return null;
    return products.find(
      (p) =>
        p.productCode === selectedProductCode && p.planName === selectedPlanName
    );
  }, [products, selectedProductCode, selectedPlanName]);

  const tussSuggestions = useMemo(() => {
    if (!tussQuery || tussQuery.length < 2) return [];
    const normalized = normalizeText(tussQuery);
    const isCode = /^\d+$/.test(tussQuery.trim());
    return tussCodes
      .filter((t) => {
        if (isCode) return t.code.startsWith(tussQuery.trim());
        const desc = normalizeText(t.description);
        return normalized
          .split(/\s+/)
          .every((term) => desc.includes(term) || t.code.includes(term));
      })
      .slice(0, 15);
  }, [tussCodes, tussQuery]);

  function handleOpenSearch() {
    if (!selectedPlanData) return;
    const url = buildSearchUrl(
      selectedPlanData.apiProductCode,
      selectedPlanData.apiPlanCode
    );
    window.open(url, "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <h3 className="font-semibold text-text mb-1 flex items-center gap-2">
          <MapPin size={18} className="text-primary" />
          Find Providers Near You
        </h3>
        <p className="text-sm text-text-muted mb-5">
          Select your product, plan, and optionally a TUSS procedure to search
          for providers on the SulAmerica referral network.
        </p>

        <div className="space-y-4">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Product Code
            </label>
            <select
              value={selectedProductCode}
              onChange={(e) => {
                setSelectedProductCode(e.target.value);
                setSelectedPlanName("");
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            >
              <option value="">Select a product...</option>
              {uniqueProducts.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code}
                </option>
              ))}
            </select>
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Plan
            </label>
            <select
              value={selectedPlanName}
              onChange={(e) => setSelectedPlanName(e.target.value)}
              disabled={!selectedProductCode}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {selectedProductCode
                  ? "Select a plan..."
                  : "Select a product first"}
              </option>
              {availablePlans.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* TUSS Code Search (optional) */}
          <div className="relative">
            <label className="block text-sm font-medium text-text mb-1.5">
              TUSS Procedure Code{" "}
              <span className="text-text-light font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by TUSS code or name..."
                value={tussQuery}
                onChange={(e) => {
                  setTussQuery(e.target.value);
                  setSelectedTussCode("");
                  setShowTussSuggestions(true);
                }}
                onFocus={() => setShowTussSuggestions(true)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
            </div>
            {selectedTussCode && (
              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-1 bg-primary-light text-primary text-xs rounded-md font-mono font-medium">
                Selected: {selectedTussCode}
              </div>
            )}
            {showTussSuggestions && tussSuggestions.length > 0 && !selectedTussCode && (
              <div className="absolute z-10 w-full mt-1 bg-surface rounded-lg border border-border shadow-lg max-h-60 overflow-y-auto">
                {tussSuggestions.map((tuss) => (
                  <button
                    key={tuss.code}
                    onClick={() => {
                      setSelectedTussCode(tuss.code);
                      setTussQuery(`${tuss.code} - ${tuss.description}`);
                      setShowTussSuggestions(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-primary-light/50 transition-colors text-sm flex items-start gap-2"
                  >
                    <span className="font-mono text-primary font-medium shrink-0">
                      {tuss.code}
                    </span>
                    <span className="text-text-muted">{tuss.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Plan Summary */}
          {selectedPlanData && (
            <div className="bg-surface-alt rounded-lg p-3 border border-border">
              <p className="text-xs text-text-muted mb-1">Selected plan details:</p>
              <p className="text-sm text-text">
                <span className="font-medium">{selectedPlanData.planName}</span>
                {" - "}
                {selectedPlanData.segment}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {selectedPlanData.operatorName} | ANS: {selectedPlanData.ansCode}
              </p>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleOpenSearch}
            disabled={!selectedPlanData}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink size={16} />
            Open SulAmerica Provider Search
          </button>

          <p className="text-xs text-text-light text-center">
            This will open the SulAmerica referral network search in a new tab.
            You can search by location, specialty, and procedure there.
          </p>
        </div>
      </div>
    </div>
  );
}
