# ScoutIQ

Personal Fantasy Premier League intelligence platform.

ScoutIQ helps you make better FPL decisions by combining your squad, player data, fixture analysis, point forecasts and transfer recommendations. ScoutIQ is recommendation-only: transfers are always made manually by the manager.

## Product modules

- **Dashboard** — team status, Gameweek overview and key signals
- **My Team** — FPL squad, budget, captain and player status
- **Transfer Intelligence** — five ranked transfer opportunities per Gameweek
- **Predictions** — player and team forecasts for the next 1, 5 and 10 matches
- **Fixtures & Analysis** — fixture difficulty, form, availability and underlying statistics

## Technology

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Recharts
- Lucide icons

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

Copy `.env.example` to `.env.local` when environment-specific configuration is introduced. Never commit secrets.

## Data

ScoutIQ plans to use the publicly accessible, undocumented Fantasy Premier League JSON API. API behavior can change; requests will be made server-side and handled defensively.

## Project status

Initial application foundation and minimal dashboard. FPL data integration, forecasts, transfer ranking, persistence and scheduled refresh are being implemented in stages.
