from flask import jsonify
from pymongo import MongoClient

def test_mongodb_connection(uri: str, database_name: str, collection_name: str):
    try:
        # Connect to MongoDB
        client = MongoClient(uri)
        print("Connected to MongoDB successfully!")
        
        # Access the database
        db = client[database_name]
        print(f"Database '{database_name}' selected.")
        
        # Access the collection
        collection = db[collection_name]
        print(f"Collection '{collection_name}' selected.")

        # Get all elements from the collection
        elements = list(collection.find({}, {"_id": 0}))
        print("Elements retrieved from database.")
        print(elements)
        
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
    finally:
        # Close the client connection
        client.close()
        print("MongoDB connection closed.")

# Parameters for the test
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "WordSmith"
COLLECTION_NAME = "Elements"

# Run the test
test_mongodb_connection(MONGO_URI, DATABASE_NAME, COLLECTION_NAME)
