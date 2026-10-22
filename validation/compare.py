"""Compare Scroll's astrocartography output against reference ephemerides.

References (matching settings: geocentric, apparent, true equator & equinox
of date, Greenwich apparent sidereal time, no refraction):
  A. NASA JPL DE421 via Skyfield (independent code + JPL numerical ephemeris)
  B. Swiss Ephemeris 2.10.03, Moshier mode (validation/out/swe.json)

    pip install skyfield skyfield-data
    python3 validation/compare.py > validation/RESULTS.md
"""
import json, math, os, statistics as st, warnings
from skyfield.api import load, wgs84, Loader
from skyfield.framelib import true_equator_and_equinox_of_date  # noqa: F401 (documents the frame)

warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__))
R_KM = 6371.0088
D2R = math.pi / 180

cases = json.load(open(os.path.join(HERE, 'cases.json')))
ours = {r['utc']: r for r in json.load(open(os.path.join(HERE, 'out', 'engine.json')))['results']}
swe = {r['utc']: r for r in json.load(open(os.path.join(HERE, 'out', 'swe.json')))['results']}

import skyfield_data
ld = Loader(skyfield_data.get_skyfield_data_path(), expire=False)
ts = ld.timescale(builtin=True)
eph = ld('de421.bsp')
earth = eph['earth']
KEYS = {'Sun': 'sun', 'Moon': 'moon', 'Mercury': 'mercury', 'Venus': 'venus', 'Mars': 'mars barycenter',
        'Jupiter': 'jupiter barycenter', 'Saturn': 'saturn barycenter', 'Uranus': 'uranus barycenter',
        'Neptune': 'neptune barycenter', 'Pluto': 'pluto barycenter'}
BODIES = list(KEYS)
ANGLES = ['MC', 'IC', 'ASC', 'DSC']


def as_ut1(utc):
    # Birth instants are civil clock times converted to UT. Before 1972 civil
    # time WAS Universal Time (GMT); since 1972 UTC stays within 0.9 s of UT1.
    # Scroll's engine treats the instant as UT1, so the reference does too.
    # (Skyfield's from_datetime() would apply the post-1972 UTC definition to
    # earlier dates, which shifts sidereal time by up to ~42 s in 1901.)
    import datetime as _dt
    d = _dt.datetime.fromisoformat(utc.replace('Z', '+00:00'))
    return ts.ut1(d.year, d.month, d.day, d.hour, d.minute, d.second)


def norm180(x):
    x = ((x % 360) + 360) % 360
    return x - 360 if x > 180 else x


def sep_arcsec(ra1h, d1, ra2h, d2):
    a1, a2 = ra1h * 15 * D2R, ra2h * 15 * D2R
    b1, b2 = d1 * D2R, d2 * D2R
    c = math.sin(b1) * math.sin(b2) + math.cos(b1) * math.cos(b2) * math.cos(a1 - a2)
    return math.degrees(math.acos(max(-1, min(1, c)))) * 3600


def line_lon(angle, ra_h, dec, gast_h, lat):
    mc = norm180((ra_h - gast_h) * 15)
    if angle == 'MC': return mc
    if angle == 'IC': return norm180(mc + 180)
    x = -math.tan(lat * D2R) * math.tan(dec * D2R)
    if x < -1 or x > 1: return None
    h0 = math.degrees(math.acos(x))
    return norm180(mc - h0 if angle == 'ASC' else mc + h0)


def gc_km(lat1, lon1, lat2, lon2):
    p1, p2 = lat1 * D2R, lat2 * D2R
    dl = norm180(lon2 - lon1) * D2R
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R_KM * math.asin(min(1, math.sqrt(a)))


def brute_distance(angle, ra_h, dec, gast_h, lat, lon):
    """Reference distance by dense sampling of the reference line (0.005° in latitude)."""
    if angle in ('MC', 'IC'):
        L = line_lon(angle, ra_h, dec, gast_h, 0)
        best = min(gc_km(lat, lon, p / 200, L) for p in range(-18000, 18001))
        return best
    # Sample the curve two ways: uniformly in latitude, and uniformly in the
    # hour-angle parameter H0 (dense where the curve runs east-west near its
    # polar tip, which latitude sampling misses).
    lim = 90 - abs(dec)
    best = float('inf')
    n = int(lim * 200)
    for i in range(-n, n + 1):
        phi = i / 200
        L = line_lon(angle, ra_h, dec, gast_h, phi)
        if L is not None:
            best = min(best, gc_km(lat, lon, phi, L))
    if abs(dec) > 1e-6:
        mc = norm180((ra_h - gast_h) * 15)
        for j in range(0, 36001):
            h0 = j / 200
            phi = math.degrees(math.atan(-math.cos(h0 * D2R) / math.tan(dec * D2R)))
            L = norm180(mc - h0 if angle == 'ASC' else mc + h0)
            best = min(best, gc_km(lat, lon, phi, L))
    return best


def stats(xs):
    xs = [x for x in xs if x is not None]
    xs_sorted = sorted(xs)
    p95 = xs_sorted[int(0.95 * (len(xs_sorted) - 1))]
    return f"{st.median(xs):.3g} | {p95:.3g} | {max(xs):.3g} | {len(xs)}"


rows_pos = {b: [] for b in BODIES}
rows_pos_swe = {b: [] for b in BODIES}
gast_diff_s, gast_diff_swe_s = [], []
line_km = {a: [] for a in ANGLES}
line_km_moon = {a: [] for a in ANGLES}
topo_alt_planets, topo_alt_moon, topo_ha_planets, topo_ha_moon = [], [], [], []
moon_parallax_lon_shift = []
limit_diff = []
dist_diff = []
display = []

for utc in cases['instants']:
    o = ours[utc]
    t = as_ut1(utc)
    ref_gast = t.gast
    gast_diff_s.append(abs((o['gastHours'] - ref_gast + 12) % 24 - 12) * 3600)
    gast_diff_swe_s.append(abs((o['gastHours'] - swe[utc]['gastHours'] + 12) % 24 - 12) * 3600)
    display.append(o['display'])
    ref_pos = {}
    for p in o['positions']:
        b = p['body']
        ra, dec, _ = earth.at(t).observe(eph[KEYS[b]]).apparent().radec(epoch='date')
        ref_pos[b] = (ra.hours, dec.degrees)
        rows_pos[b].append(sep_arcsec(p['raHours'], p['decDeg'], ra.hours, dec.degrees))
        s = swe[utc]['positions'][b]
        rows_pos_swe[b].append(sep_arcsec(p['raHours'], p['decDeg'], s['raHours'], s['decDeg']))
        # Polar limit: ours vs reference declination
        limit_diff.append(abs(o['limits'][b] - (90 - abs(dec.degrees))))

    # Line positions: ours vs the same geometry evaluated with reference inputs
    for b in BODIES:
        ra_r, dec_r = ref_pos[b]
        for a in ANGLES:
            for lat_s, lon_o in o['lines'][b][a].items():
                lat = float(lat_s)
                lon_r = line_lon(a, ra_r, dec_r, ref_gast, lat)
                if lon_o is None or lon_r is None:
                    continue
                km = abs(norm180(lon_o - lon_r)) * 111.32 * math.cos(lat * D2R)
                (line_km_moon if b == 'Moon' else line_km)[a].append(km)

    # Physical check with Skyfield topocentric observers placed ON our lines.
    for b in BODIES:
        for a in ANGLES:
            for lat in (-45, 0, 30, 60):
                lon = o['lines'][b][a].get(str(lat))
                if lon is None:
                    continue
                obs = earth + wgs84.latlon(lat, lon)
                app = obs.at(t).observe(eph[KEYS[b]]).apparent()
                alt, _, _ = app.altaz()
                ha, _, _ = app.hadec()
                if a in ('ASC', 'DSC'):
                    (topo_alt_moon if b == 'Moon' else topo_alt_planets).append(abs(alt.degrees))
                    if b == 'Moon':
                        # How far the Moon's line would move if drawn for a surface observer:
                        # longitude shift ≈ altitude error / (rate of altitude change per degree of longitude)
                        dec = ref_pos[b][1]
                        h = (ha.hours * 15)
                        dalt_dH = abs(math.cos(lat * D2R) * math.cos(dec * D2R) * math.sin(h * D2R)) or 1e-9
                        moon_parallax_lon_shift.append(abs(alt.degrees) / dalt_dH * 111.32 * math.cos(lat * D2R))
                else:
                    target = 0 if a == 'MC' else 12
                    err_deg = abs(((ha.hours - target + 12) % 24) - 12) * 15
                    (topo_ha_moon if b == 'Moon' else topo_ha_planets).append(err_deg * 111.32 * math.cos(lat * D2R))

# Distances: a sample of instants (brute force is slow)
for utc in cases['instants'][::8]:
    o = ours[utc]
    t = as_ut1(utc)
    for city in o['distances']:
        c = next(x for x in cases['cities'] if x['name'] == city['city'])
        for d in city['lines'][:8]:  # nearest 8 lines per city
            ra, dec, _ = earth.at(t).observe(eph[KEYS[d['body']]]).apparent().radec(epoch='date')
            ref = brute_distance(d['angle'], ra.hours, dec.degrees, t.gast, c['lat'], c['lon'])
            dist_diff.append((abs(d['km'] - ref), c['name'], d['body'], d['angle'], d['km'], ref))

n = len(cases['instants'])
print('# My Map — validation results\n')
print(f'Generated by `validation/compare.py`. {n} birth instants from 1901 to 2049 (60 random, 7 hand-picked), '
      f'{len(cases["latitudes"])} latitudes, {len(cases["cities"])} test cities.\n')
print('Scroll engine: astronomy-engine 2.1.19. Reference A: NASA JPL DE421 via Skyfield '
      f'{__import__("skyfield").__version__}. Reference B: {json.load(open(os.path.join(HERE, "out", "swe.json")))["reference"]}.\n')
print('Matching settings for all three: geocentric, apparent (light-time + aberration), true equator and equinox of date, '
      'Greenwich apparent sidereal time, geometric horizon (no refraction), and the birth instant read as UT1 '
      '(civil time was GMT/UT before 1972; since then UTC is within 0.9 s of UT1). Columns: median | 95th percentile | max | count.\n')

print('## 1. Planetary positions (arcseconds of sky)\n')
print('| Body | vs JPL DE421 | vs Swiss Ephemeris |\n|---|---|---|')
for b in BODIES:
    print(f'| {b} | {stats(rows_pos[b])} | {stats(rows_pos_swe[b])} |')
print(f'\nGreenwich apparent sidereal time, seconds of time: vs Skyfield {stats(gast_diff_s)}; vs Swiss Ephemeris {stats(gast_diff_swe_s)}.\n')

print('## 2. Line positions (km on the ground)\n')
print('Our line longitude vs the same line computed from the JPL reference positions, converted to km along the parallel.\n')
print('| Line | Planets, Sun | Moon |\n|---|---|---|')
for a in ANGLES:
    print(f'| {a} | {stats(line_km[a])} | {stats(line_km_moon[a])} |')

print('\n## 3. Physical check: a JPL observer standing on our lines\n')
print('Skyfield places a surface observer (WGS84) on our line and reports what they actually see. '
      'For planets this should be "on the horizon" (ASC/DSC) or "due south/north on the meridian" (MC/IC).\n')
print('| Check | Planets, Sun | Moon |\n|---|---|---|')
print(f'| ASC/DSC: altitude seen by observer (degrees) | {stats(topo_alt_planets)} | {stats(topo_alt_moon)} |')
print(f'| MC/IC: hour-angle error (km equivalent) | {stats(topo_ha_planets)} | {stats(topo_ha_moon)} |')
print(f'\nMoon: if the line were drawn for a surface observer instead of the Earth\'s centre, ASC/DSC lines would move by '
      f'{stats(moon_parallax_lon_shift)} km. This is lunar parallax (the Moon is close enough that the Earth\'s radius changes its apparent position by up to ~1°). '
      'Scroll uses the geocentric convention, which is standard for astrocartography; the difference is disclosed rather than corrected.\n')

print('## 4. Polar behaviour\n')
print(f'ASC/DSC lines stop at latitude 90° − |declination|. Our cut-off latitude vs the JPL-derived one (degrees): {stats(limit_diff)}. '
      'Beyond it the planet never rises or never sets, so there is no line; unit tests confirm ASC and DSC meet the MC/IC meridian exactly at the limit.\n')

print('## 5. Longitude wraparound (±180°)\n')
splits = sum(d['split'] for d in display)
print(f'Across {n} maps ({sum(d["features"] for d in display)} lines), {splits} lines crossed the antimeridian and were split. '
      f'Points outside (−180°, 180°]: {sum(d["outOfRange"] for d in display)}. Largest jump between consecutive points in any drawn segment: '
      f'{max(d["maxJump"] for d in display):.2f}° (anything ≤ 180° means no line was drawn the long way round the globe).\n')

print('## 6. City distances\n')
dd = [x[0] for x in dist_diff]
print(f'Our nearest-line distance vs brute-force distance to the JPL-derived line sampled every 0.005° of latitude and of hour angle, '
      f'8 cities incl. Suva/Apia (antimeridian), Tromsø/Longyearbyen (Arctic), {len(dd)} city–line pairs: '
      f'difference in km {stats(dd)}.\n')
worst = sorted(dist_diff, reverse=True)[:3]
signed = [x[4] - x[5] for x in dist_diff]
print(f'Signed (ours − reference), km: min {min(signed):.3f}, max {max(signed):.3f}. '
      'Positive would mean we over-state the distance.\n')
print('Largest differences: ' + '; '.join(f'{c} {b} {a}: ours {k:.1f} km vs ref {r:.1f} km' for _, c, b, a, k, r in worst) + '.\n')

tc = json.load(open(os.path.join(HERE, 'out', 'time-check.json')))
print('## 7. Local birth time → UTC\n')
print(f"{tc['total']:,} cases: 3,000 random (zone, local time) pairs 1900–2030 plus every 15 minutes within ±2 h of clock changes "
      f"in 400 random zone-years. Reference: {tc['reference']}, an independent implementation. Scroll: {tc['ours']}.\n")
print('| Reference says | Cases | Scroll agrees |\n|---|---|---|')
for k, v in tc['byStatus'].items():
    label = {'ok': 'one instant', 'ambiguous': 'ambiguous (clocks went back)', 'nonexistent': 'skipped (clocks went forward)'}[k]
    print(f"| {label} | {v['n']:,} | {v['agree']:,} |")
ni = tc['nodeIcu']
print(f"\nWhy Scroll ships its own zone table: with Node's built-in ICU zone data (tz {ni['tz']}), {ni['wrong']} of {ni['of']:,} "
      f"unambiguous cases would resolve to a different instant ({ni['wrongPre1970']} of them before 1970), because ICU omits IANA "
      'backzone history — e.g. Stockholm in 1947 gets Berlin\'s daylight saving (UTC+2) instead of Swedish time (UTC+1), '
      'which would move every line about 15°. The reference and Scroll share IANA source data, so this check validates the '
      'conversion logic (gaps, folds, offsets with seconds) rather than the historical records themselves.\n')
