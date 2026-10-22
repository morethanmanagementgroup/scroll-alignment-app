# My Map validation

Reproduces `RESULTS.md`. Nothing here is part of the deployed app.

```bash
pip install skyfield skyfield-data          # NASA JPL DE421 reference
npm i --no-save sweph@2.10.3-7              # Swiss Ephemeris reference (AGPL; validation only, never shipped)
python3 validation/make-cases.py            # writes cases.json (deterministic)
mkdir -p validation/out
npx tsx validation/engine-dump.ts > validation/out/engine.json
node validation/swe-dump.js > validation/out/swe.json
python3 validation/time-cases.py            # time-zone reference answers (Python zoneinfo)
npx tsx validation/time-check.ts
python3 validation/compare.py > validation/RESULTS.md
npm test                                    # unit tests (time + geometry)
```
