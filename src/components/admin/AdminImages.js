// AdminImages.js

import { useEffect, useState } from 'react';

export default function AdminImages() {
  const [rooms, setRooms] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchImages();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/appartment/api/apartments.php');
      const data = await res.json();
      if (data.success) setRooms(data.apartments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchImages = async () => {
    try {
      const res = await fetch('/appartment/api/images.php');
      const data = await res.json();
      if (data.success) setImages(data.images || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    const f = e.target.files[0];
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(f.type)) {
      setError('Only JPG, PNG or GIF images are allowed.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return setError('Please choose an image to upload.');
    if (!selectedRoom && selectedRoom !== 0) return setError('Please select a room (by name) to assign the image.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('roomId', selectedRoom);

      const res = await fetch('/appartment/api/images.php', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFile(null);
        setPreview(null);
        setSelectedRoom('');
        fetchImages();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setError('Upload error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/appartment/api/images.php?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchImages();
      else setError(data.error || 'Delete failed');
    } catch (err) {
      console.error(err);
      setError('Delete error');
    }
  };

  const handleAssign = async (id, roomId) => {
    try {
      const res = await fetch(`/appartment/api/images.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign', roomId }),
      });
      const data = await res.json();
      if (data.success) fetchImages();
      else setError(data.error || 'Assign failed');
    } catch (err) {
      console.error(err);
      setError('Assign error');
    }
  };

  const handleSetPrimary = async (id, isPrimary) => {
    try {
      const res = await fetch(`/appartment/api/images.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_primary', isPrimary: isPrimary ? 1 : 0 }),
      });
      const data = await res.json();
      if (data.success) fetchImages();
      else setError(data.error || 'Set primary failed');
    } catch (err) {
      console.error(err);
      setError('Set primary error');
    }
  };

  const handleReorder = async (id, direction) => {
    try {
      const res = await fetch(`/appartment/api/images.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', direction }),
      });
      const data = await res.json();
      if (data.success) fetchImages();
      else setError(data.error || 'Reorder failed');
    } catch (err) {
      console.error(err);
      setError('Reorder error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-4">Manage Images</h2>

      <form onSubmit={handleUpload} className="bg-white p-4 rounded shadow mb-6">
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Assign to apartment (select by name)</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="mt-1 w-full border rounded p-2 bg-transparent"
            >
              <option value="">-- select apartment (or choose Unassigned) --</option>
              <option value="0">Unassigned</option>
              {rooms.map(r => (
                <option key={r.IDRoom ?? r.IDApartment} value={r.IDRoom ?? r.IDApartment}>
                  {r.Title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Image file</label>
            <input onChange={handleFileChange} type="file" accept="image/*" className="mt-1 w-full" />
          </div>
        </div>

        {preview && (
          <div className="mt-4">
            <p className="text-sm mb-2">Preview</p>
            <img src={preview} alt="preview" className="w-48 h-32 object-cover rounded shadow" />
          </div>
        )}

        <div className="mt-4">
          <button type="submit" disabled={loading} className="bg-olive text-white px-4 py-2 rounded hover:bg-olive-dark transition disabled:opacity-60">
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </form>

      <h3 className="text-lg font-medium mb-2">Uploaded images</h3>
      <div className="grid grid-cols-1 gap-4">
        {images.length === 0 && <p className="text-gray-600">No images uploaded yet.</p>}
        {images.map(img => (
          <div key={img.IDImage} className="flex items-center gap-4 bg-white p-3 rounded shadow">
            <img src={img.ImageURL} alt={img.RoomTitle ?? img.IDImage} className="w-28 h-20 object-cover rounded" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">{img.RoomTitle ?? `Room #${img.RoomID ?? 'unassigned'}`}</p>
                {img.IsPrimary ? (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Primary</span>
                ) : null}
              </div>
              <p className="text-sm text-gray-600 break-words max-w-xl truncate">{img.ImageURL}</p>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <label className="text-sm">Assign:</label>
                <select
                  value={img.RoomID ?? 0}
                  onChange={(e) => handleAssign(img.IDImage, parseInt(e.target.value, 10))}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value={0}>Unassigned</option>
                  {rooms.map(r => (
                    <option key={r.IDRoom ?? r.IDApartment} value={r.IDRoom ?? r.IDApartment}>
                      {r.Title}
                    </option>
                  ))}
                </select>

                {img.IsPrimary ? (
                  <button onClick={() => handleSetPrimary(img.IDImage, 0)} className="text-sm px-2 py-1 bg-gray-200 rounded">Unset Primary</button>
                ) : (
                  <button onClick={() => handleSetPrimary(img.IDImage, 1)} className="text-sm px-2 py-1 bg-blue-600 text-white rounded">Make Primary</button>
                )}

                <button onClick={() => handleReorder(img.IDImage, 'up')} className="text-sm px-2 py-1 bg-gray-100 rounded">↑ Up</button>
                <button onClick={() => handleReorder(img.IDImage, 'down')} className="text-sm px-2 py-1 bg-gray-100 rounded">↓ Down</button>

                <button onClick={() => handleDelete(img.IDImage)} className="text-sm px-2 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
