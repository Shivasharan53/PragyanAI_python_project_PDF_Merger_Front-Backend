from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pypdf import PdfReader, PdfWriter
from PIL import Image
import io


app = FastAPI(
    title="PragyanAI PDF Merger API"
)


# ======================================
# CORS
# ======================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://shiva-pdfmerge-project.netlify.app",
        "https://pdf-image-merge-project.netlify.app",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================================
# HOME
# ======================================

@app.get("/")
def home():

    return {
        "message": "PragyanAI PDF Merger API is running"
    }


# ======================================
# MERGE
# ======================================

@app.post("/merge")
async def merge_files(
    files: list[UploadFile] = File(...)
):

    if not files:

        raise HTTPException(
            status_code=400,
            detail="No files uploaded"
        )


    writer = PdfWriter()


    # ==================================
    # PROCESS FILES IN ORDER
    # ==================================

    for uploaded_file in files:

        filename = (
            uploaded_file.filename or ""
        ).lower()


        file_bytes = await uploaded_file.read()


        # ==================================
        # PDF
        # ==================================

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
                    detail=f"Invalid PDF: {uploaded_file.filename}"
                )


        # ==================================
        # IMAGE
        # ==================================

        elif filename.endswith(
            (".jpg", ".jpeg", ".png")
        ):

            try:

                image = Image.open(
                    io.BytesIO(file_bytes)
                )


                if image.mode != "RGB":

                    image = image.convert("RGB")


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
                    detail=f"Invalid image: {uploaded_file.filename}"
                )


        else:

            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file: {uploaded_file.filename}"
            )


    # ==================================
    # CHECK PAGES
    # ==================================

    if len(writer.pages) == 0:

        raise HTTPException(
            status_code=400,
            detail="No pages found in uploaded files"
        )


    # ==================================
    # CREATE OUTPUT
    # ==================================

    output = io.BytesIO()


    writer.write(output)

    output.seek(0)


    # ==================================
    # RESPONSE
    # ==================================

    return Response(
        content=output.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                'attachment; filename="PragyanAI_Merged.pdf"'
        }
    )
