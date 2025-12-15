
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Airports() {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch("/api/airports");
        if (!res.ok) throw new Error(`Failed to load airports (${res.status})`);

        const data = await res.json();
        if (!cancelled) setAirports(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setErrorMsg(e?.message || "Failed to load airports");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = airports.filter((a) => {
      if (!q) return true;
      const name = (a?.name || "").toLowerCase();
      const code = (a?.code || "").toLowerCase();
      const city = (a?.city || "").toLowerCase();
      const country = (a?.country || "").toLowerCase();
      return (
        name.includes(q) || code.includes(q) || city.includes(q) || country.includes(q)
      );
    });

    const getKey = (a) => {
      if (sortBy === "code") return (a?.code || "").toLowerCase();
      if (sortBy === "city") return (a?.city || "").toLowerCase();
      if (sortBy === "country") return (a?.country || "").toLowerCase();
      return (a?.name || "").toLowerCase();
    };

    list.sort((a, b) => getKey(a).localeCompare(getKey(b)));
    return list;
  }, [airports, search, sortBy]);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Airports</h1>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, code, city, country..."
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #c9c9c9",
              minWidth: 280,
            }}
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #c9c9c9" }}
          >
            <option value="name">Sort: Name</option>
            <option value="code">Sort: Code</option>
            <option value="city">Sort: City</option>
            <option value="country">Sort: Country</option>
          </select>
        </div>
      </div>

      {loading && <p style={{ marginTop: 14 }}>Loading airports...</p>}
      {!loading && errorMsg && (
        <p style={{ marginTop: 14, color: "crimson" }}>{errorMsg}</p>
      )}

      {!loading && !errorMsg && filtered.length === 0 && (
        <p style={{ marginTop: 14 }}>No airports found.</p>
      )}

      {!loading && !errorMsg && filtered.length > 0 && (
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {filtered.map((a) => (
            <Link
              key={a.id}
              to={`/airports/${a.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                border: "1px solid #e0e0e0",
                borderRadius: 14,
                padding: 14,
                display: "block",
                background: "white",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{a?.name || "Unnamed"}</div>
                <div
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontWeight: 700,
                    opacity: 0.9,
                  }}
                >
                  {a?.code || ""}
                </div>
              </div>

              <div style={{ marginTop: 6, opacity: 0.9 }}>
                {(a?.city || "Unknown city") + ", " + (a?.country || "Unknown country")}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Airports;