from pydantic import BaseModel

class ImageData(BaseModel):
    image: str  # Base64-encoded image string
    dict_of_vars: dict  # Dictionary of variables and their values
