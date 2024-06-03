from db_client import db

collection = db["Door status"]

def insertDocument(document):
    collection.insert_one(document)
    print(document)

def get_interactions_by_filter(filter):
    matches = {
        '$match': filter
    }
    sort = { "$sort": { "open": 1 } }
    pipeline = [matches, sort]
    documentList = []
    print(pipeline)
    results = collection.aggregate(pipeline)
    for x in results:
        documentList.append(x)
    return documentList

def get_interactions_by_timestamp_range(start_timestamp, end_timestamp, filters=None):
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
            {
                'closed': {
                    '$gte': start_timestamp
                }
            }, {
                'open': {
                    '$lte': end_timestamp
                }
            }
        ]
    }
    if filters:
        filter['$and'].extend(filters)
    return get_interactions_by_filter(filter)

