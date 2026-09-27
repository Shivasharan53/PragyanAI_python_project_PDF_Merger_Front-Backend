```javascript
// ==========================================
// PRAGYANAI PDF STUDIO
// ==========================================

const API_URL =
    "https://pragyanai-python-project-pdf-merger.onrender.com";


// ==========================================
// HTML ELEMENTS
// ==========================================

const fileInput =
    document.getElementById("fileInput");

const browseBtn =
    document.getElementById("browseBtn");

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


// ==========================================
// FILE STORAGE
// ==========================================

let selectedFiles = [];

let mergedPDFUrl = null;


// ==========================================
// ADD / CHOOSE FILES
// ==========================================

browseBtn.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        fileInput.click();

    }
);


// ==========================================
// FILE INPUT
// ==========================================

fileInput.addEventListener(
    "change",
    function () {

        if (!fileInput.files) {
            return;
        }

        addFiles(fileInput.files);

        // Allows selecting the same file again
        fileInput.value = "";

    }
);


// ==========================================
// DRAG OVER
// ==========================================

dropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropZone.classList.add(
            "dragover"
        );

    }
);


// ==========================================
// DRAG LEAVE
// ==========================================

dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove(
            "dragover"
        );

    }
);


// ==========================================
// DROP FILES
// ==========================================

dropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove(
            "dragover"
        );

        addFiles(
            event.dataTransfer.files
        );

    }
);


// ==========================================
// ADD FILES
// ==========================================

function addFiles(files) {

    let added = 0;


    for (
        const file of files
    ) {

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const allowed =
            [
                "pdf",
                "jpg",
                "jpeg",
                "png"
            ];


        // Check format
        if (
            !allowed.includes(
                extension
            )
        ) {

            showMessage(
                file.name +
                " is not supported.",
                false
            );

            continue;

        }


        // Check duplicate
        const duplicate =
            selectedFiles.some(
                function (oldFile) {

                    return (
                        oldFile.name ===
                        file.name &&

                        oldFile.size ===
                        file.size
                    );

                }
            );


        if (duplicate) {

            continue;

        }


        selectedFiles.push(file);

        added++;

    }


    renderFiles();


    if (added > 0) {

        showMessage(
            added +
            (added === 1
                ? " file added successfully."
                : " files added successfully."),
            true
        );

    }

}


// ==========================================
// RENDER FILES
// ==========================================

function renderFiles() {

    fileList.innerHTML = "";


    fileCount.textContent =
        selectedFiles.length;


    mergeBtn.disabled =
        selectedFiles.length === 0;


    selectedFiles.forEach(
        function (file, index) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "file-item";


            item.dataset.index =
                index;


            item.draggable =
                true;


            // ==================================
            // FILE ICON
            // ==================================

            let icon = "📄";


            if (
                file.type.startsWith(
                    "image/"
                )
            ) {

                icon = "🖼️";

            }


            // ==================================
            // FILE ITEM
            // ==================================

            item.innerHTML = `

                <div class="file-icon">
                    ${icon}
                </div>


                <div class="file-info">

                    <div class="file-name">
                        ${escapeHtml(file.name)}
                    </div>

                    <div class="file-size">
                        ${formatSize(file.size)}
                    </div>

                </div>


                <div class="file-buttons">

                    <button
                        type="button"
                        class="view-file">

                        👁 View

                    </button>


                    <button
                        type="button"
                        class="move-up"
                        ${index === 0 ? "disabled" : ""}>

                        ↑ Up

                    </button>


                    <button
                        type="button"
                        class="move-down"
                        ${
                            index ===
                            selectedFiles.length - 1
                                ? "disabled"
                                : ""
                        }>

                        ↓ Down

                    </button>


                    <button
                        type="button"
                        class="remove-file">

                        🗑 Remove

                    </button>

                </div>

            `;


            // ==================================
            // VIEW
            // ==================================

            const viewButton =
                item.querySelector(
                    ".view-file"
                );


            viewButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const url =
                        URL.createObjectURL(
                            file
                        );


                    window.open(
                        url,
                        "_blank"
                    );

                }
            );


            // ==================================
            // MOVE UP
            // ==================================

            const upButton =
                item.querySelector(
                    ".move-up"
                );


            upButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    if (index === 0) {
                        return;
                    }


                    const temp =
                        selectedFiles[
                            index - 1
                        ];


                    selectedFiles[
                        index - 1
                    ] =
                        selectedFiles[index];


                    selectedFiles[index] =
                        temp;


                    renderFiles();

                }
            );


            // ==================================
            // MOVE DOWN
            // ==================================

            const downButton =
                item.querySelector(
                    ".move-down"
                );


            downButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    if (
                        index ===
                        selectedFiles.length - 1
                    ) {

                        return;

                    }


                    const temp =
                        selectedFiles[
                            index + 1
                        ];


                    selectedFiles[
                        index + 1
                    ] =
                        selectedFiles[index];

```
