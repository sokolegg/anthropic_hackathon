import anthropic
import base64
import os
from datetime import datetime
import json
from datetime import timedelta
import uvicorn
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from PIL import Image



# Example usage
#generate_summaries("docs", )





app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
client = anthropic.Client(api_key=api_key)

prompt = """
You are a professional screenshot analyzer for lawyers. 
Could you, please, say, what site is visited on this screenshot and summarize a user activity.
Write only summary of the activity in a form of 
"Reserching the law "Name of the doc, article" or "writing the note on "name of the case".
"""

@app.get("/process_screenshot")
async def generate_summaries(docs_dir="docs/", message=prompt, timedelta_duration_seconds=5):
    summaries = []
    for filename in os.listdir(docs_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            file_path = os.path.join(docs_dir, filename)
            
            # Read and encode image
            with open(file_path, "rb") as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            
            # Get timestamp from filename if possible
            try:
                parts = filename.split('_')
                date_part = parts[1]
                time_part = parts[2].split('.')[0]
                from_timestamp = datetime.strptime(f"{date_part}_{time_part}", '%Y-%m-%d_%H-%M-%S').isoformat()
            except:
                from_timestamp = datetime.now().isoformat()
                
            # Get analysis from Claude
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                messages=[{
                    "role": "user", 
                    "content": [
                        {"type": "text", "text": message},
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": image_data
                            }
                        }
                    ]
                }]
            )
            
            # Add to summaries list
            from_timestamp = datetime.strptime(str(from_timestamp), '%Y-%m-%dT%H:%M:%S')
            to_timestamp = (from_timestamp + timedelta(seconds=timedelta_duration_seconds)).isoformat()
            summaries.append({
                "from_timestamp": from_timestamp.isoformat(),
                "to_timestamp": to_timestamp,
                "description": response.content[0].text.strip(),
                "image_path": file_path
            })
    
    # Sort by timestamp
    summaries.sort(key=lambda x: x["from_timestamp"])
    
    # Convert to JSON
    json_output = json.dumps(summaries, indent=2)
    print(json_output)
    
    # Save the JSON to a file
    with open('activity_summaries.json', 'w') as f:
        json.dump(summaries, f, indent=2)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)  # слушает на всех интерфейсах
