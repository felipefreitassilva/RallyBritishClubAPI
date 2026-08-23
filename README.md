# RallyBritishClubAPI

Static backend for the Rally British Club apps: no server, just files read directly from GitHub
via `raw.githubusercontent.com/felipefreitassilva/RallyBritishClubAPI/refs/heads/<branch>/<file>`.
Both `rallybritishclub` (the judges' mobile app) and `RallyBritishClubWeb` (the results site)
fetch from here. Everything user-facing — templates included — is handled by
`RallyBritishClubWeb`; this repo is just the data those apps read.

[Privacy Policy](privacypolicy.html) — served over GitHub Pages for app store compliance.

## Branches

- `develop` — generic templates for the files below. Placeholder data only, never a real event's
  data.
- `Rally67`, `Rally68`, `Rally69`, ... — one branch per event, with that year's real data. Apps
  read from whichever branch is the current event (see `config/remoteURLs.ts` in
  `rallybritishclub`, `src/api/index.ts` in `RallyBritishClubWeb`).

## Files

| File | Format | Notes |
| --- | --- | --- |
| `carros.csv` | `Numero,Motorista,Navegador,Modelo,Cor` | `Modelo`/`Cor` may be blank. |
| `carDetailOptions.json` | `{ showId, showModel, showPeople, showTimePassed }` (booleans) | Controls which car fields the judges' app displays. |
| `horaSaidaIda.txt` / `horaSaidaVolta.txt` | Single line, ISO 8601 UTC (`2000-01-01T08:00:00.000Z`) | Reference start time for car #0 on that leg, **not** the first real car — each car departs this time plus its own car number in minutes (car 4 departs 4 minutes after this value). |
| `juizesIda.csv` / `juizesVolta.csv` | `Posto,Nome,Tempo Posto` | One row per judge; two judges at the same station share a row with `Nome` joined by `&`. `Tempo Posto` is **not** plaintext — see below. |

### The `Tempo Posto` cipher

The station time in `juizesIda.csv`/`juizesVolta.csv` is a simple per-character substitution
cipher (table in `config/ciphers.ts` in `rallybritishclub`, `src/api/cipher.ts` in
`RallyBritishClubWeb`, `cipherDates.py` at the root of `rallybritishclub` for a manual CLI
version), not the plaintext `hh:mm:ss` time. `RallyBritishClubWeb`'s "Juízes Ida"/"Juízes Volta"
pages produce this file: organizers fill in plaintext times there and export the ciphered
version, which is what gets committed here.

## Publishing a new event

1. Branch from `develop`, named after the event (e.g. `Rally69`).
2. Replace the template files with the event's real data. Organizers hand you `carros.csv` and
   `horaSaidaIda.txt`/`horaSaidaVolta.txt` (as-is) and `juizesIda.csv`/`juizesVolta.csv` (already
   ciphered) via `RallyBritishClubWeb`'s Carros/Geral/Juízes pages. `carDetailOptions.json` isn't
   organizer-managed — update it yourself if the judges' app's displayed car fields need to
   change.
3. Point `rallybritishclub` (`config/remoteURLs.ts`) and `RallyBritishClubWeb`
   (`src/api/index.ts`) at that branch.
4. If the templates themselves change, bring that change back to `develop` — the event branch
   otherwise keeps the real data, not `develop`.
