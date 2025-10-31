AutoSpace 3D — Full App Scaffold
===============================

This scaffold provides a more complete starting point for the AutoSpace 3D Telegram Mini App.

Structure:
- frontend/  — React + Vite app with Three.js demo, Telegram WebApp init, touch swipe, GSAP animations
- backend/   — Express server with Postgres integration (node-postgres), basic endpoints
- migrations/ — SQL migrations to create users and cars tables
- docker-compose.yml — starts Postgres and backend
- openapi.yaml — API spec

Quick start (Linux / macOS):
1) Start services with Docker Compose:
   docker-compose up --build

   This will start Postgres (5432) and backend (3000).

2) Run frontend locally:
   cd frontend
   npm install
   npm run dev
   Open http://localhost:5173

3) Run migrations (once Postgres is up):
   psql postgresql://postgres:postgres@localhost:5432/autospace -f migrations/001_init.sql

Environment:
- Backend reads DATABASE_URL (default: postgres://postgres:postgres@db:5432/autospace)

Next steps I can do for you immediately:
- Add Telegram WebApp deep integration: pass auth data to backend, sign-in verification.
- Replace placeholder cars with GLB models and implement glTF lazy-loading from S3/CDN.
- Implement create-listing UI, upload to S3 (presigned URLs) and store metadata in Postgres.
- Add AI endpoints for price suggestion (OpenAI) and 3D-generation integration.
- Implement payments via Telegram Payments API + escrow flows.

If you want me to continue, tell me which features to implement next and I'll generate the code/assets/configs right here.

# Next Steps
- Implement AI endpoints
- Implement presigned upload for media
- Implement Telegram Payments API endpoint
- Replace placeholder 3D models with actual GLB assets
- Connect OpenAI API for price and description suggestions


# Demo Workflow
- Компонент CreateListing.jsx позволяет создавать объявление с AI подсказкой цены и описания, загружать медиа через presigned URL и сразу публиковать объявление.
- Импортируйте компонент в App.jsx и передайте prop apiBase = 'http://localhost:3000'
