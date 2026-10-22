"""Build time-conversion test cases and the Python zoneinfo reference answers.

    python3 validation/time-cases.py      # writes validation/out/time-cases.json
Cases: 3,000 random (zone, local time) pairs 1900-2030 plus every local time in
15-minute steps within ±2 h of clock changes found in 400 random zone-years.
"""
import json, os, random
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
zones = json.load(open(os.path.join(HERE, '..', 'data', 'cities.json')))['zones']
random.seed(42)

def classify(zone, naive):
    z = ZoneInfo(zone)
    found = set()
    for fold in (0, 1):
        aware = naive.replace(tzinfo=z, fold=fold)
        utc = aware.astimezone(timezone.utc)
        if utc.astimezone(z).replace(tzinfo=None) == naive:
            found.add(utc)
    found = sorted(found)
    status = {0: 'nonexistent', 1: 'ok', 2: 'ambiguous'}[len(found)]
    return status, [u.strftime('%Y-%m-%dT%H:%M:%S.000Z') for u in found]

cases = []
for _ in range(3000):
    zone = random.choice(zones)
    d = datetime(1900, 1, 1) + timedelta(minutes=random.randrange(0, 131 * 365 * 24 * 60))
    cases.append((zone, d.replace(second=0)))

for _ in range(400):
    zone = random.choice(zones)
    z = ZoneInfo(zone)
    year = random.randrange(1910, 2030)
    t = datetime(year, 1, 1, tzinfo=timezone.utc)
    prev = t.astimezone(z).utcoffset()
    while t.year == year:
        t2 = t + timedelta(hours=1)
        off = t2.astimezone(z).utcoffset()
        if off != prev:
            local = t2.astimezone(z).replace(tzinfo=None)
            for m in range(-120, 121, 15):
                cases.append((zone, (local + timedelta(minutes=m)).replace(second=0, minute=((local + timedelta(minutes=m)).minute // 15) * 15)))
            prev = off
        t = t2

out = []
for zone, naive in cases:
    status, utcs = classify(zone, naive)
    out.append({'zone': zone, 'date': naive.strftime('%Y-%m-%d'), 'time': naive.strftime('%H:%M'), 'status': status, 'utc': utcs})

import zoneinfo, importlib.util
tzver = 'system'
try:
    import tzdata; tzver = 'tzdata package ' + tzdata.IANA_VERSION
except Exception:
    try: tzver = 'system tzdata ' + open('/usr/share/zoneinfo/tzdata.zi').readline().replace('# version', '').strip()
    except Exception: pass
json.dump({'reference': f'Python zoneinfo ({tzver})', 'cases': out}, open(os.path.join(HERE, 'out', 'time-cases.json'), 'w'))
print(len(out), 'cases;', tzver)
