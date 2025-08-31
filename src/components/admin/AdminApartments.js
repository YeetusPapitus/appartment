// AdminApartments.js

import { useState, useEffect } from 'react';

export default function AdminApartments() {
  const [apartments, setApartments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ Title: '', Description: '', Price: '', Guests: '', BedType: '', BedQuantity: '' });
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetch('/appartment/api/apartments.php')
      .then(res => res.json())
      .then(data => {
        if(data.success) setApartments(data.apartments);
        else setError('Failed to load apartments');
      })
      .catch(() => setError('Failed to load apartments'));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ Title: '', Description: '', Price: '', Guests: '', BedType: '', BedQuantity: '' });
    setEditing(null);
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const url = '/appartment/api/apartments.php' + (editing ? `?id=${editing}` : '');
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const result = await res.json();
    if (result.success) {
      const updated = await fetch('/appartment/api/apartments.php').then(r => r.json());
      setApartments(updated.apartments);
      resetForm();
    } else {
      setError(result.error || 'Operation failed');
    }
  };

  const handleEdit = apt => {
    setEditing(apt.IDRoom);
    setForm({
      Title: apt.Title,
      Description: apt.Description,
      Price: apt.Price,
      Guests: apt.Guests || '',
      BedType: apt.BedType || '',
      BedQuantity: apt.BedQuantity || ''
    });
  };

  const handleDelete = async id => {
    const res = await fetch(`/appartment/api/apartments.php?id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setApartments(apartments.filter(a => a.IDRoom !== id));
    } else {
      setError(result.error || 'Delete failed');
    }
  };

  const toggleExpand = id => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const truncate = (text, len = 100) =>
    text.length > len ? text.substring(0, len) + '...' : text;

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Manage Apartments</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl mb-4">{editing ? 'Edit Apartment' : 'Add New Apartment'}</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input name="Title" value={form.Title} onChange={handleChange} className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea name="Description" value={form.Description} onChange={handleChange} className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input name="Price" type="number" value={form.Price} onChange={handleChange} className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Guests</label>
            <input name="Guests" type="number" value={form.Guests} onChange={handleChange} className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Bed Type</label>
            <input name="BedType" value={form.BedType} onChange={handleChange} className="mt-1 w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Bed Quantity</label>
            <input name="BedQuantity" type="number" value={form.BedQuantity} onChange={handleChange} className="mt-1 w-full border rounded p-2" />
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button type="submit" className="bg-royal text-white px-4 py-2 rounded">
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Guests</th>
            <th className="px-4 py-2 text-left">Bed Type</th>
            <th className="px-4 py-2 text-left">Bed Quantity</th>
            <th className="px-4 py-2 text-left">Price</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {apartments.map(apt => (
            <tr key={apt.IDRoom} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 align-top">{apt.Title}</td>
              <td className="px-4 py-2 align-top">
                {expanded[apt.IDRoom] ? apt.Description : truncate(apt.Description)}{' '}
                {apt.Description.length > 100 && (
                  <button onClick={() => toggleExpand(apt.IDRoom)} className="text-blue-600 hover:underline ml-1 text-sm">
                    {expanded[apt.IDRoom] ? 'Show less' : 'Show more'}
                  </button>
                )}
              </td>
              <td className="px-4 py-2 align-top">{apt.Guests}</td>
              <td className="px-4 py-2.align-top">{apt.BedType}</td>
              <td className="px-4 py-2.align-top">{apt.BedQuantity}</td>
              <td className="px-4 py-2 align-top">€{apt.Price}</td>
              <td className="px-4 py-2 space-x-2">
                <button onClick={() => handleEdit(apt)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(apt.IDRoom)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
