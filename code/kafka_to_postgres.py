# -*- coding: utf-8 -*-
"""Kafka to PostgreSQL Sink (Phase 3)"""

import json
import psycopg2
from confluent_kafka import Consumer, KafkaError, KafkaException

# Configuration
KAFKA_BROKER = 'localhost:9092'
PROCESSED_TOPIC = 'processed-weather-data'

DB_CONFIG = {
    'dbname': 'weather_engine',
    'user': 'admin',
    'password': 'adminpassword',
    'host': 'localhost',
    'port': '5432'
}

def setup_database():
    """ Connect to DB and create table if it doesn't exist """
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Create table to store the processed metrics
        cur.execute('''
            CREATE TABLE IF NOT EXISTS weather_metrics (
                id SERIAL PRIMARY KEY,
                city VARCHAR(100),
                timestamp TIMESTAMP,
                temperature_c FLOAT,
                aqi FLOAT,
                comfort_score INT,
                cdd FLOAT,
                energy_warning BOOLEAN
            )
        ''')
        conn.commit()
        print("Database connected and table ready.")
        return conn, cur
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None, None

def run_db_sink():
    # Setup DB
    conn, cur = setup_database()
    if not conn:
        return

    # Setup Kafka Consumer
    consumer_conf = {
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': 'postgres-sink-group',
        'auto.offset.reset': 'earliest'
    }
    consumer = Consumer(consumer_conf)
    consumer.subscribe([PROCESSED_TOPIC])
    
    print(f"Database Sink started. Listening to '{PROCESSED_TOPIC}'...")

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    raise KafkaException(msg.error())

            # Parse message
            data = json.loads(msg.value().decode('utf-8'))
            
            # Insert into PostgreSQL
            insert_query = """
                INSERT INTO weather_metrics (city, timestamp, temperature_c, aqi, comfort_score, cdd, energy_warning)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cur.execute(insert_query, (
                data['city'],
                data['timestamp'],
                data['current_temperature'],
                data['current_aqi'],
                data['metrics']['comfort_score'],
                data['metrics']['cooling_degree_days'],
                data['metrics']['energy_warning']
            ))
            conn.commit()
            
            print(f"Inserted into DB: {data['city']} at {data['timestamp']}")

    except KeyboardInterrupt:
        print("Sink stopped manually.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        consumer.close()
        cur.close()
        conn.close()
        print("Connections closed.")

if __name__ == "__main__":
    run_db_sink()
