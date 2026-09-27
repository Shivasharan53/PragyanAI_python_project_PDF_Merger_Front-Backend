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
   BROWSE BUTTON
========================================= */

browseBtn.addEventListener("click", function () {

    fileInput.click();

});


/* =========================================
   FILE INPUT
========================================= */

fileInput.addEventListener("change", function (event) {

    const files = Array.from(event.target.files);

    addFiles(files);

    /*
       Reset input so the same file
       can be selected again.
    */

    fileInput.value = "";

});


/* =========================================
   DRAG & DROP
========================================= */

dropZone.addEventListener("dragover", function (event) {

    event.preventDefault();

    dropZone.classList.add("dragover");

});


dropZone.addEventListener("dragleave", function () {

    dropZone.classList.remove("dragover");

});


dropZone.addEventListener("drop", function (event) {

    event.preventDefault();

    dropZone.classList.remove("dragover");

    const files =
        Array.from(event.dataTransfer.files);

    addFiles(files);

});


/* =========================================
   ADD FILES
========================================= */

function addFiles(files) {

    const validFiles = files.filter(function (file) {

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];

        return allowedTypes.includes(file.type);

    });


    if (validFiles.length === 0) {

        showMessage(
            "Please select PDF, JPG, JPEG or PNG files."
        );

        return;

    }


    validFiles.forEach(function (file) {

        selectedFiles.push(file);

    });


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


        selectedFiles.forEach(function (file, index) {

            const item =
                createFileItem(file, index);

            fileList.appendChild(item);

        });

    }


    updateStats();

}


/* =========================================
   CREATE FILE ITEM
========================================= */

function createFileItem(file, index) {

    const item =
        document.createElement("div");

    item.className = "document-item";


    /* NUMBER */

    const number =
        document.createElement("div");

    number.className = "document-number";

    number.textContent = index + 1;


    /* ICON */

    const icon =
        document.createElement("div");

    icon.className = "document-icon";

    icon.textContent =
        file.type === "application/pdf"
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

    upButton.textContent = "↑";

    upButton.title =
        "Move Up";


    const downButton =
        document.createElement("button");

    downButton.type = "button";

    downButton.className =
        "move-btn";

    downButton.textContent = "↓";

    downButton.title =
        "Move Down";


    /*
       Disable buttons when the file
       is already first or last.
    */

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
       ACTION BUTTONS
    ===================================== */

    const actions =
        document.createElement("div");

    actions.className =
        "file-actions";


    const previewButton =
        document.createElement("button");

    previewButton.type = "button";

    previewButton.className =
        "file-action preview-btn";

    previewButton.textContent = "👁";

    previewButton.title =
        "Preview";


    previewButton.addEventListener(
        "click",
        function () {

            previewFile(file);

        }
    );


    const removeButton =
        document.createElement("button");

    removeButton.type = "button";

    removeButton.className =
        "file-action remove-btn";

    removeButton.textContent = "×";

    removeButton.title =
        "Remove";


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

    const removed =
        selectedFiles[index];


    selectedFiles.splice(index, 1);


    renderFiles();


    showMessage(
        removed.name +
        " removed."
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

        resultPanel.classList.remove("show");

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


    totalSize.textContent =
        formatFileSize(size);


    mergeBtn.disabled =
        count < 1;


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

    const url =
        URL.createObjectURL(file);


    window.open(
        url,
        "_blank"
    );

}


/* =========================================
   SUCCESS MESSAGE
========================================= */

function showMessage(message) {

    successText.textContent =
        message;


    successMessage.classList.add(
        "show"
    );


    setTimeout(function () {

        successMessage.classList.remove(
            "show"
        );

    }, 2500);

}


/* =========================================
   MERGE FILES
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
               Files are appended in the
               CURRENT selectedFiles order.

               Therefore ↑ and ↓ directly
               control the final PDF order.
            */

            selectedFiles.forEach(
                function (file) {

                    formData.append(
                        "files",
                        file
                    );

                }
            );


            /*
               If your Render backend URL
               is different, replace this URL.
            */

            const response =
                await fetch(
                    "/merge",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Merge failed"
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

            console.error(error);


            statusText.textContent =
                "Error";


            showMessage(
                "Unable to merge files. Check your backend connection."
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


        link.href = url;

        link.download =
            "PragyanAI_Merged_Document.pdf";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        URL.revokeObjectURL(url);

    }
);


/* =========================================
   INITIAL STATE
========================================= */

renderFiles();
