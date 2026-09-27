/* ======================================
   PRAGYANAI PDF STUDIO
   COMPLETE FRONTEND JAVASCRIPT
====================================== */


/* ======================================
   BACKEND URL
====================================== */

const API_URL =
    "https://pragyanai-python-project-pdf-merger.onrender.com";


/* ======================================
   ELEMENTS
====================================== */

const browseBtn =
    document.getElementById("browseBtn");

const fileInput =
    document.getElementById("fileInput");

const dropZone =
    document.getElementById("dropZone");

const fileList =
    document.getElementById("fileList");

const fileCount =
    document.getElementById("fileCount");

const clearBtn =
    document.getElementById("clearBtn");

const mergeBtn =
    document.getElementById("mergeBtn");

const mergeText =
    document.getElementById("mergeText");

const successMessage =
    document.getElementById("successMessage");

const successText =
    document.getElementById("successText");

const mergedFileArea =
    document.getElementById("mergedFileArea");

const viewMergedBtn =
    document.getElementById("viewMergedBtn");

const downloadBtn =
    document.getElementById("downloadBtn");


/* ======================================
   FILE STORAGE
====================================== */

let selectedFiles = [];

let mergedPdfBlob = null;

let mergedPdfUrl = null;


/* ======================================
   SUPPORTED FILES
====================================== */

const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png"
];


/* ======================================
   INITIAL STATE
====================================== */

document.addEventListener("DOMContentLoaded", () => {

    updateFileList();

});


/* ======================================
   CHOOSE FILES BUTTON
====================================== */

browseBtn.addEventListener("click", (event) => {

    event.preventDefault();

    event.stopPropagation();

    fileInput.click();

});


/* ======================================
   FILE INPUT CHANGE
====================================== */

fileInput.addEventListener("change", (event) => {

    const files = Array.from(event.target.files);

    addFiles(files);

    /*
       Important:
       Clear input value so selecting
       the same file again works.
    */

    fileInput.value = "";

});


/* ======================================
   DROP ZONE CLICK
====================================== */

dropZone.addEventListener("click", (event) => {

    /*
       Don't trigger twice when
       Choose Files button is clicked.
    */

    if (event.target === browseBtn) {
        return;
    }

    fileInput.click();

});


/* ======================================
   DRAG OVER
====================================== */

dropZone.addEventListener("dragover", (event) => {

    event.preventDefault();

    event.stopPropagation();

    dropZone.classList.add("dragover");

});


/* ======================================
   DRAG LEAVE
====================================== */

dropZone.addEventListener("dragleave", (event) => {

    event.preventDefault();

    dropZone.classList.remove("dragover");

});


/* ======================================
   DROP
====================================== */

dropZone.addEventListener("drop", (event) => {

    event.preventDefault();

    event.stopPropagation();

    dropZone.classList.remove("dragover");

    const files =
        Array.from(event.dataTransfer.files);

    addFiles(files);

});


/* ======================================
   ADD FILES
====================================== */

function addFiles(files) {

    if (!files || files.length === 0) {
        return;
    }


    let addedCount = 0;


    files.forEach((file) => {

        /*
           Check file type
        */

        const isValid =
            allowedTypes.includes(file.type) ||
            /\.(pdf|jpg|jpeg|png)$/i.test(file.name);


        if (!isValid) {

            showMessage(
                `Unsupported file: ${file.name}`,
                false
            );

            return;
        }


        /*
           Prevent duplicate files
        */

        const alreadyExists =
            selectedFiles.some(
                existingFile =>
                    existingFile.name === file.name &&
                    existingFile.size === file.size &&
                    existingFile.lastModified === file.lastModified
            );


        if (alreadyExists) {

            return;
        }


        /*
           Add file
        */

        selectedFiles.push(file);

        addedCount++;

    });


    /*
       Update UI
    */

    updateFileList();


    if (addedCount > 0) {

        showMessage(
            `${addedCount} file${addedCount > 1 ? "s" : ""} added successfully`,
            true
        );

    }

}


/* ======================================
   UPDATE FILE LIST
====================================== */

function updateFileList() {

    fileList.innerHTML = "";


    fileCount.textContent =
        selectedFiles.length;


    mergeBtn.disabled =
        selectedFiles.length < 2;


    if (selectedFiles.length === 0) {

        mergedFileArea.classList.remove("show");

        return;
    }


    selectedFiles.forEach((file, index) => {

        const item =
            createFileItem(file, index);

        fileList.appendChild(item);

    });

}


/* ======================================
   CREATE FILE ITEM
====================================== */

function createFileItem(file, index) {

    const item =
        document.createElement("div");

    item.className = "file-item";


    /* FILE ICON */

    const icon =
        document.createElement("div");

    icon.className = "file-icon";

    icon.textContent =
        file.type === "application/pdf"
            ? "📄"
            : "🖼️";


    /* FILE INFO */

    const info =
        document.createElement("div");

    info.className = "file-info";


    const name =
        document.createElement("div");

    name.className = "file-name";

    name.textContent =
        `${index + 1}. ${file.name}`;


    const size =
        document.createElement("div");

    size.className = "file-size";

    size.textContent =
        formatFileSize(file.size);


    info.appendChild(name);

    info.appendChild(size);


    /* BUTTONS */

    const buttons =
        document.createElement("div");

    buttons.className = "file-buttons";


    /* MOVE UP */

    const upBtn =
        document.createElement("button");

    upBtn.type = "button";

    upBtn.className = "move-file";

    upBtn.innerHTML = "↑";

    upBtn.title = "Move Up";

    upBtn.disabled =
        index === 0;


    upBtn.addEventListener("click", (event) => {

        event.preventDefault();

        event.stopPropagation();

        moveFileUp(index);

    });


    /* MOVE DOWN */

    const downBtn =
        document.createElement("button");

    downBtn.type = "button";

    downBtn.className = "move-file";

    downBtn.innerHTML = "↓";

    downBtn.title = "Move Down";

    downBtn.disabled =
        index === selectedFiles.length - 1;


    downBtn.addEventListener("click", (event) => {

        event.preventDefault();

        event.stopPropagation();

        moveFileDown(index);

    });


    /* VIEW */

    const viewBtn =
        document.createElement("button");

    viewBtn.type = "button";

    viewBtn.className = "view-file";

    viewBtn.innerHTML = "👁 View";


    viewBtn.addEventListener("click", (event) => {

        event.preventDefault();

        event.stopPropagation();

        viewFile(file);

    });


    /* REMOVE */

    const removeBtn =
        document.createElement("button");

    removeBtn.type = "button";

    removeBtn.className = "remove-file";

    removeBtn.innerHTML = "✕ Remove";


    removeBtn.addEventListener("click", (event) => {

        event.preventDefault();

        event.stopPropagation();

        removeFile(index);

    });


    buttons.appendChild(upBtn);

    buttons.appendChild(downBtn);

    buttons.appendChild(viewBtn);

    buttons.appendChild(removeBtn);


    item.appendChild(icon);

    item.appendChild(info);

    item.appendChild(buttons);


    return item;

}


/* ======================================
   MOVE FILE UP
====================================== */

function moveFileUp(index) {

    if (index <= 0) {
        return;
    }


    /*
       Swap files
    */

    const temp =
        selectedFiles[index - 1];

    selectedFiles[index - 1] =
        selectedFiles[index];

    selectedFiles[index] =
        temp;


    updateFileList();


    showMessage(
        "File moved up successfully",
        true
    );

}


/* ======================================
   MOVE FILE DOWN
====================================== */

function moveFileDown(index) {

    if (index >= selectedFiles.length - 1) {
        return;
    }


    /*
       Swap files
    */

    const temp =
        selectedFiles[index + 1];

    selectedFiles[index + 1] =
        selectedFiles[index];

    selectedFiles[index] =
        temp;


    updateFileList();


    showMessage(
        "File moved down successfully",
        true
    );

}


/* ======================================
   REMOVE FILE
====================================== */

function removeFile(index) {

    const removedFile =
        selectedFiles[index];


    selectedFiles.splice(index, 1);


    updateFileList();


    showMessage(
        `${removedFile.name} removed`,
        true
    );

}


/* ======================================
   CLEAR ALL
====================================== */

clearBtn.addEventListener("click", () => {

    if (selectedFiles.length === 0) {

        showMessage(
            "No files to clear",
            false
        );

        return;
    }


    selectedFiles = [];


    fileInput.value = "";


    updateFileList();


    mergedPdfBlob = null;


    if (mergedPdfUrl) {

        URL.revokeObjectURL(
            mergedPdfUrl
        );

        mergedPdfUrl = null;

    }


    mergedFileArea.classList.remove("show");


    showMessage(
        "All files cleared successfully",
        true
    );

});


/* ======================================
   VIEW ORIGINAL FILE
====================================== */

function viewFile(file) {

    const url =
        URL.createObjectURL(file);


    window.open(
        url,
        "_blank"
    );


    /*
       Release object URL later
    */

    setTimeout(() => {

        URL.revokeObjectURL(url);

    }, 60000);

}


/* ======================================
   MERGE BUTTON
====================================== */

mergeBtn.addEventListener("click", async () => {

    if (selectedFiles.length < 2) {

        showMessage(
            "Please select at least 2 files",
            false
        );

        return;
    }


    /*
       Disable button while processing
    */

    mergeBtn.disabled = true;

    mergeText.textContent =
        "Merging...";


    showMessage(
        "Creating your merged PDF...",
        true
    );


    try {

        const formData =
            new FormData();


        /*
           IMPORTANT:
           Files are appended in the
           exact order shown on screen.
        */

        selectedFiles.forEach((file) => {

            formData.append(
                "files",
                file
            );

        });


        /*
           Send files to FastAPI
        */

        const response =
            await fetch(
                `${API_URL}/merge`,
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {

            let errorMessage =
                "Failed to merge files";


            try {

                const errorData =
                    await response.json();

                if (errorData.detail) {

                    errorMessage =
                        errorData.detail;

                }

            } catch (error) {

                /*
                   Ignore JSON parsing error
                */

            }


            throw new Error(
                errorMessage
            );

        }


        /*
           Get merged PDF
        */

        mergedPdfBlob =
            await response.blob();


        /*
           Create browser URL
        */

        if (mergedPdfUrl) {

            URL.revokeObjectURL(
                mergedPdfUrl
            );

        }


        mergedPdfUrl =
            URL.createObjectURL(
                mergedPdfBlob
            );


        /*
           Show merged area
        */

        mergedFileArea.classList.add(
            "show"
        );


        showMessage(
            "PDF merged successfully!",
            true
        );


    } catch (error) {

        console.error(
            "Merge Error:",
            error
        );


        showMessage(
            `Merge failed: ${error.message}`,
            false
        );


    } finally {

        mergeText.textContent =
            "Merge Files";


        mergeBtn.disabled =
            selectedFiles.length < 2;

    }

});


/* ======================================
   VIEW MERGED PDF
====================================== */

viewMergedBtn.addEventListener(
    "click",
    () => {

        if (!mergedPdfUrl) {

            showMessage(
                "No merged PDF available",
                false
            );

            return;
        }


        window.open(
            mergedPdfUrl,
            "_blank"
        );

    }
);


/* ======================================
   DOWNLOAD MERGED PDF
====================================== */

downloadBtn.addEventListener(
    "click",
    () => {

        if (!mergedPdfBlob) {

            showMessage(
                "No merged PDF available",
                false
            );

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
            "PragyanAI_Merged.pdf";


        document.body.appendChild(link);

        link.click();

        link.remove();


        setTimeout(() => {

            URL.revokeObjectURL(url);

        }, 1000);


        showMessage(
            "Download started successfully",
            true
        );

    }
);


/* ======================================
   FORMAT FILE SIZE
====================================== */

function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 Bytes";
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
        parseFloat(
            (
                bytes /
                Math.pow(1024, index)
            ).toFixed(2)
        ) +
        " " +
        units[index]
    );

}


/* ======================================
   SUCCESS / ERROR MESSAGE
====================================== */

function showMessage(
    message,
    success = true
) {

    successText.textContent =
        message;


    if (success) {

        successMessage.style.background =
            "#ecfdf5";

        successMessage.style.borderColor =
            "#bbf7d0";

        successMessage.style.color =
            "#15803d";

    } else {

        successMessage.style.background =
            "#fef2f2";

        successMessage.style.borderColor =
            "#fecaca";

        successMessage.style.color =
            "#dc2626";

    }


    successMessage.classList.add(
        "show"
    );


    /*
       Automatically hide message
       after 4 seconds
    */

    clearTimeout(
        window.messageTimer
    );


    window.messageTimer =
        setTimeout(() => {

            successMessage.classList.remove(
                "show"
            );

        }, 4000);

}
