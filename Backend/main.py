from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from pypdf import PdfReader, PdfWriter
from PIL import Image

import io


# =========================================
# APP
# =========================================

app = FastAPI(
    title="PragyanAI Document Flow API",
    version="2.0.0"
)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "https://shiva-pdfmerge-project.netlify.app",
        "https://pdf-image-merge-project.netlify.app",
        "https://app.netlify.com/projects/pdf-image-merger/overview",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# =========================================
# HOME
# =========================================

@app.get("/")
def home():

    return {
        "status": "success",
        "message": "PragyanAI Document Flow API is running"
    }


# =========================================
# HEALTH CHECK
# =========================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# =========================================
# MERGE FILES
# =========================================

@app.post("/merge")
async def merge_files(
    files: list[UploadFile] = File(...)
):

    # -------------------------------------
    # CHECK FILES
    # -------------------------------------

    if not files:

        raise HTTPException(
            status_code=400,
            detail="No files uploaded."
        )


    # -------------------------------------
    # PDF WRITER
    # -------------------------------------

    writer = PdfWriter()


    # -------------------------------------
    # PROCESS FILES
    #
    # IMPORTANT:
    # Files are processed in the exact
    # order received from frontend.
    #
    # Frontend Move Up / Move Down
    # therefore controls final PDF order.
    # -------------------------------------

    for uploaded_file in files:

        filename = (
            uploaded_file.filename or ""
        ).lower()


        file_bytes = (
            await uploaded_file.read()
        )


        # =================================
        # PDF
        # =================================

        if filename.endswith(".pdf"):

            try:

                reader = PdfReader(
                    io.BytesIO(file_bytes)
                )


                for page in reader.pages:

                    writer.add_page(page)


            except Exception as error:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Invalid PDF: "
                        f"{uploaded_file.filename}"
                    )
                )


        # =================================
        # IMAGE
        # =================================

        elif filename.endswith(
            (".jpg", ".jpeg", ".png")
        ):

            try:

                image = Image.open(
                    io.BytesIO(file_bytes)
                )


                # Convert image to RGB
                if image.mode != "RGB":

                    image = image.convert(
                        "RGB"
                    )


                image_pdf = io.BytesIO()


                image.save(
                    image_pdf,
                    format="PDF"
                )


                image_pdf.seek(0)


                reader = PdfReader(
                    image_pdf
                )


                for page in reader.pages:

                    writer.add_page(page)


            except Exception as error:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Invalid image: "
                        f"{uploaded_file.filename}"
                    )
                )


        # =================================
        # UNSUPPORTED
        # =================================

        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported file: "
                    f"{uploaded_file.filename}"
                )
            )


    # =========================================
    # CHECK OUTPUT
    # =========================================

    if len(writer.pages) == 0:

        raise HTTPException(
            status_code=400,
            detail="No valid pages found."
        )


    # =========================================
    # CREATE OUTPUT
    # =========================================

    output = io.BytesIO()


    writer.write(output)


    output.seek(0)


    # =========================================
    # RESPONSE
    # =========================================

    return Response(

        content=output.getvalue(),

        media_type="application/pdf",

        headers={
            "Content-Disposition":
            'attachment; filename="PragyanAI_Merged.pdf"'
        }
    )
