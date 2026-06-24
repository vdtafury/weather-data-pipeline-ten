# Importing necessary libraries
import pandas as pd
import json

# Function to read weather data from a JSON file
def read_weather_data(file_path):
    with open(file_path) as f:
        return json.load(f)

# Function to export a DataFrame to a CSV file
def export_to_csv(df, file_path):
    df.to_csv(file_path, index=False, encoding='utf-8', float_format='%.2f')

# Function to process raw weather data and convert it into a structured DataFrame
def process_weather_data(weather_data):
    rows = []
    # Iterate through each city's weather data
    for city_data in weather_data:
        # Extract relevant information for each city
        city = city_data['city']
        # Extract hourly weather
        weather_hourly = city_data['weather']['hourly']
        time = weather_hourly['time']
        temperature = weather_hourly['temperature_2m']
        apparent_temperature = weather_hourly['apparent_temperature']
        dew_point = weather_hourly['dew_point_2m']
        wind_speed = weather_hourly['wind_speed_10m']
        wind_direction = weather_hourly['wind_direction_10m']
        surface_pressure = weather_hourly['surface_pressure']
        pressure_msl = weather_hourly['pressure_msl']
        visibility = weather_hourly['visibility']
        uv_index = weather_hourly['uv_index']
        humidity = weather_hourly['relative_humidity_2m']
        # Extract hourly air quality data
        air_hourly = city_data['air_quality']['hourly']
        us_aqi = air_hourly['us_aqi']
        european_aqi = air_hourly['european_aqi']

        # Combine the extracted data into rows for the DataFrame
        for time, temp, hum, app_temp, dew_pt, wind_spd, wind_dir, surf_press, press_msl, vis, uv_idx, us_aqi_val, european_aqi_val in zip(time, temperature, humidity, apparent_temperature, dew_point, wind_speed, wind_direction, surface_pressure, pressure_msl, visibility, uv_index, us_aqi, european_aqi):
            # Append each row of data to the list
            rows.append({
                'city': city,
                'time': time,
                'temperature_°C': temp,
                'humidity_%': hum,
                'apparent_temperature_°C': app_temp,
                'dew_point_°C': dew_pt,
                'wind_speed_km/h': wind_spd,
                'wind_direction_°': wind_dir,
                'surface_pressure_hPa': surf_press,
                'pressure_msl_hPa': press_msl,
                'visibility_m': vis,
                'uv_index': uv_idx,
                'USAQI': us_aqi_val,
                'EUAQI': european_aqi_val
            })
    # Convert the list of rows into a DataFrame and return it
    return pd.DataFrame(rows)

# Function to extract date and hour from the time column in the DataFrame
def extract_date_and_hour(df):
    # Convert the 'time' column to datetime format
    df['datetime'] = pd.to_datetime(df['time'])
    df.drop(columns=['time'], inplace=True)
    # Extract date and hour from the datetime column
    df['date'] = df['datetime'].dt.date
    df['hour'] = df['datetime'].dt.time
    df.drop(columns=['datetime'], inplace=True)
    # Return the DataFrame in a specific order
    return df[['city', 'date', 'hour', 'temperature_°C', 'humidity_%', 'apparent_temperature_°C', 'dew_point_°C', 'wind_speed_km/h', 'wind_direction_°', 'surface_pressure_hPa', 'pressure_msl_hPa', 'visibility_m', 'uv_index', 'USAQI', 'EUAQI']]


# Main execution
if __name__ == "__main__":
    from pathlib import Path
    
    # Setup paths relative to the project root (parent of 'code' dir)
    base_dir = Path(__file__).resolve().parent.parent
    code_dir = base_dir / 'code'
    output_dir = base_dir / 'output'
    
    # Read the raw weather data from the JSON file
    weather_data = read_weather_data(code_dir / 'raw_weather_LAST.json')
    # Process the weather data
    df = process_weather_data(weather_data)
    # Extract date and hour from the time column
    df = extract_date_and_hour(df)
    # Export the processed data to a CSV file
    export_to_csv(df, output_dir / 'processed_weather_LAST.csv')
    # Metrics Calculation
    df_metrics = df.groupby('city').agg(
        min_temperature_C = ('temperature_°C', 'min'),
        max_temperature_C = ('temperature_°C', 'max'),
        avg_temperature_C = ('temperature_°C', 'mean'),
        min_humidity_percent = ('humidity_%', 'min'),
        max_humidity_percent = ('humidity_%', 'max'),
        avg_humidity_percent = ('humidity_%', 'mean'),
        avg_visibility_m = ('visibility_m', 'mean'),
        avg_wind_speed_kmh = ('wind_speed_km/h', 'mean'),
        avg_uv_index = ('uv_index', 'mean'),
        avg_USAQI = ('USAQI', 'mean'),
        avg_EUAQI = ('EUAQI', 'mean')
    ).reset_index()
    # Export the metrics to a CSV file
    export_to_csv(df_metrics, output_dir / 'weather_metrics_LAST.csv')