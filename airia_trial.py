import requests
import json
import uuid

API_KEY = "ak-NDIyMTk5MjExMXwxNzYyNjM0MjQ1Nzc2fHRpLVEyRnlibVZuYVdVZ1RXVnNiRzl1SUZWdWFYWmxjbk5wZEhrdFQzQmxiaUJTWldkcGMzUnlZWFJwYjI0dFVISnZabVZ6YzJsdmJtRnNYMlkxTkRNNU9ETmhMVFEyWW1NdE5HWXdNaTFpWWpNMExXTXdZak5pWW1Nek9Ua3lOQT09fDF8MzM1MzcwNjM1NyAg"
PIPELINE_GUID = "ec961148-6f84-44d6-a175-9bd314e24306"
API_URL = f"https://api.airia.ai/v2/PipelineExecution/{PIPELINE_GUID}"

def queryAIRIA(convo_txt: str, user_input: str, emotion: str):
    """
    Sends a formatted query to your Airia agent and returns the AI's responses as a list.
    """

    # Construct the prompt exactly as your model expects
    formatted_prompt = (
        f"Convo_txt: {convo_txt} "
        f"user_input: {user_input} "
        f"Emotion: {emotion}"
    )

    # Generate a new userId (valid GUID)
    user_id = str(uuid.uuid4())

    payload = {
        "userId": user_id,
        "userInput": formatted_prompt,
        "asyncOutput": False
    }

    headers = {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json"
    }

    response = requests.post(API_URL, headers=headers, data=json.dumps(payload))

    if response.status_code != 200:
        raise RuntimeError(f"❌ API Error {response.status_code}: {response.text}")

    # Parse the JSON result from the API
    data = response.json()
    inner_json = json.loads(data["result"])  # The 'result' is stringified JSON
    responses = inner_json.get("responses", [])

    return {"responses": responses}


# === Example use ===
if __name__ == "__main__":
    result = queryAIRIA(
        convo_txt="Do you want rotisserie chicken today? I have lots of good stuff in the fridge.",
        user_input="No, I want fruit.",
        emotion="neutral"
    )

    print(json.dumps(result, indent=2, ensure_ascii=False))


    

