# RallyBritishClubAPI

Static backend for the Rally British Club apps: no server, just files read directly from GitHub
via `raw.githubusercontent.com/felipefreitassilva/RallyBritishClubAPI/refs/heads/<branch>/<file>`.
Both `rallybritishclub` (the judges' mobile app) and `RallyBritishClubWeb` (the results site)
fetch from here. Everything user-facing, templates included, is handled by
`RallyBritishClubWeb`; this repo is just the data those apps read.

[Privacy Policy](privacypolicy.html), served over GitHub Pages for app store compliance.

## Branches

- `develop`: generic templates for the files below. Placeholder data only, never a real event's
  data.
- `Rally67`, `Rally68`, `Rally69`, ...: one branch per event, with that year's real data. Apps
  read from whichever branch is the current event (see `config/remoteURLs.ts` in
  `rallybritishclub`, `src/api/index.ts` in `RallyBritishClubWeb`).

## Files

| File | Format | Notes |
| --- | --- | --- |
| `carros.csv` | `Numero,Motorista,Navegador,Modelo,Cor` | `Modelo`/`Cor` may be blank. |
| `carDetailOptions.json` | `{ showId, showModel, showPeople, showTimePassed }` (booleans) | Controls which car fields the judges' app displays. |
| `horaSaidaIda.txt` / `horaSaidaVolta.txt` | Single line, ISO 8601 UTC (`2000-01-01T08:00:00.000Z`) | Reference start time for car #0 on that leg, **not** the first real car. Each car departs this time plus its own car number in minutes (car 4 departs 4 minutes after this value). |
| `juizesIda.csv` / `juizesVolta.csv` | Headerless; one ciphered hex token per line | Each token decodes to a `Posto,Nome,Tempo Posto` row. Two judges at the same station = two lines on the same post number (the apps merge their names with `&`). The **whole row** is ciphered, not just the time — see below. |
| `resultados/rally_bc_resultados_ida.csv` / `_volta.csv` / `_geral.csv` | Same format `RallyBritishClubWeb` exports from Resultados Ida/Volta/Gerais | Optional, admin-published, kept in their own `resultados/` folder so they don't mix with the input files above. Their mere presence on an event branch is what makes `/Resultados` show that tab publicly for that event; add each once results are final and the organization has signed off. `/Resultados` also lets visitors pick past events, reading these same files straight off each event's branch, so they stay in place after the event is over instead of being replaced. |

### The judges cipher

`juizesIda.csv` / `juizesVolta.csv` never contain plaintext. The file is **headerless**; each
line is a hex token that decodes to one `Posto,Nome,Tempo Posto` row — post number, judge name,
and the station time for car #0, all ciphered together.

The key is a per-event **organizer passphrase** ("Senha Organização"), chosen by the
organization and never committed here. It is combined with fixed public parameters
(`DH_P` / `DH_G` / `DH_A`, a Diffie–Hellman-style triple kept identical in
`RallyBritishClubWeb/src/api/cipher.ts` and `rallybritishclub/config/ciphers.ts`) into a
keystream that XORs each row; the round-trip is `rowCipher` / `rowDecipher` in
`RallyBritishClubWeb/src/api/dates.ts` and `rallybritishclub/config/dates.ts`.

`RallyBritishClubWeb`'s "Juízes Ida" / "Juízes Volta" pages produce the file: organizers type
plaintext rows plus the passphrase and hit *Exportar cifrado*; that headerless ciphered export
is what gets committed here. Reading the data back — real names and times on *Resultados*, or a
judge's briefing window in the mobile app — needs the same passphrase (the mobile app takes it
as part of the "magic number", `posto<separator><passphrase>`).

Without the passphrase nobody decodes the schedule, including a developer holding all three
repos. It is deliberately weak (small `DH_P`): enough to stop accidental exposure and let a
developer demo the production flow without seeing real data, not a vault. An empty passphrase
yields a nameless 10-post placeholder roster.

## Publishing a new event

1. Branch from `develop`, named after the event (e.g. `Rally69`).
2. Replace the template files with the event's real data. Organizers hand you `carros.csv` and
   `horaSaidaIda.txt`/`horaSaidaVolta.txt` (as-is) and `juizesIda.csv`/`juizesVolta.csv` (already
   ciphered with that event's passphrase) via `RallyBritishClubWeb`'s Carros/Geral/Juízes pages.
   `carDetailOptions.json` isn't
   organizer-managed, update it yourself if the judges' app's displayed car fields need to
   change.
3. Point `rallybritishclub` (`config/remoteURLs.ts`) and `RallyBritishClubWeb`
   (`src/api/index.ts`, `CURRENT_EVENT`) at that branch. In `RallyBritishClubWeb`, also move the
   previous event's branch name into `PAST_EVENTS` in `src/PublicResultsApp.tsx`, so `/Resultados`
   keeps showing it as a past event once the new one takes over.
4. If the templates themselves change, bring that change back to `develop`. The event branch
   otherwise keeps the real data, not `develop`.
