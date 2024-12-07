from fastapi import APIRouter
import base64
from io import BytesIO
from apps.calculator.utils import analyze_image
from schema import ImageData
from PIL import Image

router = APIRouter()

@router.post("/")
async def run(data: ImageData):
    try:
        # Decode base64 image data
        image_data = base64.b64decode(data.image.split(",")[1])  # Assumes format: data:image/png;base64,<data>
        image_bytes = BytesIO(image_data)
        image = Image.open(image_bytes)

        # Call analyze_image and process responses
        responses = analyze_image(image, dict_of_vars=data.dict_of_vars)
        data_list = []
        for response in responses:
            data_list.append(response)
        return {"message": "Image processed", "data": data_list, "status": "success"}
    except Exception as e:
        print(f"Error in processing: {e}")
        return {"message": "An error occurred", "error": str(e), "status": "failure"}
