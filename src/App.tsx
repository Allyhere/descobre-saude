import { useState } from "react";
import { Search, ClipboardList, MapPin, Activity } from "lucide-react";
import { TussSearchTab } from "@/components/TussSearchTab";
import { MyPlanTab } from "@/components/MyPlanTab";
import { FindProviderTab } from "@/components/FindProviderTab";
import { products, tussCodes } from "@/lib/data";
import type { TabId } from "@/types";
import "./App.css";

const TABS: { id: TabId; label: string; icon: typeof Search }[] = [
  { id: "search", label: "Search Procedures", icon: Search },
  { id: "my-plan", label: "Browse Plans", icon: ClipboardList },
  { id: "find-provider", label: "Find Provider", icon: MapPin },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("search");

  return (
    <div className="min-h-screen bg-surface-alt">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-text leading-tight">
                  Descobre Saude
                </h1>
                <p className="text-xs text-text-muted leading-tight hidden sm:block">
                  SulAmerica Coverage Explorer
                </p>
              </div>
            </div>
            <div className="text-xs text-text-light hidden md:block">
              {products.length} plans &middot; {tussCodes.length} TUSS codes
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-text-muted hover:text-text hover:border-border"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "search" && (
          <TussSearchTab tussCodes={tussCodes} products={products} />
        )}
        {activeTab === "my-plan" && <MyPlanTab products={products} />}
        {activeTab === "find-provider" && (
          <FindProviderTab products={products} tussCodes={tussCodes} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-xs text-text-light text-center">
            Data sourced from SulAmerica public portal. Provider search opens
            the official SulAmerica referral network.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
