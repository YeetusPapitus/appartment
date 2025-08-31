// AvailabilityModal.js
import { useEffect, useMemo, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');
const toISO = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toDMY = (date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

export default function AvailabilityModal({ room, isOpen, onClose }) {
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [blocked, setBlocked] = useState(new Set());
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [rangeError, setRangeError] = useState('');

  const roomId = Number(room?.IDRoom ?? room?.IDApartment ?? 0);

  const iterDays = (startDate, endDateExclusive) => {
    const out = [];
    const cur = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const end = new Date(
      endDateExclusive.getFullYear(),
      endDateExclusive.getMonth(),
      endDateExclusive.getDate()
    );
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
    setRangeError('');
    setMonthAnchor(new Date(start.getFullYear(), start.getMonth(), 1));
  }, [isOpen, roomId]);

  if (!isOpen || !room) return null;

  const cells = [];
  for (let i = 0; i < monthInfo.startPad; i++) cells.push(null);
  for (let d = 1; d <= monthInfo.daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);

  const isPast = (y, m, d) => {
    const day = new Date(y, m, d);
    const t = new Date();
    const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    return day < today;
  };

  const isBlockedDay = (y, m, d) => blocked.has(`${y}-${pad(m + 1)}-${pad(d)}`);

  const inSelectedRange = (y, m, d) => {
    if (!checkIn || !checkOut) return false;
    const day = new Date(y, m, d);
    return day >= checkIn && day < checkOut;
  };

  const canClick = (y, m, d) => {
    if (isPast(y, m, d)) return false;
    const dayDate = new Date(y, m, d);
    const blockedDay = isBlockedDay(y, m, d);

    if (!checkIn || (checkIn && checkOut)) {
      return !blockedDay;
    }

    if (dayDate <= checkIn) return false;

    const nights = iterDays(checkIn, dayDate);
    const intersects = nights.some((iso) => blocked.has(iso));
    return !intersects;
  };

  const handleDayClick = (y, m, d) => {
    if (!canClick(y, m, d)) return;
    const clicked = new Date(y, m, d);

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clicked);
      setCheckOut(null);
      setRangeError('');
      return;
    }

    const nights = iterDays(checkIn, clicked);
    if (nights.some((iso) => blocked.has(iso))) {
      setRangeError('Selected range includes unavailable dates. Please choose different dates.');
      return;
    }

    setCheckOut(clicked);
    setRangeError('');
  };

  const clearDates = () => {
    setCheckIn(null);
    setCheckOut(null);
    setRangeError('');
  };

  const prevMonth = () =>
    setMonthAnchor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setMonthAnchor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Availability — {room.Title}</h3>
            <p className="text-sm text-gray-600">
              Select a check-in and check-out day by clicking on a date.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded px-3 py-1 border hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="px-3 py-1 rounded border hover:bg-gray-50"
            >
              ‹ Prev
            </button>
            <div className="font-medium">
              {new Intl.DateTimeFormat(undefined, {
                month: 'long',
                year: 'numeric',
              }).format(monthAnchor)}
            </div>
            <button
              onClick={nextMonth}
              className="px-3 py-1 rounded border hover:bg-gray-50"
            >
              Next ›
            </button>
          </div>

          {loadError && <div className="text-red-600 mb-2">{loadError}</div>}
          {loadingBlocked && (
            <div className="text-gray-600 mb-2">Loading availability…</div>
          )}

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
            <span className="inline-block w-4 h-4 rounded bg-red-100 border border-red-200" />
            <span>Unavailable</span>
            <span className="inline-block w-4 h-4 rounded bg-olive/20 border border-olive/30 ml-4" />
            <span>Selected</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs uppercase tracking-wide text-gray-500">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-center py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 mt-1">
            {cells.map((d, idx) => {
              if (d === null) return <div key={`e-${idx}`} />;

              const y = monthInfo.y;
              const m = monthInfo.m;
              const dayDate = new Date(y, m, d);
              const blockedDay = isBlockedDay(y, m, d);
              const pastDay = isPast(y, m, d);

              let canUseAsCheckout = false;
              if (checkIn && !checkOut && !pastDay && dayDate > checkIn) {
                const nights = iterDays(checkIn, dayDate);
                const intersects = nights.some((iso) => blocked.has(iso));
                canUseAsCheckout = !intersects;
              }

              let classes =
                'h-10 flex items-center justify-center rounded text-sm select-none transition';

              if (blockedDay) {
                if (canUseAsCheckout) {
                  classes += ' bg-red-100 text-red-700 cursor-pointer';
                } else {
                  classes += ' bg-red-100 text-red-700 line-through cursor-not-allowed';
                }
              } else if (pastDay) {
                classes += ' bg-gray-100 text-gray-400 cursor-not-allowed';
              } else {
                classes += ' bg-white hover:bg-gray-100 cursor-pointer';
              }

              const isSelectedStart =
                checkIn && dayDate.getTime() === checkIn.getTime();
              const isSelectedEnd =
                checkOut && dayDate.getTime() === checkOut.getTime();
              const isInRange = inSelectedRange(y, m, d);
              if (isSelectedStart || isSelectedEnd || isInRange) {
                classes += ' ring-1 ring-olive/50 bg-olive/10';
              }

              return (
                <div
                  key={`d-${idx}`}
                  className={classes}
                  onClick={() => canClick(y, m, d) && handleDayClick(y, m, d)}
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
            <button onClick={clearDates} className="ml-auto text-sm underline">
              Clear
            </button>
          </div>
          {rangeError && (
            <p className="text-sm text-red-600 mt-2">{rangeError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
