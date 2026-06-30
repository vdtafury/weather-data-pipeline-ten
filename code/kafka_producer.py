# -*- coding: utf-8 -*-
"""Kafka Producer for Weather Data Engine"""

import time
import json
import requests
from confluent_kafka import Producer
from datetime import datetime

# Kafka Configuration
KAFKA_BROKER = 'localhost:9092'
KAFKA_TOPIC = 'raw-weather-data'

# Producer configuration
conf = {
    'bootstrap.servers': KAFKA_BROKER,
    'client.id': 'weather-producer'
}
producer = Producer(conf)

# Open-Meteo configuration
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
    "temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,"
    "wind_speed_10m,wind_direction_10m,surface_pressure,pressure_msl,visibility,uv_index"
)
HOURLY_AIR = "us_aqi,european_aqi"

lats = [city[1] for city in cities]
lons = [city[2] for city in cities]

def delivery_report(err, msg):
    """ Called once for each message produced to indicate delivery result.
        Triggered by poll() or flush(). """
    if err is not None:
        print(f'Message delivery failed: {err}')
    else:
        print(f'Message delivered to {msg.topic()} [{msg.partition()}]')

def fetch_and_produce():
    weather_params = {
        "latitude": lats, "longitude": lons,
        "hourly": HOURLY_WEATHER, "past_days": 1, "forecast_days": 1,
    }
    air_params = {
        "latitude": lats, "longitude": lons,
        "hourly": HOURLY_AIR, "past_days": 1, "forecast_days": 1,
    }

    try:
        print(f"[{datetime.now()}] Fetching batched weather data...")
        w_res = requests.get(FORECAST_BASE_URL, params=weather_params, timeout=15)
        w_res.raise_for_status()
        w_data = w_res.json()
        if not isinstance(w_data, list): w_data = [w_data]

        print(f"[{datetime.now()}] Fetching batched air quality data...")
        a_res = requests.get(AIR_QUALITY_BASE_URL, params=air_params, timeout=15)
        a_res.raise_for_status()
        a_data = a_res.json()
        if not isinstance(a_data, list): a_data = [a_data]

        # Combine and send to Kafka
        for city_info, weather, air in zip(cities, w_data, a_data):
            city_name = city_info[0]
            payload = {
                "city": city_name,
                "timestamp": str(datetime.now()),
                "weather": weather,
                "air_quality": air,
            }
            
            # Produce message
            producer.produce(
                KAFKA_TOPIC, 
                key=city_name.encode('utf-8'),
                value=json.dumps(payload).encode('utf-8'), 
                callback=delivery_report
            )
            
        # Wait for any outstanding messages to be delivered and delivery report callbacks to be triggered.
        producer.poll(0)
        producer.flush()
        print(f"[{datetime.now()}] Data successfully sent to Kafka topic '{KAFKA_TOPIC}'")

    except Exception as e:
        print(f"Error occurred during fetch or produce: {e}")

if __name__ == "__main__":
    print("Starting Kafka Producer Service...")
    while True:
        fetch_and_produce()
        print("Sleeping for 60 seconds...\n")
        time.sleep(60) # Fetch data every 60 seconds for streaming simulation
