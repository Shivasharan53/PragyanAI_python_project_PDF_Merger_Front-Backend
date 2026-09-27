/* =========================================
   PRAGYANAI DOCUMENT FLOW
========================================= */


/* =========================================
   BACKEND URL
========================================= */

/*
   IMPORTANT:
   Replace this with your Render FastAPI URL.

   Example:
   const BACKEND_URL = "https://your-project.onrender.com";

   DO NOT add /merge here.
*/

const BACKEND_URL = "YOUR_RENDER_BACKEND_URL";


/* =========================================
   ELEMENTS
========================================= */

const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const dropZone = document.getElementById("dropZone");

const fileList = document.getElementById("fileList");
const emptyState = document.getElementById("emptyState");

const fileCount = document.getElementById("fileCount");
const totalSize = document.getElementById("totalSize");
const statusText = document.getElementById("statusText");

const clearBtn = document.getElementById("clearBtn");
const mergeBtn = document.getElementById("mergeBtn");

const successMessage =
    document.getElementById("successMessage");

const successText =
    document.getElementById("successText");

const resultPanel =
    document.getElementById("resultPanel");

const viewMergedBtn =
    document.getElementById("viewMergedBtn");

const downloadBtn =
    document.getElementById("downloadBtn");


/* =========================================
   FILE STORAGE
========================================= */

let selectedFiles = [];

let mergedPdfBlob = null;


/* =========================================
   SAFE ELEMENT CHECK
========================================= */

function elementExists(element) {
    return element !== null;
}


/* =========================================
   BROWSE BUTTON
========================================= */

if (elementExists(browseBtn)) {

    browseBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            fileInput.click();

        }
    );

}


/* =========================================
   FILE INPUT
========================================= */

if (elementExists(fileInput)) {

    fileInput.addEventListener(
        "change",
        function (event) {

            const files =
                Array.from(event.target.files);

            addFiles(files);

            /*
               Allows the same file to be
               selected again later.
            */

            fileInput.value = "";

        }
    );

}


/* =========================================
   DRAG & DROP
========================================= */

if (elementExists(dropZone)) {

    dropZone.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            dropZone.classList.add(
                "dragover"
            );

        }
    );


    dropZone.addEventListener(
        "dragleave",
        function () {

            dropZone.classList.remove(
                "dragover"
            );

        }
    );


    dropZone.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            dropZone.classList.remove(
                "dragover"
            );

            const files =
                Array.from(
                    event.dataTransfer.files
                );

            addFiles(files);

        }
    );

}


/* =========================================
   ADD FILES
========================================= */

function addFiles(files) {

    const allowedExtensions = [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    ];


    const validFiles =
        files.filter(function (file) {

            const fileName =
                file.name.toLowerCase();


            return allowedExtensions.some(
                function (extension) {

                    return fileName.endsWith(
                        extension
                    );

                }
            );

        });


    if (validFiles.length === 0) {

        showMessage(
            "Please select PDF, JPG, JPEG or PNG files."
        );

        return;

    }


    validFiles.forEach(
        function (file) {

            selectedFiles.push(file);

        }
    );


    mergedPdfBlob = null;


    if (elementExists(resultPanel)) {

        resultPanel.classList.remove(
            "show"
        );

    }


    renderFiles();


    showMessage(
        validFiles.length +
        " file" +
        (validFiles.length > 1 ? "s" : "") +
        " added successfully."
    );

}


/* =========================================
   RENDER FILES
========================================= */

function renderFiles() {

    if (!elementExists(fileList)) {
        return;
    }


    fileList.innerHTML = "";


    if (selectedFiles.length === 0) {

        if (elementExists(emptyState)) {

            fileList.appendChild(
                emptyState
            );

            emptyState.style.display =
                "block";

        }

    }
    else {

        if (elementExists(emptyState)) {

            emptyState.style.display =
                "none";

        }


        selectedFiles.forEach(
            function (file, index) {

                const item =
                    createFileItem(
                        file,
                        index
                    );

                fileList.appendChild(item);

            }
        );

    }


    updateStats();

}


/* =========================================
   CREATE FILE ITEM
========================================= */

function createFileItem(file, index) {

    const item =
        document.createElement("div");

    item.className =
        "document-item";


    /* =====================================
       NUMBER
    ===================================== */

    const number =
        document.createElement("div");

    number.className =
        "document-number";

    number.textContent =
        index + 1;


    /* =====================================
       ICON
    ===================================== */

    const icon =
        document.createElement("div");

    icon.className =
        "document-icon";


    icon.textContent =
        file.name
            .toLowerCase()
            .endsWith(".pdf")
            ? "📄"
            : "🖼️";


    /* =====================================
       DETAILS
    ===================================== */

    const details =
        document.createElement("div");

    details.className =
        "document-details";


    const name =
        document.createElement("div");

    name.className =
        "document-name";

    name.textContent =
        file.name;

    name.title =
        file.name;


    const size =
        document.createElement("div");

    size.className =
        "document-size";

    size.textContent =
        formatFileSize(file.size);


    details.appendChild(name);

    details.appendChild(size);


    /* =====================================
       MOVE BUTTONS
    ===================================== */

    const moveButtons =
        document.createElement("div");

    moveButtons.className =
        "move-buttons";


    const upButton =
        document.createElement("button");

    upButton.type =
        "button";

    upButton.className =
        "move-btn";

    upButton.textContent =
        "↑";

    upButton.title =
        "Move Up";


    const downButton =
        document.createElement("button");

    downButton.type =
        "button";

    downButton.className =
        "move-btn";

    downButton.textContent =
        "↓";

    downButton.title =
        "Move Down";


    /*
       First file cannot move up.
    */

    upButton.disabled =
        index === 0;


    /*
       Last file cannot move down.
    */

    downButton.disabled =
        index ===
        selectedFiles.length - 1;


    upButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            moveFileUp(index);

        }
    );


    downButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            moveFileDown(index);

        }
    );


    moveButtons.appendChild(
        upButton
    );

    moveButtons.appendChild(
        downButton
    );


    /* =====================================
       ACTION BUTTONS
    ===================================== */

    const actions =
        document.createElement("div");

    actions.className =
        "file-actions";


    /* =====================================
       PREVIEW
    ===================================== */

    const previewButton =
        document.createElement("button");

    previewButton.type =
        "button";

    previewButton.className =
        "file-action preview-btn";

    previewButton.textContent =
        "👁";

    previewButton.title =
        "Preview";


    previewButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            previewFile(file);

        }
    );


    /* =====================================
       REMOVE
    ===================================== */

    const removeButton =
        document.createElement("button");

    removeButton.type =
        "button";

    removeButton.className =
        "file-action remove-btn";

    removeButton.textContent =
        "×";

    removeButton.title =
        "Remove";


    removeButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            removeFile(index);

        }
    );


    actions.appendChild(
        previewButton
    );

    actions.appendChild(
        removeButton
    );


    /* =====================================
       APPEND EVERYTHING
    ===================================== */

    item.appendChild(number);

    item.appendChild(icon);

    item.appendChild(details);

    item.appendChild(moveButtons);

    item.appendChild(actions);


    return item;

}


/* =========================================
   MOVE FILE UP
========================================= */

function moveFileUp(index) {

    if (index <= 0) {
        return;
    }


    const temp =
        selectedFiles[index];


    selectedFiles[index] =
        selectedFiles[index - 1];


    selectedFiles[index - 1] =
        temp;


    renderFiles();


    showMessage(
        "File moved up successfully."
    );

}


/* =========================================
   MOVE FILE DOWN
========================================= */

function moveFileDown(index) {

    if (
        index >=
        selectedFiles.length - 1
    ) {

        return;

    }


    const temp =
        selectedFiles[index];


    selectedFiles[index] =
        selectedFiles[index + 1];


    selectedFiles[index + 1] =
        temp;


    renderFiles();


    showMessage(
        "File moved down successfully."
    );

}


/* =========================================
   REMOVE FILE
========================================= */

function removeFile(index) {

    if (
        index < 0 ||
        index >= selectedFiles.length
    ) {

        return;

    }


    const removed =
        selectedFiles[index];


    selectedFiles.splice(
        index,
        1
    );


    mergedPdfBlob = null;


    if (elementExists(resultPanel)) {

        resultPanel.classList.remove(
            "show"
        );

    }


    renderFiles();


    showMessage(
        removed.name +
        " removed."
    );

}


/* =========================================
   CLEAR ALL
========================================= */

if (elementExists(clearBtn)) {

    clearBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            selectedFiles = [];

            mergedPdfBlob = null;


            if (elementExists(resultPanel)) {

                resultPanel.classList.remove(
                    "show"
                );

            }


            renderFiles();


            if (elementExists(statusText)) {

                statusText.textContent =
                    "Waiting";

            }


            showMessage(
                "All files cleared."
            );

        }
    );

}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

    const count =
        selectedFiles.length;


    const size =
        selectedFiles.reduce(
            function (total, file) {

                return total + file.size;

            },
            0
        );


    if (elementExists(fileCount)) {

        fileCount.textContent =
            count;

    }


    if (elementExists(totalSize)) {

        totalSize.textContent =
            formatFileSize(size);

    }


    if (elementExists(mergeBtn)) {

        mergeBtn.disabled =
            count === 0;

    }


    if (elementExists(statusText)) {

        if (count === 0) {

            statusText.textContent =
                "Waiting";

        }
        else {

            statusText.textContent =
                "Ready";

        }

    }

}


/* =========================================
   FORMAT FILE SIZE
========================================= */

function formatFileSize(bytes) {

    if (!bytes || bytes <= 0) {

        return "0 KB";

    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const i =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        bytes /
        Math.pow(1024, i)
    ).toFixed(2) +
    " " +
    units[i];

}


/* =========================================
   PREVIEW FILE
========================================= */

function previewFile(file) {

    try {

        const url =
            URL.createObjectURL(file);


        window.open(
            url,
            "_blank"
        );


        setTimeout(
            function () {

                URL.revokeObjectURL(url);

            },
            60000
        );

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Unable to preview this file."
        );

    }

}


/* =========================================
   SUCCESS MESSAGE
========================================= */

function showMessage(message) {

    if (
        !elementExists(successMessage) ||
        !elementExists(successText)
    ) {

        return;

    }


    successText.textContent =
        message;


    successMessage.classList.add(
        "show"
    );


    setTimeout(
        function () {

            successMessage.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =========================================
   MERGE FILES
========================================= */

if (elementExists(mergeBtn)) {

    mergeBtn.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            if (selectedFiles.length === 0) {

                showMessage(
                    "Please add files first."
                );

                return;

            }


            /*
               Check Render URL
            */

            if (
                !BACKEND_URL ||
                BACKEND_URL ===
                "YOUR_RENDER_BACKEND_URL"
            ) {

                showMessage(
                    "Please add your Render backend URL in app.js."
                );

                if (elementExists(statusText)) {

                    statusText.textContent =
                        "Backend URL Missing";

                }

                return;

            }


            mergeBtn.disabled =
                true;


            mergeBtn.innerHTML =
                "<span>Creating PDF...</span><span>⏳</span>";


            if (elementExists(statusText)) {

                statusText.textContent =
                    "Processing";

            }


            try {

                const formData =
                    new FormData();


                /*
                   IMPORTANT:
                   selectedFiles is already
                   arranged using ↑ and ↓.

                   Therefore the backend receives
                   the files in the exact order
                   shown on the screen.
                */

                selectedFiles.forEach(
                    function (file) {

                        formData.append(
                            "files",
                            file,
                            file.name
                        );

                    }
                );


                /*
                   Remove trailing slash if
                   the user accidentally adds one.
                */

                const cleanBackendURL =
                    BACKEND_URL.replace(
                        /\/$/,
                        ""
                    );


                const response =
                    await fetch(
                        cleanBackendURL +
                        "/merge",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                if (!response.ok) {

                    let errorMessage =
                        "Merge failed.";


                    try {

                        const errorData =
                            await response.json();


                        if (
                            errorData.detail
                        ) {

                            errorMessage =
                                errorData.detail;

                        }

                    }
                    catch (jsonError) {

                        /*
                           Backend did not return
                           JSON. Keep default message.
                        */

                    }


                    throw new Error(
                        errorMessage
                    );

                }


                const contentType =
                    response.headers.get(
                        "content-type"
                    );


                if (
                    !contentType ||
                    !contentType.includes(
                        "application/pdf"
                    )
                ) {

                    throw new Error(
                        "Backend did not return a PDF."
                    );

                }


                mergedPdfBlob =
                    await response.blob();


                if (elementExists(resultPanel)) {

                    resultPanel.classList.add(
                        "show"
                    );

                }


                if (elementExists(statusText)) {

                    statusText.textContent =
                        "Completed";

                }


                showMessage(
                    "PDF created successfully."
                );

            }
            catch (error) {

                console.error(
                    "Merge Error:",
                    error
                );


                if (elementExists(statusText)) {

                    statusText.textContent =
                        "Error";

                }


                showMessage(
                    error.message ||
                    "Unable to merge files."
                );

            }
            finally {

                mergeBtn.disabled =
                    selectedFiles.length === 0;


                mergeBtn.innerHTML =
                    "<span>Create Merged PDF</span><span>→</span>";

            }

        }
    );

}


/* =========================================
   VIEW MERGED PDF
========================================= */

if (elementExists(viewMergedBtn)) {

    viewMergedBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            if (!mergedPdfBlob) {

                showMessage(
                    "Please create the merged PDF first."
                );

                return;

            }


            const url =
                URL.createObjectURL(
                    mergedPdfBlob
                );


            window.open(
                url,
                "_blank"
            );


            setTimeout(
                function () {

                    URL.revokeObjectURL(url);

                },
                60000
            );

        }
    );

}


/* =========================================
   DOWNLOAD MERGED PDF
========================================= */

if (elementExists(downloadBtn)) {

    downloadBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            if (!mergedPdfBlob) {

                showMessage(
                    "Please create the merged PDF first."
                );

                return;

            }


            const url =
                URL.createObjectURL(
                    mergedPdfBlob
                );


            const link =
                document.createElement("a");


            link.href =
                url;


            link.download =
                "PragyanAI_Merged.pdf";


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        url
                    );

                },
                1000
            );


            showMessage(
                "Merged PDF downloaded successfully."
            );

        }
    );

}


/* =========================================
   INITIAL STATE
========================================= */

renderFiles();
