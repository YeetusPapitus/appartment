// AdminUnavailableDates.js

import { useEffect, useState } from "react";

export default function AdminUnavailableDates() {
  const [rooms, setRooms] = useState([]);
  const [dates, setDates] = useState([]);
  const [form, setForm] = useState({ RoomID: "", Date: "" });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const loadRooms = async () => {
    try {
      const res = await fetch("/appartment/api/apartments.php");
      const json = await res.json();
      if (json.success) setRooms(json.apartments || []);
    } catch {}
  };

  const loadDates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/appartment/api/unavailable_dates.php");
      const json = await res.json();
      if (json.success) setDates(json.dates || []);
      else setError(json.error || "Failed to load unavailable dates.");
    } catch {
      setError("Failed to load unavailable dates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
    loadDates();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.RoomID || !form.Date) {
      setError("Please select a room and a date.");
      return;
    }

    try {
      const res = await fetch("/appartment/api/unavailable_dates.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          RoomID: Number(form.RoomID),
          Date: form.Date,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setForm({ RoomID: "", Date: "" });
        await loadDates();
      } else {
        setError(json.error || "Failed to add unavailable date.");
      }
    } catch {
      setError("Failed to add unavailable date.");
    }
  };

  const remove = async (id) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(
        `/appartment/api/unavailable_dates.php?id=${id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.success) {
        await loadDates();
      } else {
        setError(json.error || "Failed to delete date.");
      }
    } catch {
      setError("Failed to delete date.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Unavailable Dates</h1>
        <button onClick={loadDates} className="border px-3 py-1 rounded hover:bg-gray-50">
          Refresh
        </button>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <div>
          <label className="block text-sm mb-1">Room</label>
          <select
            name="RoomID"
            value={form.RoomID}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select room…</option>
            {rooms.map((r) => (
              <option key={r.IDRoom ?? r.IDApartment} value={r.IDRoom ?? r.IDApartment}>
                {r.Title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            name="Date"
            value={form.Date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="bg-olive text-white px-4 py-2 rounded w-full hover:bg-olive-dark"
          >
            Add Unavailable Date
          </button>
        </div>
      </form>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Room</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No unavailable dates added yet.
                  </td>
                </tr>
              ) : (
                dates.map((d) => (
                  <tr key={d.IDUnavailableDate} className="border-t">
                    <td className="px-4 py-3">{d.IDUnavailableDate}</td>
                    <td className="px-4 py-3">{d.DateFormatted || d.Date}</td>
                    <td className="px-4 py-3">{d.RoomTitle || `#${d.RoomID}`}</td>
                    <td className="px-4 py-3">
                      <button
                        disabled={busyId === d.IDUnavailableDate}
                        onClick={() => remove(d.IDUnavailableDate)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {busyId === d.IDUnavailableDate ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
