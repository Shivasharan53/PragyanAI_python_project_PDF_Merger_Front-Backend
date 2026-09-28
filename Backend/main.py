```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from pypdf import PdfReader, PdfWriter
from PIL import Image

import io


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="PragyanAI Document Flow API",
    version="2.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # Netlify production websites
        "https://shiva-pdfmerge-project.netlify.app",
        "https://pdf-image-merge-project.netlify.app",

        # Local development
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
async def home():

    return {
        "status": "success",
        "message": "PragyanAI Document Flow API is running",
        "version": "2.0.0"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
async def health():

    return {
        "status": "healthy",
        "service": "PragyanAI Document Flow API"
    }


# =========================================================
# MERGE FILES
# =========================================================

@app.post("/merge")
async def merge_files(
    files: list[UploadFile] = File(...)
):

    # -----------------------------------------------------
    # CHECK FILES
    # -----------------------------------------------------

    if not files:

        raise HTTPException(
            status_code=400,
            detail="No files uploaded."
        )


    # -----------------------------------------------------
    # CREATE PDF WRITER
    # -----------------------------------------------------

    writer = PdfWriter()


    # -----------------------------------------------------
    # PROCESS FILES
    #
    # IMPORTANT:
    #
    # Files are processed in exactly the same order
    # received from the frontend.
    #
    # Therefore:
    #
    # Frontend ↑ / ↓
    #        ↓
    # selectedFiles order
    #        ↓
    # FormData order
    #        ↓
    # Backend processing order
    #        ↓
    # Final PDF order
    # -----------------------------------------------------

    for uploaded_file in files:

        filename = (
            uploaded_file.filename or ""
        ).strip().lower()


        # -------------------------------------------------
        # CHECK FILE NAME
        # -------------------------------------------------

        if not filename:

            raise HTTPException(
                status_code=400,
                detail="A file was uploaded without a filename."
            )


        # -------------------------------------------------
        # READ FILE
        # -------------------------------------------------

        try:

            file_bytes = await uploaded_file.read()

        except Exception as error:

            print(
                f"FILE READ ERROR: {uploaded_file.filename}: {error}"
            )

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unable to read file: "
                    f"{uploaded_file.filename}"
                )
            )


        # -------------------------------------------------
        # CHECK EMPTY FILE
        # -------------------------------------------------

        if not file_bytes:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Empty file: "
                    f"{uploaded_file.filename}"
                )
            )


        # =================================================
        # PDF
        # =================================================

        if filename.endswith(".pdf"):

            try:

                pdf_stream = io.BytesIO(
                    file_bytes
                )

                reader = PdfReader(
                    pdf_stream
                )


                # Check encrypted PDF

                if reader.is_encrypted:

                    try:

                        decrypted = reader.decrypt("")

                        if decrypted == 0:

                            raise HTTPException(
                                status_code=400,
                                detail=(
                                    f"Password-protected PDF "
                                    f"is not supported: "
                                    f"{uploaded_file.filename}"
                                )
                            )

                    except HTTPException:

                        raise

                    except Exception:

                        raise HTTPException(
                            status_code=400,
                            detail=(
                                f"Password-protected PDF "
                                f"is not supported: "
                                f"{uploaded_file.filename}"
                            )
                        )


                # Add every page

                for page in reader.pages:

                    writer.add_page(page)


            except HTTPException:

                raise

            except Exception as error:

                print(
                    f"PDF ERROR: "
                    f"{uploaded_file.filename}: "
                    f"{error}"
                )

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Invalid PDF: "
                        f"{uploaded_file.filename}"
                    )
                )


        # =================================================
        # IMAGE
        # =================================================

        elif filename.endswith(
            (".jpg", ".jpeg", ".png")
        ):

            try:

                image_stream = io.BytesIO(
                    file_bytes
                )


                # Open image

                image = Image.open(
                    image_stream
                )


                # Force Pillow to completely load image

                image.load()


                # -----------------------------------------
                # Handle image modes
                # -----------------------------------------

                if image.mode != "RGB":

                    image = image.convert(
                        "RGB"
                    )


                # -----------------------------------------
                # Convert image to PDF
                # -----------------------------------------

                image_pdf = io.BytesIO()


                image.save(
                    image_pdf,
                    format="PDF",
                    resolution=100.0
                )


                image_pdf.seek(0)


                # -----------------------------------------
                # Read generated PDF
                # -----------------------------------------

                reader = PdfReader(
                    image_pdf
                )


                # -----------------------------------------
                # Add image PDF page
                # -----------------------------------------

                for page in reader.pages:

                    writer.add_page(page)


                # Close image

                image.close()


            except Exception as error:

                print(
                    f"IMAGE ERROR: "
                    f"{uploaded_file.filename}: "
                    f"{error}"
                )

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Invalid image: "
                        f"{uploaded_file.filename}"
                    )
                )


        # =================================================
        # UNSUPPORTED FILE
        # =================================================

        else:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported file type: "
                    f"{uploaded_file.filename}. "
                    f"Only PDF, JPG, JPEG and PNG are supported."
                )
            )


        # -------------------------------------------------
        # CLOSE UPLOAD
        # -------------------------------------------------

        try:

            await uploaded_file.close()

        except Exception:

            pass


    # =====================================================
    # CHECK OUTPUT
    # =====================================================

    if len(writer.pages) == 0:

        raise HTTPException(
            status_code=400,
            detail="No valid pages found in the uploaded files."
        )


    # =====================================================
    # CREATE FINAL PDF
    # =====================================================

    output = io.BytesIO()


    try:

        writer.write(
            output
        )

    except Exception as error:

        print(
            f"PDF WRITE ERROR: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create the merged PDF."
        )


    output.seek(0)


    # =====================================================
    # RETURN PDF
    # =====================================================

    return Response(

        content=output.getvalue(),

        media_type="application/pdf",

        headers={
            "Content-Disposition":
                'attachment; filename="PragyanAI_Merged.pdf"',

            "Access-Control-Expose-Headers":
                "Content-Disposition"
        }
    )
```
