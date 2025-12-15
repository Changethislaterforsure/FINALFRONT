
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Flights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch("/api/flights");
        if (!res.ok) throw new Error(`Failed to load flights (${res.status})`);
        const data = await res.json();
        if (!cancelled) setFlights(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setErrorMsg(e?.message || "Failed to load flights");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const uniqueStatuses = useMemo(() => {
    const set = new Set();
    flights.forEach((f) => {
      if (f?.status != null && String(f.status).trim() !== "") set.add(String(f.status));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [flights]);

  const uniqueTypes = useMemo(() => {
    const set = new Set();
    flights.forEach((f) => {
      if (f?.type != null && String(f.type).trim() !== "") set.add(String(f.type));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [flights]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return flights.filter((f) => {
      if (status && String(f?.status || "").toLowerCase() !== status.toLowerCase()) return false;
      if (type && String(f?.type || "").toLowerCase() !== type.toLowerCase()) return false;

      if (!query) return true;
      const fn = String(f?.flightNumber || "").toLowerCase();
      const st = String(f?.status || "").toLowerCase();
      const ty = String(f?.type || "").toLowerCase();
      const airportId = String(f?.airportId ?? "").toLowerCase();
      const airlineId = String(f?.airlineId ?? "").toLowerCase();
      const aircraftId = String(f?.aircraftId ?? "").toLowerCase();

      return (
        fn.includes(query) ||
        st.includes(query) ||
        ty.includes(query) ||
        airportId.includes(query) ||
        airlineId.includes(query) ||
        aircraftId.includes(query)
      );
    });
  }, [flights, status, type, q]);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          ← Airports
        </Link>
        <h1 style={{ margin: 0 }}>Flights</h1>

        <div style={{ marginLeft: "auto", opacity: 0.85 }}>
          Showing {filtered.length} of {flights.length}
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1fr 180px 180px",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search flight number, status, type, ids..."
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #c9c9c9",
            width: "100%",
          }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #c9c9c9" }}
        >
          <option value="">All statuses</option>
          {uniqueStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #c9c9c9" }}
        >
          <option value="">All types</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {loading && <p style={{ marginTop: 14 }}>Loading flights...</p>}
      {!loading && errorMsg && <p style={{ marginTop: 14, color: "crimson" }}>{errorMsg}</p>}

      {!loading && !errorMsg && (
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {filtered.length === 0 ? (
            <p>No flights match your filters.</p>
          ) : (
            filtered.map((f) => (
              <div
                key={f.id}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 14,
                  padding: 14,
                  background: "white",
                  display: "grid",
                  gridTemplateColumns: "160px 1fr 140px 140px",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontWeight: 800,
                  }}
                >
                  {f?.flightNumber || "FLIGHT"}
                </div>

                <div style={{ opacity: 0.9 }}>
                  <div style={{ fontWeight: 700 }}>{f?.type || "Unknown type"}</div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>
                    Scheduled: {f?.scheduledTime ? String(f.scheduledTime) : "Unknown"}
                  </div>
                </div>

                <div style={{ fontWeight: 700 }}>{f?.status || "Unknown"}</div>

                <div style={{ textAlign: "right", opacity: 0.9 }}>
                  Airport: {f?.airportId ?? "—"}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Flights;