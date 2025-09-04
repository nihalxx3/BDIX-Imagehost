import os
import shutil
import hashlib
import random
import string
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import mysql.connector
from starlette.responses import RedirectResponse

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '../Uploaded_Data')
DB_CONFIG = {
    'user': 'root',
    'password': '',
    'host': '127.0.0.1',
    'database': 'plexbdimghost',
    'raise_on_warnings': True
}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload dir exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

def create_table():
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            original_name VARCHAR(255),
            stored_name VARCHAR(255),
            upload_time DATETIME,
            upload_ip VARCHAR(45),
            hexcode CHAR(8),
            UNIQUE(hexcode)
        )''')
        db.commit()
        cursor.close()
        db.close()
    except Exception as e:
        # Ignore error if table already exists
        if hasattr(e, 'errno') and e.errno == 1050:
            pass
        else:
            raise

create_table()

def generate_hexcode():
    return ''.join(random.choices('0123456789abcdef', k=8))

def get_unique_filename(filename):
    name, ext = os.path.splitext(filename)
    counter = 0
    candidate = filename
    while os.path.exists(os.path.join(UPLOAD_DIR, candidate)):
        counter += 1
        candidate = f"{name}_{counter}{ext}"
    return candidate

@app.post("/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    if file.content_type not in ["image/png", "image/jpeg", "image/jpg", "image/gif"]:
        raise HTTPException(status_code=400, detail="Invalid file type.")
    contents = await file.read()
    hexcode = generate_hexcode()
    stored_name = get_unique_filename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, stored_name)
    with open(file_path, "wb") as f:
        f.write(contents)
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO images (original_name, stored_name, upload_time, upload_ip, hexcode) VALUES (%s, %s, %s, %s, %s)",
        (file.filename, stored_name, datetime.now(), request.client.host, hexcode))
    db.commit()
    cursor.close()
    db.close()
    ext = os.path.splitext(stored_name)[1]
    url = f"http://localhost:29911/{hexcode}{ext}"
    return {"url": url, "hexcode": hexcode, "stored_name": stored_name}

@app.get("/{hexcode}.{ext}")
def get_image(hexcode: str, ext: str):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT stored_name FROM images WHERE hexcode=%s", (hexcode,))
    row = cursor.fetchone()
    cursor.close()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Image not found.")
    file_path = os.path.join(UPLOAD_DIR, row['stored_name'])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File missing.")
    return FileResponse(file_path)

@app.get("/")
def root():
    return RedirectResponse(url="/docs")
