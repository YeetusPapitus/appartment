// ReservationModal.js

import { useEffect, useMemo, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');
const toISO = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toDMY = (date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

export default function ReservationModal({ room, isOpen, onClose, onSuccess, initialData }) {
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [blocked, setBlocked] = useState(new Set());
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [loadError, setLoadError] = useState('');

  // selection + form
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const maxGuests = Number(room?.Guests ?? 0);
  const roomId = Number(room?.IDRoom ?? room?.IDApartment ?? 0);

  const iterDays = (startDate, endDateExclusive) => {
    const out = [];
    const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDateExclusive.getFullYear(), endDateExclusive.getMonth(), endDateExclusive.getDate());
    while (cur < end) {
      out.push(toISO(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  };

  const monthInfo = useMemo(() => {
    const y = monthAnchor.getFullYear();
    const m = monthAnchor.getMonth();
    const first = new Date(y, m, 1);
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const js = first.getDay();
    const startPad = (js + 6) % 7;
    return { y, m, daysInMonth, startPad };
  }, [monthAnchor]);

  useEffect(() => {
    if (!isOpen || !roomId) return;

    const start = new Date();
    const startRange = new Date(start.getFullYear(), start.getMonth(), 1);
    const endRange = new Date(start.getFullYear(), start.getMonth() + 12, 0);

    const startISO = toISO(startRange);
    const endISO = toISO(endRange);

    (async () => {
      setLoadingBlocked(true);
      setLoadError('');
      try {
        const res = await fetch(
          `/appartment/api/availability.php?roomId=${roomId}&start=${startISO}&end=${endISO}`
        );
        const json = await res.json();
        if (json.success) {
          setBlocked(new Set(json.dates || []));
        } else {
          setLoadError(json.error || 'Failed to load availability.');
          setBlocked(new Set());
        }
      } catch {
        setLoadError('Failed to load availability.');
        setBlocked(new Set());
      } finally {
        setLoadingBlocked(false);
      }
    })();

    setCheckIn(null);
    setCheckOut(null);
    setGuests('');
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setFieldErrors({});
    setSubmitError('');
    setSuccessMsg('');
    setMonthAnchor(new Date(start.getFullYear(), start.getMonth(), 1));

    if (initialData?.ci) {
        const ciDate = new Date(initialData.ci);
        setCheckIn(ciDate);
        setMonthAnchor(new Date(ciDate.getFullYear(), ciDate.getMonth(), 1));
      }
      if (initialData?.co) {
        const coDate = new Date(initialData.co);
        setCheckOut(coDate);
      }
      if (typeof initialData?.g !== 'undefined') {
        setGuests(String(initialData.g));
      }
    }, [isOpen, roomId, initialData]);

      if (!isOpen || !room) return null;

  const cells = [];
  for (let i = 0; i < monthInfo.startPad; i++) cells.push(null);
  for (let d = 1; d <= monthInfo.daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);


  const isPast = (y, m, d) => {
    const day = new Date(y, m, d);
    const today = new Date();
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return day < t;
  };

  const isBlocked = (y, m, d) => blocked.has(`${y}-${pad(m + 1)}-${pad(d)}`);

  const inSelectedRange = (y, m, d) => {
    if (!checkIn || !checkOut) return false;
    const day = new Date(y, m, d);
    return day >= checkIn && day < checkOut;
  };

  const dayClickable = (y, m, d) => !isPast(y, m, d) && !isBlocked(y, m, d);

  const handleDayClick = (y, m, d) => {
    if (!dayClickable(y, m, d)) return;
    const clicked = new Date(y, m, d);

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clicked);
      setCheckOut(null);
      setFieldErrors((fe) => ({ ...fe, CheckIn: undefined, CheckOut: undefined }));
      return;
    }

    if (clicked < checkIn) {
      setCheckIn(clicked);
      setCheckOut(null);
      return;
    }

    if (clicked.getTime() === checkIn.getTime()) return;

    const nights = iterDays(checkIn, clicked);
    if (nights.some((iso) => blocked.has(iso))) {
      setFieldErrors((fe) => ({
        ...fe,
        CheckOut: 'Selected range crosses unavailable dates. Please choose a different range.',
      }));
      return;
    }

    setCheckOut(clicked);
    setFieldErrors((fe) => ({ ...fe, CheckOut: undefined }));
  };

  const clearDates = () => {
    setCheckIn(null);
    setCheckOut(null);
    setFieldErrors((fe) => ({ ...fe, CheckIn: undefined, CheckOut: undefined }));
  };

  const prevMonth = () => setMonthAnchor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setMonthAnchor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const validateAndSubmit = async () => {
    const fe = {};
    setSubmitError('');
    setSuccessMsg('');

    if (!checkIn) fe.CheckIn = 'Please select check-in';
    if (!checkOut) fe.CheckOut = 'Please select check-out';

    const g = Number(guests || 0);
    if (!g || g <= 0) fe.Guests = 'Please enter guests';
    if (maxGuests && g > maxGuests)
      fe.Guests = `Maximum ${maxGuests} ${maxGuests === 1 ? 'guest' : 'guests'}`;
    if (!name.trim()) fe.Name = 'Please enter your name';
    if (!email.trim()) fe.Email = 'Please enter your email';
    else if (!/^\S+@\S+\.\S+$/.test(email)) fe.Email = 'Invalid email';
    if (!phone.trim()) fe.PhoneNumber = 'Please enter your phone number';

    if (checkIn && checkOut) {
      const nights = iterDays(checkIn, checkOut);
      if (nights.some((iso) => blocked.has(iso))) {
        fe.CheckOut = 'Selected range includes unavailable dates.';
      }
    }

    setFieldErrors(fe);
    if (Object.keys(fe).length > 0) return;

    try {
      const payload = {
        CheckIn: toISO(checkIn),
        CheckOut: toISO(checkOut),
        Guests: g,
        RoomID: roomId,
        Name: name.trim(),
        Email: email.trim(),
        PhoneNumber: phone.trim(),
        Message: message.trim(),
      };

      const res = await fetch('/appartment/api/reservations.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setSuccessMsg('Your reservation request was sent successfully. We will contact you soon.');
        setFieldErrors({});
        if (onSuccess) onSuccess();
        setTimeout(onClose, 3000);
      } else if (json.fieldErrors) {
        setFieldErrors(json.fieldErrors);
      } else {
        setSubmitError(json.error || 'Failed to submit reservation.');
      }
    } catch {
      setSubmitError('Failed to submit reservation.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Reserve — {room.Title}</h3>
            <p className="text-sm text-gray-600">
              Pick your check-in and check-out dates, then add your details.
            </p>
          </div>
          <button onClick={onClose} className="rounded px-3 py-1 border hover:bg-gray-50">
            Close
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="px-3 py-1 rounded border hover:bg-gray-50">‹ Prev</button>
              <div className="font-medium">{new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(monthAnchor)}</div>
              <button onClick={nextMonth} className="px-3 py-1 rounded border hover:bg-gray-50">Next ›</button>
            </div>

            {loadError && <div className="text-red-600 mb-2">{loadError}</div>}
            {loadingBlocked && <div className="text-gray-600 mb-2">Loading availability…</div>}

            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <span className="inline-block w-4 h-4 rounded bg-red-100 border border-red-200" />
              <span>Unavailable</span>
              <span className="inline-block w-4 h-4 rounded bg-olive/20 border border-olive/30 ml-4" />
              <span>Selected</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs uppercase tracking-wide text-gray-500">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                <div key={d} className="text-center py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 mt-1">
              {cells.map((d, idx) => {
                if (d === null) return <div key={`e-${idx}`} />;

                const y = monthInfo.y;
                const m = monthInfo.m;
                const clickable = dayClickable(y, m, d);
                const blockedDay = isBlocked(y, m, d);
                const pastDay = isPast(y, m, d);

                let classes = 'h-10 flex items-center justify-center rounded text-sm select-none transition';
                if (blockedDay) classes += ' bg-red-100 text-red-700 line-through cursor-not-allowed';
                else if (pastDay) classes += ' bg-gray-100 text-gray-400 cursor-not-allowed';
                else classes += ' bg-white hover:bg-gray-100 cursor-pointer';

                const dayDate = new Date(y, m, d);
                const isSelectedStart = checkIn && dayDate.getTime() === checkIn.getTime();
                const isSelectedEnd = checkOut && dayDate.getTime() === checkOut.getTime();
                const isInRange = inSelectedRange(y, m, d);
                if (isSelectedStart || isSelectedEnd || isInRange) {
                  classes += ' ring-1 ring-olive/50 bg-olive/10';
                }

                return (
                  <div
                    key={`d-${idx}`}
                    className={classes}
                    onClick={() => clickable && handleDayClick(y, m, d)}
                  >
                    {d}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mt-3">
              <div className="text-sm">
                <span className="font-medium">Check-in:</span>{' '}
                {checkIn ? toDMY(checkIn) : <span className="text-gray-500">not set</span>}
              </div>
              <div className="text-sm">
                <span className="font-medium">Check-out:</span>{' '}
                {checkOut ? toDMY(checkOut) : <span className="text-gray-500">not set</span>}
              </div>
              <button onClick={clearDates} className="ml-auto text-sm underline">Clear</button>
            </div>
            {fieldErrors.CheckIn && <p className="text-sm text-red-600 mt-1">{fieldErrors.CheckIn}</p>}
            {fieldErrors.CheckOut && <p className="text-sm text-red-600">{fieldErrors.CheckOut}</p>}
          </div>

          <div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Guests {maxGuests ? `(max ${maxGuests})` : ''}</label>
              <input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., 2"
              />
              {fieldErrors.Guests && <p className="text-sm text-red-600 mt-1">{fieldErrors.Guests}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Your full name"
              />
              {fieldErrors.Name && <p className="text-sm text-red-600 mt-1">{fieldErrors.Name}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="you@example.com"
              />
              {fieldErrors.Email && <p className="text-sm text-red-600 mt-1">{fieldErrors.Email}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm mb-1">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="+385 ..."
              />
              {fieldErrors.PhoneNumber && <p className="text-sm text-red-600 mt-1">{fieldErrors.PhoneNumber}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Message</label>
              <textarea
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Any special requests?"
              />
            </div>

            {submitError && <p className="text-sm text-red-600 mb-2">{submitError}</p>}
            {successMsg && <p className="text-sm text-green-700 mb-2">{successMsg}</p>}

            <button
              onClick={validateAndSubmit}
              className="w-full bg-olive text-white px-4 py-2 rounded hover:bg-olive-dark transition"
            >
              Send Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
