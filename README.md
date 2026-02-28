# Descobre Saude

SulAmerica Coverage Explorer - A full-stack application for browsing SulAmerica health insurance plans, TUSS procedure codes, and finding providers.

## Architecture

```
descobre-saude/
  frontend (React + TypeScript + Vite + Tailwind CSS)
  backend/ (FastAPI + SQLAlchemy + PostgreSQL)
  scraper/ (Selenium headless + APScheduler)
  docker-compose.yml (orchestrates all services)
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 5173 | React SPA with plan browser, TUSS search, and provider finder |
| **Backend** | 8000 | FastAPI REST API serving products, TUSS codes, and filter options |
| **Database** | 5432 | PostgreSQL 16 storing all plan and TUSS data |
| **Scraper** | - | Headless Selenium scraper running on a 24h schedule |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List products (paginated, filterable) |
| GET | `/api/products/{id}` | Get single product |
| GET | `/api/tuss` | List TUSS codes (paginated, searchable) |
| GET | `/api/tuss/{code}` | Get single TUSS code |
| GET | `/api/stats` | Summary statistics |
| GET | `/api/filters/product-codes` | Distinct product codes |
| GET | `/api/filters/plan-names` | Distinct plan names |
| GET | `/api/filters/segments` | Distinct segments |
| GET | `/api/filters/classifications` | Distinct classifications |
| GET | `/api/filters/statuses` | Distinct statuses |

## Quick Start

### Using Docker Compose (recommended)

```bash
docker compose up --build
```

This starts all services:
- Frontend at http://localhost:5173
- Backend API at http://localhost:8000
- PostgreSQL at localhost:5432
- Scraper runs on a 24h schedule

The backend automatically seeds the database with existing product and TUSS data on first startup.

### Frontend Only (development)

```bash
npm install
npm run dev
```

### Backend Only (development)

```bash
cd backend
pip install -r requirements.txt
# Set DATABASE_URL environment variable
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://descobre:descobre@db:5432/descobre_saude` | PostgreSQL connection string |

### Scraper

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://descobre:descobre@db:5432/descobre_saude` | PostgreSQL connection string |
| `SCRAPE_INTERVAL_HOURS` | `24` | Hours between scraper runs |

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4, Lucide React
- **Backend**: FastAPI, SQLAlchemy 2, Alembic, Pydantic v2
- **Database**: PostgreSQL 16
- **Scraper**: Selenium (headless Chrome), APScheduler
- **Infrastructure**: Docker, Docker Compose

## Data Sources

- Product/plan data from SulAmerica public portal
- TUSS procedure codes (TABELA TUSS)
- Provider search links to SulAmerica referral network
