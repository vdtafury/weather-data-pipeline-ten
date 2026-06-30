# Weather Data Engine & Dashboard (Enterprise Streaming Edition)

A massive, premium, multi-page application for extracting, processing, and visualizing meteorological and air quality data for 10 Egyptian cities. Built with a robust **FastAPI backend**, a real-time **Apache Kafka Data Pipeline**, and a cinematic **React + Vite frontend** powered by GSAP, Framer Motion, and tsParticles.

---

## 🌟 The Legendary Upgrades (V2.0)
- **Interactive Command Map:** Upgraded from a simple SVG to a fully interactive, real-world geographical map powered by `react-leaflet` and `CartoDB Dark Matter` tiles. Features zooming, panning, glowing telemetry beacons, and smooth mouse-tracking tooltips for a true "Command Center" feel.
- **AI Weather Oracle:** A floating Chatbot (`lucide-react`) that analyzes live data via custom NLP endpoints to answer natural language questions about heatwaves, air quality, and travel safety.
- **Smart Travel Planner:** A dedicated route planning system. Select origin and destination cities to generate a live Travel Advisory based on temperature gradients and AQI levels.
- **Dynamic Weather Backgrounds:** City profiles now feature live particle systems (`tsparticles`). You will see golden fireflies for intense heat, and calm mist for humid conditions, reacting strictly to real-time data!

---

## 🌍 Angle 1: Public Health & Society
- **The Problem:** Climate change and pollution in Egypt impact daily life and public health. Accurate meteorological data is scattered and complex, leaving citizens without a unified platform that provides clear, real-time alerts for heatwaves and air quality hazards.
- **The Solution:** A comprehensive "Weather Data Engine" that automatically extracts complex satellite data, cleans it, and presents it in an eye-friendly interactive dashboard. This empowers citizens to make quick decisions, such as avoiding travel to certain cities due to severe heat or poor air quality.

## 💼 Angle 2: Data Engineering & Business
- **The Problem:** Businesses in agriculture, logistics, and renewable energy struggle to obtain aggregated, analysis-ready climate reports. Extracting raw JSON data from APIs wastes time and resources, and manual cleaning delays critical decision-making.
- **The Solution:** An automated ETL Pipeline. The system batches requests to accelerate performance, pulls thousands of data points, transforms them via Pandas into ready-to-use metrics, and streams them through a FastAPI backend to feed decision-makers' screens instantly, with zero manual intervention.

---

## Project Architecture (V3 Enterprise Streaming)

We have upgraded from a static batch-processing script to a massive **Real-Time Data Engineering Architecture**.

### 1. Real-Time Data Pipeline (ETL via Kafka)
- **`code/kafka_producer.py` (Ingestion):** A continuous script that fetches live API data every 60 seconds and streams it to the `raw-weather-data` Kafka topic.
- **`code/kafka_consumer.py` (Stream Processor):** Listens to raw data, calculates Comfort Scores & Energy Load warnings in real-time, and pushes results to the `processed-weather-data` topic.
- **`docker-compose.yml`:** Orchestrates the Kafka Broker, Zookeeper, and AKHQ (Web UI for Kafka on port 8080).
- **PostgreSQL (Upcoming Phase 3):** A TimescaleDB/PostgreSQL database to store the processed stream for blazing-fast API queries.

### 2. Smart Backend (FastAPI)
- `api.py`: A robust REST API built with **FastAPI**. Includes Smart Operations:
  - `/api/summary`: AI-generated text briefings based on live data.
  - `/api/optimal-time`: Algorithm to find the best 2-hour window for outdoor activities.
  - Comfort Scores & Energy Load (CDD) Warnings.

### 3. Massive React Frontend (`frontend-react/`)
- A multi-page SPA built with **Vite + React**.
- **Pages:** Cinematic Home (`/`), Central Dashboard (`/dashboard`), Cities Archive (`/cities`), and Deep Dive Profiles (`/city/:name`).
- Features ultra-premium "Dark Glassmorphism" UI, **Framer Motion** page transitions, and **GSAP** parallax effects.

---

## Setup & Running Instructions

### 1. Unified Local Execution (One-Click Start)
We have simplified the deployment! The root directory now contains a `package.json` configured with `concurrently` to launch both the FastAPI backend and the React frontend simultaneously in a single terminal.

Make sure Python dependencies are installed (`pip install -r requirements.txt`) and Node dependencies are installed (`npm run install:all`).

Then, from the root project directory, run:
```bash
npm run dev
```

This single command will spin up:
- The Backend on `http://localhost:8000`
- The Frontend on `http://localhost:5173`

### 3. Experience the App
Open `http://localhost:5173` in your browser.
