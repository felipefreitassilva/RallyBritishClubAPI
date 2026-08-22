# RallyBritishClubAPI
Simple API to validate stopwatchs' times and host files

[Privacy Policy](privacypolicy.html)

## Files

- [Carros](carros.csv)
- [Juízes Ida](juizesIda.csv)
- [Juízes Volta](juizesVolta.csv)
- [Hora Saida Ida](horaSaidaIda.txt)
- [Hora Saida Volta](horaSaidaVolta.txt)
- [Detalhes dos Carros](carDetailOptions.json)

## Publishing a new event

`develop` holds generic templates for the files above (see `index.html`, the GitHub Pages
landing page organizers are pointed to for the plain-language version of this). Each event has
its own branch with the real data for that year (`Rally67`, `Rally68`, `Rally69`, ...).

1. Branch from `develop`, named after the event (e.g. `Rally69`).
2. Replace the template files with the event's real data (cars, judges, start times) — the
   organizers will hand these to you filled in (`carros.csv`, `carDetailOptions.json`,
   `horaSaidaIda.txt`/`horaSaidaVolta.txt` as-is, `juizesIda.csv`/`juizesVolta.csv` already
   ciphered via the results site's "Modelos" tool).
3. Point `rallybritishclub` (`config/remoteURLs.ts`) and `RallyBritishClubWeb`
   (`src/api/index.ts`) at that branch.
4. If the templates themselves change, bring that change back to `develop` — the event branch
   otherwise keeps the real data, not `develop`.
