
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

function AirportDetails() {
  const { id } = useParams();

  const [airport, setAirport] = useState(null);
  const [gates, setGates] = useState([]);
  const [flights, setFlights] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [flightSearch, setFlightSearch] = useState("");

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState("");

  const loadInitial = () => {
    setLoading(true);
    setErrorMsg("");

    Promise.all([
      fetch(`/api/airports/${id}`),
      fetch(`/api/gates/airport/${id}`),
      fetch(`/api/flights/airport/${id}`),
    ])
      .then(async ([aRes, gRes, fRes]) => {
        if (!aRes.ok) throw new Error(`Failed to load airport (${aRes.status})`);
        if (!gRes.ok) throw new Error(`Failed to load gates (${gRes.status})`);
        if (!fRes.ok) throw new Error(`Failed to load flights (${fRes.status})`);

        const [a, g, f] = await Promise.all([aRes.json(), gRes.json(), fRes.json()]);
        setAirport(a || null);
        setGates(Array.isArray(g) ? g : []);
        setFlights(Array.isArray(f) ? f : []);
      })
      .catch((e) => setErrorMsg(e?.message || "Failed to load airport details"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErrorMsg("");

      try {
        const [aRes, gRes, fRes] = await Promise.all([
          fetch(`/api/airports/${id}`),
          fetch(`/api/gates/airport/${id}`),
          fetch(`/api/flights/airport/${id}`),
        ]);

        if (!aRes.ok) throw new Error(`Failed to load airport (${aRes.status})`);
        if (!gRes.ok) throw new Error(`Failed to load gates (${gRes.status})`);
        if (!fRes.ok) throw new Error(`Failed to load flights (${fRes.status})`);

        const [a, g, f] = await Promise.all([aRes.json(), gRes.json(), fRes.json()]);
        if (!cancelled) {
          setAirport(a || null);
          setGates(Array.isArray(g) ? g : []);
          setFlights(Array.isArray(f) ? f : []);
        }
      } catch (e) {
        if (!cancelled) setErrorMsg(e?.message || "Failed to load airport details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const filteredFlights = useMemo(() => {
    const q = flightSearch.trim().toLowerCase();
    return flights.filter((f) => {
      if (status && String(f?.status || "").toLowerCase() !== status.toLowerCase()) return false;
      if (type && String(f?.type || "").toLowerCase() !== type.toLowerCase()) return false;

      if (!q) return true;
      const fn = String(f?.flightNumber || "").toLowerCase();
      const st = String(f?.status || "").toLowerCase();
      const ty = String(f?.type || "").toLowerCase();
      return fn.includes(q) || st.includes(q) || ty.includes(q);
    });
  }, [flights, status, type, flightSearch]);

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

  const applyRangeFilter = async () => {
    setFilterLoading(true);
    setFilterError("");

    try {
      if (!start || !end) {
        throw new Error("Please choose both a start and end date/time.");
      }

      const qs = new URLSearchParams({ start, end });
      const res = await fetch(`/api/flights/airport/${id}/range?${qs.toString()}`);
      if (!res.ok) throw new Error(`Failed to load filtered flights (${res.status})`);

      const data = await res.json();
      setFlights(Array.isArray(data) ? data : []);
    } catch (e) {
      setFilterError(e?.message || "Failed to load filtered flights");
    } finally {
      setFilterLoading(false);
    }
  };

  const clearRangeFilter = async () => {
    setFilterLoading(true);
    setFilterError("");

    try {
      const res = await fetch(`/api/flights/airport/${id}`);
      if (!res.ok) throw new Error(`Failed to load flights (${res.status})`);
      const data = await res.json();
      setFlights(Array.isArray(data) ? data : []);
      setStart("");
      setEnd("");
    } catch (e) {
      setFilterError(e?.message || "Failed to reload flights");
    } finally {
      setFilterLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          ← Back
        </Link>
        <p style={{ marginTop: 14 }}>Loading airport...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          ← Back
        </Link>
        <p style={{ marginTop: 14, color: "crimson" }}>{errorMsg}</p>
        <button
          onClick={loadInitial}
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #c9c9c9",
            background: "white",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          ← Back
        </Link>
        <h1 style={{ margin: 0 }}>
          {airport?.name || "Airport"}{" "}
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 18,
              opacity: 0.85,
            }}
          >
            {airport?.code ? `(${airport.code})` : ""}
          </span>
        </h1>
      </div>

      <div style={{ marginTop: 10, opacity: 0.9 }}>
        {(airport?.city || "Unknown city") + ", " + (airport?.country || "Unknown country")}
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
        <section
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 14,
            padding: 14,
            background: "white",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Gates</h2>
          {gates.length === 0 ? (
            <p>No gates found for this airport.</p>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {gates.map((g) => (
                <span
                  key={g.id}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid #d8d8d8",
                    background: "#fafafa",
                    fontWeight: 600,
                  }}
                >
                  {g?.name || "Gate"}
                </span>
              ))}
            </div>
          )}
        </section>

        <section
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 14,
            padding: 14,
            background: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Flights</h2>
            <div style={{ marginLeft: "auto", opacity: 0.8 }}>
              Showing {filteredFlights.length} of {flights.length}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 180px 180px",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              value={flightSearch}
              onChange={(e) => setFlightSearch(e.target.value)}
              placeholder="Search flight number, status, type..."
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

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Start</span>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #c9c9c9" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>End</span>
                <input
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #c9c9c9" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <button
                onClick={applyRangeFilter}
                disabled={filterLoading}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #c9c9c9",
                  background: "white",
                  cursor: filterLoading ? "not-allowed" : "pointer",
                }}
              >
                {filterLoading ? "Filtering..." : "Apply date range"}
              </button>

              <button
                onClick={clearRangeFilter}
                disabled={filterLoading}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #c9c9c9",
                  background: "white",
                  cursor: filterLoading ? "not-allowed" : "pointer",
                }}
              >
                Clear date range
              </button>
            </div>
          </div>

          {filterError && <p style={{ marginTop: 10, color: "crimson" }}>{filterError}</p>}

          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {filteredFlights.length === 0 ? (
              <p>No flights match your filters.</p>
            ) : (
              filteredFlights.map((f) => (
                <div
                  key={f.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 12,
                    padding: 12,
                    background: "#fff",
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
                    Gate: {f?.gateId ?? "—"}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AirportDetails;