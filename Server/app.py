from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv # type: ignore
import os
from pymongo import MongoClient
import json
# Load environment variables from .env file

app = Flask(__name__)
CORS(app)
load_dotenv()

uri = os.getenv("MONGO_URI")
database_name = os.getenv("DATABASE_NAME")
collection_name = os.getenv("COLLECTION_NAME")


client = MongoClient(uri)
print("Connected to MongoDB successfully!")
        
# Access the database
db = client[database_name]
print(f"Database '{database_name}' selected.")
        
# Access the collection
collection = db[collection_name]
print(f"Collection '{collection_name}' selected.")

client = OpenAI(
    # defaults to os.environ.get("OPENAI_API_KEY")
    api_key= os.getenv("OPENAI")
)

@app.route('/getCurrentList', methods=['GET'])
def getCurrentList():
    # Get all elements from the collection
    elements = list(collection.find({"active": True}, {"_id": 0}, sort=[("name", 1)]))
    return jsonify(elements)

@app.route('/getNewTargetWord', methods=['GET'])
def getNewTargetWord():
    default_words = ["Fire", "Water", "Earth", "Air"]
    
    if collection.count_documents({}) > 100:
        random_document = list(collection.aggregate([
            {"$match": {"name": {"$nin": default_words}, "active": False}},  # Exclude default words
            {"$sample": {"size": 1}}
        ]))
        if random_document:
            return jsonify({"noun": random_document[0]["name"]})
        else:
            return jsonify({"error": "No document found"})


    # Call the API to generate a new target word
    response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": f"TASK: Give me a single random noun for my game about combining words."
                }
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "custom_format_schema",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "noun": {
                                "description": "The name of the single new noun",
                                "type": "string"
                            },
                        },
                        "additionalProperties": False
                    }
                }
            }
        )
    response_content = response.choices[0].message.content
    parsed_content = json.loads(response_content)
    noun = parsed_content.get("noun")

    if not noun:
        return jsonify({"error": "The response format is incorrect."}), 500
    return jsonify({"noun": noun})
    

@app.route('/loadDefault', methods=['GET'])
def loadDefault():
    # Load Default Elements
    elements = [
        {"name": "Fire", "emoji": "🔥", "active": True},
        {"name": "Water", "emoji": "💧", "active": True},
        {"name": "Earth", "emoji": "🌍", "active": True},
        {"name": "Air", "emoji": "💨", "active": True},
    ]

    # Insert elements into MongoDB collection if not already present
    for element in elements:
        if not collection.find_one({"name": element["name"]}):
            collection.insert_one(element)

    print("Elements added to database.")
    return jsonify({"message": "Elements added to database."})


# Route Improved with AI to allow parents to be stored as a pair and to avoid duplication
@app.route('/combine', methods=['POST'])
def combine():
    # Extract input data
    data = request.json
    element1 = data.get('item1', '')
    element2 = data.get('item2', '')

    if not element1 or not element2:
        return jsonify({"error": "Both 'item1' and 'item2' are required."}), 400

    # Ensure the parent pair is ordered to avoid duplication
    parent_pair = sorted([element1, element2])

    # Check if the combination already exists for the given parent pair
    existing_combo = collection.find_one({
    "parents": {
        "$elemMatch": {
            "$eq": parent_pair
        }
    }
})
    if existing_combo:
        
        collection.update_one(
                    {"name": existing_combo["name"]},
                    { "$set": { "active": True } }
                )
        return jsonify({
            "new_element": existing_combo["name"],
            "emoji": existing_combo["emoji"],
            "first_discovered": False
        })

    try:
        # Call the API with the formatted prompt
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": f"TASK: Combine {element1} and {element2} to create a new element. Try to keep the element as simple and realistic as possible and only 1 word if possible as well. If two basic elements are combined, you should prioritize making a new thing out of that, rather than simply combining the words. Example: Earth + Earth = Solar System. You are allowed to use one of the inputs as the output, but only if there are no realistic elements. Two of the same item should output a larger version of that item if applicable. Your response should be the name of the new element and MUST contain one and only one emoji to represent the element. The response should never have less than or more than 1 emoji. Example: Fire + Water = 💨 Steam. Your output should be in json format to be parsed."
                }
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "custom_format_schema",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "new_element": {
                                "description": "The name of the new element",
                                "type": "string"
                            },
                            "emoji": {
                                "description": "The emoji associated with the element",
                                "type": "string"
                            }
                        },
                        "additionalProperties": False
                    }
                }
            }
        )


        # Extract the response
        response_content = response.choices[0].message.content
        parsed_content = json.loads(response_content)
        new_element = parsed_content.get("new_element")
        emoji = parsed_content.get("emoji")

        if not new_element or not emoji:
            return jsonify({"error": "The response format is incorrect."}), 500

        # Check if the element already exists (regardless of parents)
        existing_element = collection.find_one({"name": new_element})
        if existing_element:
            # If it exists, ensure the parent pair is added explicitly
            existing_parents = existing_element.get("parents", [])
            if parent_pair not in existing_parents:
               
                collection.update_one(
                    {"name": new_element},
                    {
                        "$push": {"parents": parent_pair},
                        "$set": { "active": True } 
                    }
                )
            return jsonify({
                "new_element": existing_element["name"],
                "emoji": existing_element["emoji"],
                "first_discovered": False
            })

        # Save the new combination with explicit parent pair
        combo_entry = {
            "name": new_element,
            "emoji": emoji,
            "parents": [parent_pair],  # Explicitly store as a pair
            "active": True  # Add active flag to allow for future filtering
        }
        collection.insert_one(combo_entry)

        return jsonify({"new_element": new_element, "emoji": emoji, "first_discovered": True})

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/refreshDatabase', methods=['POST'])
def refreshDatabase():
    try:
        # Set all active flags to False before clearing the database
        collection.update_many({}, {"$set": {"active": False}})
        print("All active flags set to False.")

        # Load default elements
        elements = [
            {"name": "Fire", "emoji": "🔥", "active": True},
            {"name": "Water", "emoji": "💧", "active": True},
            {"name": "Earth", "emoji": "🌍", "active": True},
            {"name": "Air", "emoji": "💨", "active": True},
        ]

        # Insert default elements into the collection
        collection.insert_many(elements)
        print("Default elements added to database.")

        return jsonify({"message": "Database refreshed, active flags set to False, and default elements loaded."})
    except Exception as e:
        # Handle exceptions and return an error response
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000)