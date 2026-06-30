from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import pandas as pd
import json
import threading
import time
import asyncio
from fastapi.responses import StreamingResponse
from confluent_kafka import Consumer, KafkaError

app = FastAPI(title="Weather Data Engine API")

# Configure CORS so the frontend can fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global cache for real-time metrics
latest_metrics_cache = {}

@app.on_event("startup")
def startup_event():
    # Pre-populate cache from CSV
    try:
        df = get_metrics_df()
        for _, row in df.iterrows():
            city_data = row.to_dict()
            city = city_data['city']
            temp = city_data['avg_temperature_C']
            aqi = city_data['avg_USAQI']
            humidity = city_data.get('avg_humidity_percent', 50)
            min_temp = city_data.get('min_temperature_C', temp - 5)
            max_temp = city_data.get('max_temperature_C', temp + 5)
            
            temp_score = max(0, 100 - abs(temp - 22) * 5)
            aqi_score = max(0, 100 - aqi)
            comfort_score = int((temp_score * 0.7) + (aqi_score * 0.3))
            cdd = max(0, temp - 24)
            energy_warning = cdd > 5
            
            latest_metrics_cache[city] = {
                "city": city,
                "timestamp": str(pd.Timestamp.now()),
                "current_temperature": temp,
                "current_aqi": aqi,
                "current_humidity": humidity,
                "min_temperature": min_temp,
                "max_temperature": max_temp,
                "metrics": {
                    "comfort_score": comfort_score,
                    "cooling_degree_days": round(cdd, 2),
                    "energy_warning": energy_warning
                }
            }
    except Exception as e:
        print("Could not pre-populate cache:", e)

    def kafka_consumer_thread():
        conf = {
            'bootstrap.servers': 'localhost:9092',
            'group.id': 'fastapi-sse-group',
            'auto.offset.reset': 'latest'
        }
        try:
            consumer = Consumer(conf)
            consumer.subscribe(['processed-weather-data'])
            while True:
                msg = consumer.poll(1.0)
                if msg is None: continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF: continue
                    else: break
                
                try:
                    data = json.loads(msg.value().decode('utf-8'))
                    city = data.get('city')
                    if city:
                        latest_metrics_cache[city] = data
                except Exception:
                    pass
        except Exception as e:
            print("Kafka Consumer Error:", e)

    t = threading.Thread(target=kafka_consumer_thread, daemon=True)
    t.start()

base_dir = Path(__file__).resolve().parent
output_dir = base_dir / 'output'

def get_metrics_df():
    return pd.read_csv(output_dir / 'weather_metrics_LAST.csv')

def get_forecast_df():
    return pd.read_csv(output_dir / 'processed_weather_LAST.csv')

@app.get("/api/metrics")
def get_metrics():
    try:
        # Fallback REST endpoint matching the new real-time structure
        return list(latest_metrics_cache.values())
    except Exception as e:
        return {"error": str(e)}

async def event_generator():
    last_sent = {}
    while True:
        updates = []
        for city, data in latest_metrics_cache.items():
            if last_sent.get(city) != data.get('timestamp'):
                updates.append(data)
                last_sent[city] = data.get('timestamp')
        
        if updates:
            yield f"data: {json.dumps(updates)}\n\n"
            
        await asyncio.sleep(1)

@app.get("/api/stream/metrics")
async def stream_metrics():
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/forecast")
def get_forecast():
    try:
        df = get_forecast_df()
        return df.to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/optimal-time")
def get_optimal_time(city: str):
    try:
        df = get_forecast_df()
        city_df = df[df['city'].str.lower() == city.lower()]
        
        if city_df.empty:
            return {"error": "City not found."}
            
        # We only look at the first 24 hours available
        city_df = city_df.head(24)
        
        best_window = None
        best_score = float('inf') # Lower is better
        
        for i in range(len(city_df) - 1):
            h1 = city_df.iloc[i]
            h2 = city_df.iloc[i+1]
            
            avg_temp = (h1['temperature_°C'] + h2['temperature_°C']) / 2
            avg_uv = (h1['uv_index'] + h2['uv_index']) / 2
            
            # Penalty score: distance from 22°C + heavy penalty for high UV
            penalty = abs(avg_temp - 22) + (avg_uv * 3)
            
            if penalty < best_score:
                best_score = penalty
                best_window = f"{h1['hour']} - {h2['hour']}"
                
        if best_window:
            return {"city": city, "optimal_window": best_window, "message": f"The best time to go out in {city} tomorrow is between {best_window}."}
        return {"error": "Could not calculate optimal time."}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/summary")
def get_summary():
    try:
        df = get_metrics_df()
        if df.empty:
            return {"summary": "No data available."}
            
        hottest_row = df.loc[df['max_temperature_C'].idxmax()]
        coolest_row = df.loc[df['min_temperature_C'].idxmin()]
        worst_aqi_row = df.loc[df['avg_USAQI'].idxmax()]
        
        summary = (
            f"Meteorological Briefing: Today's extreme records show {hottest_row['city']} leading with a scorching "
            f"{hottest_row['max_temperature_C']}°C. Conversely, {coolest_row['city']} offers the coolest retreat at "
            f"{coolest_row['min_temperature_C']}°C. Please exercise caution in {worst_aqi_row['city']}, which currently "
            f"registers the highest air pollution levels (AQI {int(worst_aqi_row['avg_USAQI'])})."
        )
        return {"summary": summary}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/chat")
async def chat_oracle(request: dict):
    try:
        user_msg = request.get("message", "").lower()
        df = get_metrics_df()
        
        # Simple NLP Logic
        if "hottest" in user_msg or "hot" in user_msg:
            city = df.loc[df['max_temperature_C'].idxmax()]
            reply = f"The hottest city right now is {city['city']} at {city['max_temperature_C']}°C. Stay hydrated!"
        elif "safest" in user_msg or "safe" in user_msg or "best" in user_msg or "cool" in user_msg:
            city = df.loc[df['avg_USAQI'].idxmin()]
            reply = f"For the best air quality and a pleasant experience, I recommend {city['city']} with a remarkably low AQI of {city['avg_USAQI']}."
        elif "aswan" in user_msg:
            reply = "Aswan is currently experiencing intense heat. I advise wearing light clothing and avoiding direct sun between 12 PM and 4 PM."
        elif "alexandria" in user_msg:
            reply = "Alexandria has a pleasant coastal breeze, making it one of the better destinations today."
        else:
            reply = "I am the Weather Engine Oracle. You can ask me about the hottest city, the best place for air quality, or specific advice for cities like Aswan or Alexandria."
            
        return {"reply": reply}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/route-planner")
def route_planner(start: str, end: str):
    try:
        df = get_metrics_df()
        start_city = df[df['city'].str.lower() == start.lower()]
        end_city = df[df['city'].str.lower() == end.lower()]
        
        if start_city.empty or end_city.empty:
            return {"error": "City not found in the database."}
            
        start_data = start_city.iloc[0]
        end_data = end_city.iloc[0]
        
        temp_diff = end_data['avg_temperature_C'] - start_data['avg_temperature_C']
        
        advisory = f"You are traveling from {start_data['city']} ({start_data['avg_temperature_C']}°C) to {end_data['city']} ({end_data['avg_temperature_C']}°C). "
        
        if temp_diff > 5:
            advisory += "Warning: Expect a significant heat increase. Ensure your vehicle's AC is fully functional. "
        elif temp_diff < -5:
            advisory += "Note: You will experience a pleasant drop in temperature upon arrival. "
        else:
            advisory += "The temperature difference is minimal. "
            
        if end_data['avg_USAQI'] > 80:
            advisory += f"Also, be aware that air quality at your destination is concerning (AQI: {end_data['avg_USAQI']})."
            
        return {
            "start": start_data.to_dict(),
            "end": end_data.to_dict(),
            "advisory": advisory
        }
    except Exception as e:
        return {"error": str(e)}
