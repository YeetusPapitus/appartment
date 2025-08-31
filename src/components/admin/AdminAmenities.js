// AdminAmenities.js

import { useEffect, useState } from "react";

export default function AdminAmenities() {
  const [rooms, setRooms] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  const [newTitle, setNewTitle] = useState("");
  const [newAmenityRooms, setNewAmenityRooms] = useState(new Set());

  
  const [selectedAmenityId, setSelectedAmenityId] = useState("");
  const [assignRooms, setAssignRooms] = useState(new Set());

  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null); 

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [roomsRes, amRes, mapRes] = await Promise.all([
        fetch("/appartment/api/apartments.php"),          
        fetch("/appartment/api/amenities.php"),            
        fetch("/appartment/api/room_amenities.php"),        
      ]);

      const roomsJson = await roomsRes.json();
      const amJson = await amRes.json();
      const mapJson = await mapRes.json();

      if (roomsJson.success) setRooms(roomsJson.apartments || []);
      else setError(roomsJson.error || "Failed to load rooms.");

      if (amJson.success) setAmenities(amJson.amenities || []);
      else setError((e) => e || amJson.error || "Failed to load amenities.");

      if (mapJson.success) setAssignments(mapJson.mappings || []);
      else setError((e) => e || mapJson.error || "Failed to load assignments.");
    } catch (e) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleSet = (set, id) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  };

  
  const createAmenity = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError("Amenity title is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/appartment/api/amenities.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Title: newTitle.trim() })
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to create amenity.");
        setBusy(false);
        return;
      }

      const amenityId = json.IDAmenity;

      
      const ids = Array.from(newAmenityRooms);
      if (ids.length > 0) {
        await fetch("/appartment/api/room_amenities.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ AmenityID: amenityId, RoomIDs: ids })
        });
      }

      
      setNewTitle("");
      setNewAmenityRooms(new Set());
      await load();
    } catch {
      setError("Failed to create amenity.");
    } finally {
      setBusy(false);
    }
  };

  
  const assignAmenity = async (e) => {
    e.preventDefault();
    if (!selectedAmenityId) {
      setError("Select an amenity to assign.");
      return;
    }
    const ids = Array.from(assignRooms);
    if (ids.length === 0) {
      setError("Select at least one room.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/appartment/api/room_amenities.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ AmenityID: Number(selectedAmenityId), RoomIDs: ids })
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to assign amenity.");
      } else {
        setSelectedAmenityId("");
        setAssignRooms(new Set());
        await load();
      }
    } catch {
      setError("Failed to assign amenity.");
    } finally {
      setBusy(false);
    }
  };

  const deleteAmenity = async (id) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/appartment/api/amenities.php?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to delete amenity.");
      } else {
        await load();
      }
    } catch {
      setError("Failed to delete amenity.");
    } finally {
      setBusyId(null);
    }
  };

  const unassign = async (id) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/appartment/api/room_amenities.php?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to unassign.");
      } else {
        await load();
      }
    } catch {
      setError("Failed to unassign.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Amenities</h1>
        <button onClick={load} className="border px-3 py-1 rounded hover:bg-gray-50">Refresh</button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? <div>Loading…</div> : (
        <>
          <form onSubmit={createAmenity} className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Add New Amenity</h2>
            <div className="grid sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-1">
                <label className="block text-sm mb-1">Title</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., High-Speed WiFi"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Assign to Rooms</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-auto border rounded p-2">
                  {rooms.map((r) => {
                    const id = Number(r.IDRoom ?? r.IDApartment);
                    return (
                      <label key={id} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={newAmenityRooms.has(id)}
                          onChange={() => setNewAmenityRooms((s) => toggleSet(s, id))}
                        />
                        <span>{r.Title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button
                type="submit"
                disabled={busy}
                className="bg-olive text-white px-4 py-2 rounded hover:bg-olive-dark disabled:opacity-50"
              >
                {busy ? "Saving…" : "Add Amenity"}
              </button>
            </div>
          </form>

          <form onSubmit={assignAmenity} className="bg-white rounded-lg shadow p-4 mb-8">
            <h2 className="text-lg font-semibold mb-3">Assign Existing Amenity</h2>
            <div className="grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm mb-1">Amenity</label>
                <select
                  value={selectedAmenityId}
                  onChange={(e) => setSelectedAmenityId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select amenity…</option>
                  {amenities.map((a) => (
                    <option key={a.IDAmenity} value={a.IDAmenity}>{a.Title}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Assign to Rooms</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-auto border rounded p-2">
                  {rooms.map((r) => {
                    const id = Number(r.IDRoom ?? r.IDApartment);
                    return (
                      <label key={id} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={assignRooms.has(id)}
                          onChange={() => setAssignRooms((s) => toggleSet(s, id))}
                        />
                        <span>{r.Title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <button
                type="submit"
                disabled={busy}
                className="bg-olive text-white px-4 py-2 rounded hover:bg-olive-dark disabled:opacity-50"
              >
                {busy ? "Assigning…" : "Assign Amenity"}
              </button>
            </div>
          </form>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">All Amenities</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">Title</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {amenities.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-500">No amenities found.</td></tr>
                  ) : amenities.map((a) => (
                    <tr key={a.IDAmenity} className="border-t">
                      <td className="px-4 py-3">{a.IDAmenity}</td>
                      <td className="px-4 py-3">{a.Title}</td>
                      <td className="px-4 py-3">
                        <button
                          disabled={busyId === a.IDAmenity}
                          onClick={() => deleteAmenity(a.IDAmenity)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {busyId === a.IDAmenity ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Room–Amenity Assignments</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">Amenity</th>
                    <th className="text-left px-4 py-3">Room</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-500">No assignments yet.</td></tr>
                  ) : assignments.map((m) => (
                    <tr key={m.IDRoomAmenity} className="border-t">
                      <td className="px-4 py-3">{m.IDRoomAmenity}</td>
                      <td className="px-4 py-3">{m.AmenityTitle}</td>
                      <td className="px-4 py-3">{m.RoomTitle}</td>
                      <td className="px-4 py-3">
                        <button
                          disabled={busyId === m.IDRoomAmenity}
                          onClick={() => unassign(m.IDRoomAmenity)}
                          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-black disabled:opacity-50"
                        >
                          {busyId === m.IDRoomAmenity ? "Removing…" : "Unassign"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
