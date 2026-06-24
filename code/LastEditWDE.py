# -*- coding: utf-8 -*-
"""Weather_Data_Extraction"""

import requests
import requests_cache
from retry_requests import retry
import json
from pathlib import Path

# Setup the requests client with cache and retry on error
# Try to use /tmp/ for Vercel serverless compatibility, fallback to local if /tmp doesn't exist
import os
cache_path = '/tmp/weather_cache' if os.path.exists('/tmp') else '.cache'
cache_session = requests_cache.CachedSession(cache_path, expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)

cities = [
    ("Cairo",      30.0444, 31.2357),
    ("Alexandria", 31.2001, 29.9187),
    ("Tanta",      30.7872, 31.0019),
    ("Giza",       30.0131, 31.2089),
    ("Mansoura",   31.0409, 31.3785),
    ("Hurghada",   27.2579, 33.8116),
    ("Aswan",      24.0889, 32.8998),
    ("Sohag",      26.5591, 31.6957),
    ("Damanhur",   31.0341, 30.4682),
    ("Port Said",  31.2653, 32.3019),
]

FORECAST_BASE_URL    = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

HOURLY_WEATHER = (
    "temperature_2m,"
    "apparent_temperature,"
    "relative_humidity_2m,"
    "dew_point_2m,"
    "wind_speed_10m,"
    "wind_direction_10m,"
    "surface_pressure,"
    "pressure_msl,"
    "visibility,"
    "uv_index"
)

HOURLY_AIR = (
    "us_aqi,"
    "european_aqi"
)

PAST_DAYS     = 31
FORECAST_DAYS = 1
TIMEOUT       = 15

lats = [city[1] for city in cities]
lons = [city[2] for city in cities]

# ── Batched Weather Request ──────────────────────────────────────────────────
weather_params = {
    "latitude":      lats,
    "longitude":     lons,
    "hourly":        HOURLY_WEATHER,
    "past_days":     PAST_DAYS,
    "forecast_days": FORECAST_DAYS,
}

print("Fetching batched weather data...")
weather_response = retry_session.get(FORECAST_BASE_URL, params=weather_params, timeout=TIMEOUT)
weather_response.raise_for_status()
weather_data_list = weather_response.json()
if not isinstance(weather_data_list, list):
    weather_data_list = [weather_data_list] # Fallback in case of 1 city

# ── Batched Air Quality Request ──────────────────────────────────────────────
air_params = {
    "latitude":      lats,
    "longitude":     lons,
    "hourly":        HOURLY_AIR,
    "past_days":     PAST_DAYS,
    "forecast_days": FORECAST_DAYS,
}

print("Fetching batched air quality data...")
air_response = retry_session.get(AIR_QUALITY_BASE_URL, params=air_params, timeout=TIMEOUT)
air_response.raise_for_status()
air_data_list = air_response.json()
if not isinstance(air_data_list, list):
    air_data_list = [air_data_list]

# ── Combine Data ─────────────────────────────────────────────────────────────
all_weather_data = []
for city_info, weather, air in zip(cities, weather_data_list, air_data_list):
    city_name = city_info[0]
    all_weather_data.append({
        "city":        city_name,
        "weather":     weather,
        "air_quality": air,
    })
    print(f"[{city_name}] Data Prepared Successfully")

print("\nAll cities processed.")

output_dir = Path(__file__).parent
output_path = output_dir / "raw_weather_LAST.json"

with open(output_path, "w") as file:
    json.dump(
        all_weather_data,
        file,
        indent=4
    )

print(f"Saved to {output_path}")
