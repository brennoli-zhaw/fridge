from pymongo import MongoClient
import os
from dotenv import load_dotenv
load_dotenv()
connectionString = os.environ["mongodb"]

# Connect to MongoDB
client = MongoClient(connectionString)  # Update the connection string if needed
db = client['IoT']  # Replace 'your_database_name' with your actual database name