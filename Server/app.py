from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv # type: ignore
import os
import json

# Load environment variables from .env file

app = Flask(__name__)
CORS(app)

# Load model directly
load_dotenv()
client = OpenAI(
    # defaults to os.environ.get("OPENAI_API_KEY")
    api_key= os.getenv("NOPENAI_API_KEY")
)


print("running")

@app.route('/combine', methods=['POST'])
def combine():
    # Extract input data
    print("logged")
    data = request.json
    element1 = data.get('item1', '')
    element2 = data.get('item2', '')

    print(element1)
    print(element2)
    print("logged")

    try:
        # Ensure both elements are provided
        if not element1 or not element2:
            return jsonify({"error": "Both 'item1' and 'item2' are required."}), 400

        print("log2")
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
        print(response)

        # Retrieve and format the response
        # Assuming response is the variable holding your API response object
        response_content = response.choices[0].message.content

        # Parsing and extracting the fields
        parsed_content = json.loads(response_content)
        new_element = parsed_content.get("new_element")
        emoji = parsed_content.get("emoji")
        # Validate the response format
        print(new_element)
        print(emoji)

        if not new_element or not emoji:
            return jsonify({"error": "The response format is incorrect."}), 500

        # Return the result
        return jsonify({"new_element": new_element, "emoji": emoji})

    except Exception as e:
        # Handle exceptions and return an error response
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)