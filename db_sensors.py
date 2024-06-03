from datetime import datetime
from db_client import db
collection = db['Measured values']

def get_sensor_data_by_filter(filter):
    matches = {
        '$match': filter
    }
    sort = { "$sort": { "timestamp": 1 } }
    pipeline = [matches, sort]
    documentList = []
    results = collection.aggregate(pipeline)
    for x in results:
        documentList.append(x)
    return documentList

def get_sensor_data_by_hpa_range(start_pressure, end_pressure):
    filter = {
        '$and': [
            {"pressure": {"$gte": start_pressure, "$lte": end_pressure}}
        ]
    }
    return get_sensor_data_by_filter(filter)

def get_sensor_data_by_temperature_range(start_temperature, end_temperature):
    filter = {
        '$and': [
            {"temperature": {"$gte": start_temperature, "$lte": end_temperature}}
        ]
    }
    return get_sensor_data_by_filter(filter)

def get_sensor_data_by_humidity_range(start_humidity, end_humidity):
    filter = {
        '$and': [
            {"humidity": {"$gte": start_humidity, "$lte": end_humidity}}
        ]
    }
    return get_sensor_data_by_filter(filter)

#more advanced queries
def get_sensor_data_by_timestamp_range(start_timestamp, end_timestamp, filters=None):
    # Check if timestamps are valid
    if start_timestamp > end_timestamp:
        raise ValueError("start_timestamp must be smaller than end_timestamp")
    if start_timestamp < 0 or end_timestamp < 0:
        raise ValueError("Timestamps must be positive")
    if start_timestamp < 10000000000:
        start_timestamp = start_timestamp * 1000
    if end_timestamp < 10000000000:
        end_timestamp = end_timestamp * 1000
    filter = {
        '$and': [
            {"timestamp": {"$gte": start_timestamp, "$lte": end_timestamp}}
        ]
    }
    if filters:
        filter['$and'].extend(filters)
    return get_sensor_data_by_filter(filter)

def get_sensor_data_of_date(timestamp, filters=None):
    #convert timestamp to datetime
    date = datetime.fromtimestamp(timestamp)
    start_timestamp = date.replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
    end_timestamp = date.replace(hour=23, minute=59, second=59, microsecond=999999).timestamp()
    return get_sensor_data_by_timestamp_range(start_timestamp, end_timestamp, filters=filters)

def get_sensor_data_of_month(year, month, filters=None):
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    return get_sensor_data_by_timestamp_range(start_date.timestamp(), end_date.timestamp(), filters=filters)

def get_sensor_data_of_year(year, filters=None):
    start_date = datetime(year, 1, 1)
    end_date = datetime(year + 1, 1, 1)
    return get_sensor_data_by_timestamp_range(start_date.timestamp(), end_date.timestamp(), filters=filters)