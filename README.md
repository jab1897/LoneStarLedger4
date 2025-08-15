# LoneStarLedger

LoneStarLedger is a data driven transparency site for Texas school finance and accountability, inspired by Transparency USA. Phase one focuses on K 12 with plans to add higher ed and local governments.

## Core features

- Searchable data summaries
- Tables for finance breakdowns
- Charts for spending visuals
- Interactive map of districts and campuses with a drawer for details

Data highlights
- District level: spending in four categories, per pupil spending and debt, aggregate spending and debt
- Campus level: on grade level reading and math, teacher salaries

Future
- Accountability ratings and other metrics
- Basic user signup for newsletter

## Tech choices

- Frontend: Vite plus React plus JavaScript on Vercel
  TanStack React Table, Recharts, React Leaflet, React Select
  Theme: royal blue #003366 and gold #FFD700

- Backend: FastAPI on Render
  JSON data served from endpoints with CORS enabled
  Initial data stored as JSON and GeoJSON in /data

- Data pipeline: Google Colab notebooks to transform TEA CSVs into JSON and GeoJSON

## Project layout

/frontend   Vite React app
/backend    FastAPI app
/data       JSON and GeoJSON with mock data for prototyping
/notebooks  Colab ETL
/scripts    helper scripts

## Environment variables

- VITE_BACKEND_URL used by the frontend
- CORS_ORIGINS used by the backend
- DATABASE_URL reserved for future

## Phase plan

1. Repo and architecture setup
2. Backend build with FastAPI endpoints
3. Backend deployment on Render with CORS verified
4. Frontend build with search, tables, charts, map, and drawer
5. Frontend deployment on Vercel with SPA routing
6. Data pipeline in Colab for CSV to JSON or GeoJSON
7. Enhancements and newsletter signup
8. Final integration and debugging with basic SEO
