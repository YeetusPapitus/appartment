// AdminContact.js

import { useEffect, useState } from 'react';

export default function AdminContact() {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/appartment/api/contact.php');
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
      } else {
        setError(data.error || 'Failed to load contacts');
      }
    } catch {
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Read' : 'Pending';
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/appartment/api/contact.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        await load();
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch {
      setError('Failed to update status');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Review Contact Messages</h1>
        <button
          onClick={load}
          className="border px-3 py-1 rounded hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Message</th>
                <th className="px-4 py-2 text-left">Timestamp</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Toggle Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No contact messages found.
                  </td>
                </tr>
              ) : (
                contacts.map(contact => (
                  <tr key={contact.IDContact} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 align-top">{contact.IDContact}</td>
                    <td className="px-4 py-2 align-top">{contact.Name}</td>
                    <td className="px-4 py-2 align-top">
                      <a
                        className="text-blue-600 hover:underline"
                        href={`mailto:${contact.Email}`}
                      >
                        {contact.Email}
                      </a>
                    </td>
                    <td className="px-4 py-2 align-top whitespace-pre-wrap max-w-xl">
                      {contact.Message}
                    </td>
                    <td className="px-4 py-2 align-top">{contact.Timestamp}</td>
                    <td className="px-4 py-2 align-top">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          contact.Status === 'Read'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {contact.Status}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <button
                        onClick={() => toggleStatus(contact.IDContact, contact.Status)}
                        disabled={busyId === contact.IDContact}
                        className="px-3 py-1 rounded bg-royal text-white hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {busyId === contact.IDContact
                          ? 'Updating…'
                          : `Mark as ${contact.Status === 'Pending' ? 'Read' : 'Pending'}`}
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
