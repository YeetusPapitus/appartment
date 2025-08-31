import { useEffect, useState } from "react";

export default function AdminReservations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/appartment/api/reservations.php");
      const json = await res.json();
      if (json.success) {
        setRows(json.reservations || []);
      } else {
        setError(json.error || "Failed to load reservations.");
      }
    } catch (e) {
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/appartment/api/reservations.php", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ IDReservation: id, Status: status })
      });
      const json = await res.json();
      if (json.success) {
        await load();
      } else {
        setError(json.error || "Failed to update status.");
      }
    } catch (e) {
      setError("Failed to update status.");
    } finally {
      setBusyId(null);
    }
  };

  const pill = (status) => {
    const base = "px-2 py-1 rounded text-xs font-semibold whitespace-nowrap";
    if (status === "Accepted") return `${base} bg-green-100 text-green-700`;
    if (status === "Denied")   return `${base} bg-red-100 text-red-700`;
    return `${base} bg-yellow-100 text-yellow-800`;
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Reservations</h1>
        <button
          onClick={load}
          className="border px-3 py-1 rounded hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-[1400px] table-fixed text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3 w-16">ID</th>
                <th className="text-left px-4 py-3 w-40">Room</th>
                <th className="text-left px-4 py-3 w-28 whitespace-nowrap">Check In</th>
                <th className="text-left px-4 py-3 w-28 whitespace-nowrap">Check Out</th>
                <th className="text-left px-4 py-3 w-20">Guests</th>
                <th className="text-left px-4 py-3 w-40">Name</th>
                <th className="text-left px-4 py-3 w-56 whitespace-nowrap">Email</th>
                <th className="text-left px-4 py-3 w-36 whitespace-nowrap">Phone</th>
                <th className="text-left px-4 py-3 w-[420px]">Message</th>
                <th className="text-left px-4 py-3 w-44 whitespace-nowrap">Timestamp</th>
                <th className="text-left px-4 py-3 w-28">Status</th>
                <th className="text-left px-4 py-3 w-48">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-center" colSpan={12}>
                    No reservations found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const long = r.Message && r.Message.length > 120;
                  const showFull = !!expanded[r.IDReservation];
                  const msg = long && !showFull
                    ? r.Message.slice(0, 120) + "…"
                    : (r.Message || "");

                  return (
                    <tr key={r.IDReservation} className="border-t align-top">
                      <td className="px-4 py-3">{r.IDReservation}</td>
                      <td className="px-4 py-3">{r.RoomName || `#${r.RoomID}`}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.CheckIn}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.CheckOut}</td>
                      <td className="px-4 py-3">{r.Guests}</td>
                      <td className="px-4 py-3">{r.Name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a className="text-blue-600 hover:underline" href={`mailto:${r.Email}`}>
                          {r.Email}
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{r.PhoneNumber}</td>
                      <td className="px-4 py-3 break-words">
                        <span>{msg}</span>
                        {long && (
                          <button
                            onClick={() => toggleExpand(r.IDReservation)}
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            {showFull ? "Show less" : "Show more"}
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">{r.Timestamp}</td>
                      <td className="px-4 py-3">
                        <span className={pill(r.Status)}>{r.Status}</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            disabled={busyId === r.IDReservation}
                            onClick={() => updateStatus(r.IDReservation, "Accepted")}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            disabled={busyId === r.IDReservation}
                            onClick={() => updateStatus(r.IDReservation, "Denied")}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
