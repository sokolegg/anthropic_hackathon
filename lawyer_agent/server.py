from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import datetime
import base64
from io import BytesIO
from PIL import Image


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextRequest(BaseModel):
    text: str


class ScreenshotRequest(BaseModel):
    image: str


@app.post("/upload_text")
async def process_text(request: TextRequest):
    if not request.text:
        raise HTTPException(status_code=422, detail="Text is required")
    dt = datetime.datetime.now(datetime.timezone.utc)
    dt = f"{dt.year}-{dt.month}-{dt.day}_{dt.hour}-{dt.minute}-{dt.second}"
    with open(f"./database/inner_HTML_{dt}.txt", "w") as f:
        f.write(request.text)
    return {"message": request.text}


@app.post("/upload_image")
async def upload_screenshot(request: ScreenshotRequest):
    try:
        image_data = base64.b64decode(request.image.split(",")[1])
        image = Image.open(BytesIO(image_data))
        dt = datetime.datetime.now(datetime.timezone.utc)
        dt = f"{dt.year}-{dt.month}-{dt.day}_{dt.hour}-{dt.minute}-{dt.second}"
        image.save(f"./database/screenshot_{dt}.png")
        return {"message": "Screenshot uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)  # слушает на всех интерфейсах