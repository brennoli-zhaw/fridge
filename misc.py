def convert_sensors_to_filter(start_temperature, end_temperature, start_humidity, end_humidity, start_pressure, end_pressure):
    filter = [
            {"temperature": {"$gte": float(start_temperature), "$lte": float(end_temperature)}},
            {"humidity": {"$gte": float(start_humidity), "$lte": float(end_humidity)}},
            {"pressure": {"$gte": float(start_pressure), "$lte": float(end_pressure)}}
        ]
    return filter

def convert_persons_to_filter(persons):
    person_array = persons.split(",")
    for person in person_array:
        if person == "":
            return False
    return [{"persons": {"$in": person_array}}]
