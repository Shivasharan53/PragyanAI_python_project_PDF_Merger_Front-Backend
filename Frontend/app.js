/* =========================================
   PRAGYANAI DOCUMENT FLOW
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const dropZone = document.getElementById("dropZone");

const fileList = document.getElementById("fileList");
const emptyState = document.getElementById("emptyState");

const fileCount = document.getElementById("fileCount");
const summaryFiles = document.getElementById("summaryFiles");

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
   BACKEND URL
========================================= */

/*
   IMPORTANT:

   Replace this URL with your Render backend URL.

   Example:

   https://your-project-name.onrender.com
*/

const BACKEND_URL =
    "https://YOUR-RENDER-BACKEND.onrender.com";


/* =========================================
   FILE STORAGE
========================================= */

let selectedFiles = [];

let mergedPdfBlob = null;


/* =========================================
   BROWSE BUTTON
========================================= */

browseBtn.addEventListener("click", function () {

    fileInput.click();

});


/* =========================================
   FILE INPUT
========================================= */

fileInput.addEventListener("change", function (event) {

    const files =
        Array.from(event.target.files);

    addFiles(files);

    /*
       Allows selecting the same
       file again.
    */

    fileInput.value = "";

});


/* =========================================
   DRAG OVER
========================================= */

dropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropZone.classList.add("dragover");

    }
);


/* =========================================
   DRAG LEAVE
========================================= */

dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove("dragover");

    }
);


/* =========================================
   DROP
========================================= */

dropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove("dragover");

        const files =
            Array.from(event.dataTransfer.files);

        addFiles(files);

    }
);


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


    const validFiles = files.filter(
        function (file) {

            const fileName =
                file.name.toLowerCase();

            return allowedExtensions.some(
                function (extension) {

                    return fileName.endsWith(extension);

                }
            );

        }
    );


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


    resultPanel.classList.remove("show");

    mergedPdfBlob = null;

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

    fileList.innerHTML = "";


    if (selectedFiles.length === 0) {

        fileList.appendChild(emptyState);

        emptyState.style.display = "block";

    }
    else {

        emptyState.style.display = "none";


        selectedFiles.forEach(
            function (file, index) {

                const item =
                    createFileItem(file, index);

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


    /* NUMBER */

    const number =
        document.createElement("div");

    number.className =
        "document-number";

    number.textContent =
        index + 1;


    /* ICON */

    const icon =
        document.createElement("div");

    icon.className =
        "document-icon";

    icon.textContent =
        isPdf(file)
            ? "📄"
            : "🖼️";


    /* DETAILS */

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

    upButton.type = "button";

    upButton.className =
        "move-btn";

    upButton.textContent =
        "↑";

    upButton.title =
        "Move Up";


    const downButton =
        document.createElement("button");

    downButton.type = "button";

    downButton.className =
        "move-btn";

    downButton.textContent =
        "↓";

    downButton.title =
        "Move Down";


    upButton.disabled =
        index === 0;


    downButton.disabled =
        index === selectedFiles.length - 1;


    upButton.addEventListener(
        "click",
        function () {

            moveFileUp(index);

        }
    );


    downButton.addEventListener(
        "click",
        function () {

            moveFileDown(index);

        }
    );


    moveButtons.appendChild(upButton);

    moveButtons.appendChild(downButton);


    /* =====================================
       FILE ACTIONS
    ===================================== */

    const actions =
        document.createElement("div");

    actions.className =
        "file-actions";


    const previewButton =
        document.createElement("button");

    previewButton.type =
        "button";

    previewButton.className =
        "file-action preview-btn";

    previewButton.textContent =
        "👁";

    previewButton.title =
        "Preview File";


    previewButton.addEventListener(
        "click",
        function () {

            previewFile(file);

        }
    );


    const removeButton =
        document.createElement("button");

    removeButton.type =
        "button";

    removeButton.className =
        "file-action remove-btn";

    removeButton.textContent =
        "×";

    removeButton.title =
        "Remove File";


    removeButton.addEventListener(
        "click",
        function () {

            removeFile(index);

        }
    );


    actions.appendChild(previewButton);

    actions.appendChild(removeButton);


    /* =====================================
       APPEND
    ===================================== */

    item.appendChild(number);

    item.appendChild(icon);

    item.appendChild(details);

    item.appendChild(moveButtons);

    item.appendChild(actions);


    return item;

}


/* =========================================
   MOVE UP
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
   MOVE DOWN
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

    const removed =
        selectedFiles[index];


    selectedFiles.splice(
        index,
        1
    );


    resultPanel.classList.remove(
        "show"
    );


    mergedPdfBlob = null;


    renderFiles();


    showMessage(
        removed.name + " removed."
    );

}


/* =========================================
   CLEAR ALL
========================================= */

clearBtn.addEventListener(
    "click",
    function () {

        selectedFiles = [];

        mergedPdfBlob = null;

        resultPanel.classList.remove(
            "show"
        );

        renderFiles();

        statusText.textContent =
            "Waiting";

        showMessage(
            "All files cleared."
        );

    }
);


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


    fileCount.textContent =
        count;


    summaryFiles.textContent =
        count;


    totalSize.textContent =
        formatFileSize(size);


    mergeBtn.disabled =
        count === 0;


    if (count === 0) {

        statusText.textContent =
            "Waiting";

    }
    else {

        statusText.textContent =
            "Ready";

    }

}


/* =========================================
   FORMAT SIZE
========================================= */

function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 KB";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        bytes /
        Math.pow(1024, index)
    ).toFixed(2)
    + " "
    + units[index];

}


/* =========================================
   CHECK PDF
========================================= */

function isPdf(file) {

    return file.name
        .toLowerCase()
        .endsWith(".pdf");

}


/* =========================================
   PREVIEW
========================================= */

function previewFile(file) {

    const url =
        URL.createObjectURL(file);


    window.open(
        url,
        "_blank"
    );

}


/* =========================================
   MESSAGE
========================================= */

function showMessage(message) {

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
   MERGE
========================================= */

mergeBtn.addEventListener(
    "click",
    async function () {

        if (selectedFiles.length === 0) {
            return;
        }


        mergeBtn.disabled = true;


        mergeBtn.innerHTML =
            "<span>Creating PDF...</span><span>⏳</span>";


        statusText.textContent =
            "Processing";


        try {

            const formData =
                new FormData();


            /*
               IMPORTANT:

               selectedFiles is already
               arranged using ↑ and ↓.

               Therefore the backend
               receives the exact order.
            */

            selectedFiles.forEach(
                function (file) {

                    formData.append(
                        "files",
                        file
                    );

                }
            );


            const response =
                await fetch(
                    BACKEND_URL + "/merge",
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

                    if (errorData.detail) {
                        errorMessage =
                            errorData.detail;
                    }

                }
                catch (error) {
                    // Ignore JSON parsing error
                }


                throw new Error(
                    errorMessage
                );

            }


            mergedPdfBlob =
                await response.blob();


            resultPanel.classList.add(
                "show"
            );


            statusText.textContent =
                "Completed";


            showMessage(
                "PDF created successfully."
            );

        }
        catch (error) {

            console.error(
                "Merge error:",
                error
            );


            statusText.textContent =
                "Error";


            showMessage(
                error.message ||
                "Unable to connect to backend."
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


/* =========================================
   VIEW MERGED PDF
========================================= */

viewMergedBtn.addEventListener(
    "click",
    function () {

        if (!mergedPdfBlob) {
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

    }
);


/* =========================================
   DOWNLOAD
========================================= */

downloadBtn.addEventListener(
    "click",
    function () {

        if (!mergedPdfBlob) {
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
            "PragyanAI_Merged_Document.pdf";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        setTimeout(
            function () {

                URL.revokeObjectURL(url);

            },
            1000
        );

    }
);


/* =========================================
   INITIAL STATE
========================================= */

renderFiles();
