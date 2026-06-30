# -*- coding: utf-8 -*-
"""Kafka Stream Processor (Consumer & Producer) for Weather Data Engine"""

import json
from confluent_kafka import Consumer, Producer, KafkaError, KafkaException
from datetime import datetime

# Kafka Configuration
KAFKA_BROKER = 'localhost:9092'
RAW_TOPIC = 'raw-weather-data'
PROCESSED_TOPIC = 'processed-weather-data'

# Consumer Configuration
consumer_conf = {
    'bootstrap.servers': KAFKA_BROKER,
    'group.id': 'weather-etl-group',
    'auto.offset.reset': 'earliest' # Start reading from the beginning of the topic if no offset is found
}
consumer = Consumer(consumer_conf)

# Producer Configuration
producer_conf = {
    'bootstrap.servers': KAFKA_BROKER,
    'client.id': 'weather-stream-processor'
}
producer = Producer(producer_conf)

def delivery_report(err, msg):
    """ Callback for processed data delivery """
    if err is not None:
        print(f'Failed to deliver processed message: {err}')

def process_stream():
    consumer.subscribe([RAW_TOPIC])
    print(f"[{datetime.now()}] Stream Processor started. Listening to '{RAW_TOPIC}'...")

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue # End of partition event
                else:
                    raise KafkaException(msg.error())

            # 1. Extract Data
            raw_data = json.loads(msg.value().decode('utf-8'))
            city = raw_data['city']
            
            # Extract current hour data (for real-time metrics)
            # Assuming the first index [0] is the current hour
            current_temp = raw_data['weather']['hourly']['temperature_2m'][0]
            current_aqi = raw_data['air_quality']['hourly']['us_aqi'][0]
            current_humidity = raw_data['weather']['hourly']['relative_humidity_2m'][0]
            
            # Extract daily extremes (assuming the array contains today's forecast)
            min_temp = min(raw_data['weather']['hourly']['temperature_2m'])
            max_temp = max(raw_data['weather']['hourly']['temperature_2m'])

            # 2. Transform (ETL Logic)
            # Comfort Score Calculation (Similar to what was in API.py, but REAL-TIME)
            temp_score = max(0, 100 - abs(current_temp - 22) * 5)
            aqi_score = max(0, 100 - current_aqi)
            comfort_score = int((temp_score * 0.7) + (aqi_score * 0.3))
            
            # Energy Load Warning (Cooling Degree Days)
            cdd = max(0, current_temp - 24)
            energy_warning = cdd > 5 

            # Create processed payload
            processed_data = {
                "city": city,
                "timestamp": str(datetime.now()),
                "current_temperature": current_temp,
                "current_aqi": current_aqi,
                "current_humidity": current_humidity,
                "min_temperature": min_temp,
                "max_temperature": max_temp,
                "metrics": {
                    "comfort_score": comfort_score,
                    "cooling_degree_days": round(cdd, 2),
                    "energy_warning": energy_warning
                }
            }

            # 3. Load (Produce to new topic)
            producer.produce(
                PROCESSED_TOPIC,
                key=city.encode('utf-8'),
                value=json.dumps(processed_data).encode('utf-8'),
                callback=delivery_report
            )
            producer.poll(0)

            print(f"[{datetime.now()}] Processed & Forwarded data for: {city} | Temp: {current_temp}°C | AQI: {current_aqi} | Comfort: {comfort_score}/100")

    except KeyboardInterrupt:
        print("Stream Processor stopped manually.")
    finally:
        # Clean up
        consumer.close()
        producer.flush()
        print("Consumer closed gracefully.")

if __name__ == "__main__":
    process_stream()
