"""Generate the validation case set (deterministic).

    python3 validation/make-cases.py
"""
import json, random, os
from datetime import datetime, timedelta, timezone

random.seed(20261022)
start = datetime(1901, 1, 1, tzinfo=timezone.utc)
span = (datetime(2049, 12, 31, tzinfo=timezone.utc) - start).total_seconds()

instants = []
for _ in range(60):
    t = start + timedelta(seconds=random.random() * span)
    instants.append(t.replace(microsecond=0).isoformat().replace('+00:00', 'Z'))

# Hand-picked: J2000.0, a solstice, near a major lunar standstill (Moon |dec| ~28.5°),
# and instants where the Sun's MC sits on the antimeridian.
instants += [
    '2000-01-01T12:00:00Z',
    '1988-06-21T03:57:00Z',
    '2006-09-15T00:00:00Z',
    '2025-01-12T00:00:00Z',
    '1990-07-04T18:30:00Z',
    '2021-11-07T05:30:00Z',
    '2021-11-07T06:30:00Z',
]
instants = sorted(set(instants))

cities = [
    {'name': 'New York City', 'lat': 40.71427, 'lon': -74.00597},
    {'name': 'London', 'lat': 51.50853, 'lon': -0.12574},
    {'name': 'Suva (near 180°)', 'lat': -18.14161, 'lon': 178.44149},
    {'name': 'Apia (west of 180°)', 'lat': -13.83333, 'lon': -171.76666},
    {'name': 'Tromsø (69.6°N)', 'lat': 69.6489, 'lon': 18.95508},
    {'name': 'Longyearbyen (78.2°N)', 'lat': 78.22334, 'lon': 15.64689},
    {'name': 'Ushuaia (54.8°S)', 'lat': -54.81084, 'lon': -68.31591},
    {'name': 'Quito (equator)', 'lat': -0.22985, 'lon': -78.52495},
]

latitudes = [-80, -70, -66, -60, -45, -30, -15, 0, 15, 30, 45, 60, 66, 70, 80]

here = os.path.dirname(os.path.abspath(__file__))
json.dump({'instants': instants, 'cities': cities, 'latitudes': latitudes},
          open(os.path.join(here, 'cases.json'), 'w'), indent=1)
print(len(instants), 'instants')
