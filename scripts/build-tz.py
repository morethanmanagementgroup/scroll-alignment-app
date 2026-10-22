"""Build data/tz-transitions.json from the IANA tz database (TZif files).

Why: Node's built-in time-zone data (ICU) omits IANA "backzone" history, so
before 1970 many zones silently use a neighbour's rules (e.g. Europe/Stockholm
falls back to Berlin's 1940s daylight saving). Birth times need the full local
history, so Scroll ships its own table, built from a tz database compiled WITH
backzone (Debian/Ubuntu's tzdata package is), and records its version.

    python3 scripts/build-tz.py [/usr/share/zoneinfo]

Covers every IANA zone (Area/Location names), 1850-01-01 to 2040-12-31.
"""
import json, os, struct, sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

ROOT = sys.argv[1] if len(sys.argv) > 1 else '/usr/share/zoneinfo'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'data', 'tz-transitions.json')
START = int(datetime(1850, 1, 1, tzinfo=timezone.utc).timestamp())
END = int(datetime(2041, 1, 1, tzinfo=timezone.utc).timestamp())


def version():
    with open(os.path.join(ROOT, 'tzdata.zi')) as f:
        first = f.readline().strip()
    return first.replace('# version', '').strip()


def tzif_transitions(path):
    """Explicit transitions from a TZif v2+ file (64-bit section)."""
    data = open(path, 'rb').read()
    def header(off):
        magic, ver = data[off:off + 4], data[off + 4:off + 5]
        assert magic == b'TZif', path
        counts = struct.unpack('>6l', data[off + 20:off + 44])
        return ver, counts
    ver, (isutc, isstd, leap, timecnt, typecnt, charcnt) = header(0)
    off = 44 + timecnt * 5 + typecnt * 6 + charcnt + leap * 8 + isstd + isutc
    if ver == b'\x00':  # v1 only
        raise ValueError('TZif v1 not supported')
    _, (isutc, isstd, leap, timecnt, typecnt, charcnt) = header(off)
    p = off + 44
    times = struct.unpack(f'>{timecnt}q', data[p:p + timecnt * 8]); p += timecnt * 8
    idx = data[p:p + timecnt]; p += timecnt
    types = [struct.unpack('>lbb', data[p + i * 6:p + i * 6 + 6])[0] for i in range(typecnt)]
    return [(t, types[i]) for t, i in zip(times, idx)], types[0]


def offset_at(z, ts):
    return int(datetime.fromtimestamp(ts, timezone.utc).astimezone(z).utcoffset().total_seconds())


def build_zone(name):
    z = ZoneInfo(name)
    trans, _ = tzif_transitions(os.path.join(ROOT, name))
    # Start state and explicit changes inside the window.
    t_out, o_out = [START], [offset_at(z, START)]
    for t, off in trans:
        if START < t < END and off != o_out[-1]:
            t_out.append(t); o_out.append(off)
    # After the last explicit transition the footer rule applies; scan daily and bisect.
    last = max(t_out[-1], trans[-1][0] if trans else START)
    day = 86400
    t = max(last, START) + day
    prev = offset_at(z, t - day)
    while t < END:
        cur = offset_at(z, t)
        if cur != prev:
            lo, hi = t - day, t
            while hi - lo > 1:
                mid = (lo + hi) // 2
                if offset_at(z, mid) == prev: lo = mid
                else: hi = mid
            if hi > t_out[-1]:
                t_out.append(hi); o_out.append(cur)
            prev = cur
        t += day
    # Sanity: the table must reproduce zoneinfo at every transition and midway.
    for i, ti in enumerate(t_out):
        assert offset_at(z, ti) == o_out[i], (name, ti)
        if i + 1 < len(t_out):
            assert offset_at(z, (ti + t_out[i + 1]) // 2) == o_out[i], (name, ti)
    return {'t': t_out, 'o': o_out}


zones = json.load(open(os.path.join(HERE, '..', 'data', 'cities.json')))['zones']
out = {'format': 'scroll-tz/1', 'tzdb': version(), 'backzone': True,
       'source': f'IANA tz {version()} compiled with backzone ({ROOT})',
       'range': ['1850-01-01', '2040-12-31'], 'zones': {}}
from zoneinfo import available_timezones
for name in sorted(set(zones) | {z for z in available_timezones() if '/' in z and not z.startswith(('posix/', 'right/'))} | {'UTC'}):
    out['zones'][name] = build_zone(name)
json.dump(out, open(OUT, 'w'), separators=(',', ':'))
n = sum(len(v['t']) for v in out['zones'].values())
print(f"{len(out['zones'])} zones, {n} transitions, tz {out['tzdb']} -> {OUT} ({os.path.getsize(OUT)//1024} KB)")
