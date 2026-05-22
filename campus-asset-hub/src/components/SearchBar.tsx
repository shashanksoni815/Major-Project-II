import { useState, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAMS } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: "Lab" | "Device" | "Staff";
  path: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const { labs, devices, staff } = useAMS();

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search labs
    labs.forEach((lab) => {
      if (
        lab.name.toLowerCase().includes(q) ||
        lab.subject?.toLowerCase().includes(q)
      ) {
        searchResults.push({
          id: lab.id,
          title: lab.name,
          subtitle: `Lab • ${lab.subject}`,
          category: "Lab",
          path: `/labs/${lab.id}`,
        });
      }
    });

    // Search devices
    devices.forEach((device) => {
      if (
        device.name.toLowerCase().includes(q) ||
        device.category?.toLowerCase().includes(q)
      ) {
        const lab = labs.find((l) => l.id === device.labId);
        searchResults.push({
          id: device.id,
          title: device.name,
          subtitle: `Device • ${lab?.name ?? "Unknown Lab"} • ${device.category}`,
          category: "Device",
          path: `/devices#${device.id}`,
        });
      }
    });

    // Search staff
    staff.forEach((member) => {
      if (
        member.name.toLowerCase().includes(q) ||
        member.email?.toLowerCase().includes(q) ||
        member.role?.toLowerCase().includes(q)
      ) {
        searchResults.push({
          id: member.id,
          title: member.name,
          subtitle: `Staff • ${member.role}`,
          category: "Staff",
          path: `/staff#${member.id}`,
        });
      }
    });

    setResults(searchResults.slice(0, 8));
  }, [query, labs, devices, staff]);

  const handleSelect = (path: string) => {
    navigate({ to: path });
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search Input (hidden on mobile, visible on md+) */}
      <div
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm cursor-pointer hover:border-gold/40 transition md:flex"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search labs, devices, staff…"
          className="w-56 bg-transparent outline-none placeholder:text-muted-foreground"
          readOnly
        />
        <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed left-1/2 top-1/4 z-50 w-full max-w-lg -translate-x-1/2"
            >
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                {/* Search Input */}
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search labs, devices, staff…"
                    autoFocus
                    className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded p-1 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                  {query.trim() ? (
                    results.length > 0 ? (
                      <div className="divide-y divide-border">
                        {results.map((result) => (
                          <motion.button
                            key={result.id}
                            onClick={() => handleSelect(result.path)}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="w-full px-4 py-3 text-left transition hover:bg-muted/50 flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">
                                {result.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {result.subtitle}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center px-4 py-12 text-sm text-muted-foreground">
                        <Search className="mb-2 h-8 w-8 opacity-30" />
                        <p>No results found</p>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col gap-2 px-4 py-6">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Quick actions
                        </p>
                        <button
                          onClick={() => handleSelect("/devices")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm transition hover:border-gold/40 hover:bg-muted/50"
                        >
                          View all devices
                        </button>
                        <button
                          onClick={() => handleSelect("/staff")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm transition hover:border-gold/40 hover:bg-muted/50"
                        >
                          View all staff
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Type to search across labs, devices, and staff
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
