import sys
from pymongo import MongoClient
import json
import subprocess

# Connect to MongoDB
client = MongoClient('<connectionString>')  # Update the connection string if needed
db = client['IoT']  # Replace 'your_database_name' with your actual database name
collection = db['Measured values']  # Replace 'your_collection_name' with your actual collection name

# Your JSON object received from Node-RED
node_red_data = sys.argv[1] # msg.payload

# Convert JSON string to Python dictionary
data = json.loads(node_red_data)

# Insert into MongoDB
collection.insert_one(data)

# Close the connection
client.close()
