;
(function fetchHtml() {

    /** 
     * ajaxLoad - holds all elements that show the fetched content
     * @type {HTMLAllCollection}
     */
    const ajaxLoad = document.querySelectorAll(".js-ajax-load");

    if (!ajaxLoad) {
        return;
    }

    for (const load of ajaxLoad) {

        const loadPath = load.getAttribute("data-load-path");
        const formContainer = load.id;
        const submitPath = load.getAttribute("data-submit-path");

        handleFetch(loadPath, formContainer, submitPath);

    }


    /**
     * @param loadPath the path we shoulf fetch and show in the div with class .js-ajax-load
     * @param formContainer Automatically get this param from .js-ajax-load class
     * @param submitPath The path to the file where we'll send the POST query 
     */
    function handleFetch(loadPath, formContainer, submitPath) {

        const container = document.querySelector(`#${formContainer}`);
        /**
         * create a Promise, so we'll know that the content's been loaded in .js-ajax-load before run the other JS operation
        */
        const fetchData = new Promise((resolve, reject) => {
            fetch(loadPath)
                .then((response) => {
                    return response.text();
                })
                .then((html) => {
                    container.innerHTML = html
                })
                .then(() => {

                    addEvents(loadPath, formContainer, submitPath);

                });
        });

        // Run the Promise the first time we open the main page
        fetchData


        /**
         * @param formContainer Automatically get this param from .js-ajax-load class
         * @param submitPath The path to the file where we'll send the POST query 
         */
        function sendDataFn(loadPath, submitPath, formContainer) {

            if (!validateData(formContainer)) {
                return alert("Имате непопълнени полета задължителни полета (*) или невалидни данни");
            }

            const formContainerElement = document.querySelector(`#${formContainer}`);

            const allInputs = document.querySelectorAll(`#${formContainer} input`);
            const url = `${window.location.protocol}//${window.location.host}/${submitPath}`;
            const formData = new FormData();
            const feed = {};

            // LOADER
            let fetchContainer = formContainerElement.closest(".js-fetch-container");
            let loader = fetchContainer.querySelector(".loader");

            if (loader) {
                formContainerElement.classList.add("hidden");
                loader.classList.remove("hidden");
            }




            for (const input of allInputs) {
                /**  Check if input field has attribute [disabled] DONT send the input.
                * If the input has attribute disabled, but You WANT TO SEND THE INPUT /If you only want the user to not change it, but send it. /  - set attrubte [send-disabled-field]
                */
                if (input.getAttribute("disabled") != null && input.getAttribute("send-disabled-field") == null) {
                    continue;
                }

                // Check IF form has files
                if (input.getAttribute("type") == "file") {
                    const files = formContainerElement.querySelector('input[type="file"]');

                    if (files.files.length < 1) {
                        continue;
                    }

                    for (let i = 0; i < files.files.length; i++) {

                        formData.append(i, files.files[i]);
                    }

                    sendFiles(formData);

                }


                const inpName = input.getAttribute("name");
                const inpValue = input.value;
                feed[inpName] = inpValue;



            }
            sendPost(url, feed);


            /**
             * @param url - the url path where to send the post query. Generated from the host url and the @const submitPath
             * @param feed - the POST data which we should send in JSON format
             */
            function sendPost(url, feed) {

                fetch(url, {
                    method: 'POST', // or 'PUT'
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(feed),
                })
                    .then(response => response.text())
                    .then(data => {
                        let fetchContainer = formContainerElement.closest(".js-fetch-container");
                        let loader = fetchContainer.querySelector(".loader");

                        // Loader
                        let fetchContainer = formContainerElement.closest(".js-fetch-container");
                        let loader = fetchContainer.querySelector(".loader");

                        if (loader) {
                            formContainerElement.classList.remove("hidden");
                            loader.classList.add("hidden");
                        }
                        console.log('Success:', data);
                    })
                    .then(() => {
                        getDataFromLoadPath(loadPath, container);
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });

            }


            /**
             * 
             * @param {object} formData JS object that contains the files information which is get from input[type='file'] 
             */
            function sendFiles(formData) {

                fetch(url, {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.text())
                    .then(result => {
                        console.log('Success:', result);
                    })
                    .then(() => {
                        getDataFromLoadPath(loadPath, container);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }


        }


        function getDataFromLoadPath(loadPath, container) {

            fetch(loadPath)
                .then((response) => {
                    return response.text();
                })
                .then((html) => {
                    container.innerHTML = html
                }).then(() => {
                    addEvents(loadPath, formContainer, submitPath);
                });

        }

        /**
         * 
         * @param {string} formContainer contains the container class where we should show the fetched data
         * @returns TRUE if data is valid and FALSE if data is NOT
         */
        function validateData(formContainer) {

            const currentContainer = document.querySelector(`#${formContainer}`)
            const inputsWithPatternCheck = currentContainer.querySelectorAll('[pattern]');
            const requiredInputs = currentContainer.querySelectorAll("[required]:not([type='checkbox'])");
            const requiredCheckboxes = currentContainer.querySelectorAll('input[type="checkbox"][required]');
            const maxLength = currentContainer.querySelectorAll("[maxlength]");
            let validationFail = false;

            // Validate required checkboxes and set them red border if not pass
            for (const requiredCheckbox of requiredCheckboxes) {
                requiredCheckbox.closest(".form-group").querySelector("label").classList.remove("text-danger");
                if (!requiredCheckbox.checked) {
                    requiredCheckbox.closest(".form-group").querySelector("label").classList.add("text-danger");
                    validationFail = true;
                }
            }

            // Validate required inputs and set them red border if not pass
            for (const requiredInput of requiredInputs) {

                requiredInput.classList.remove("boder", "border-danger");
                requiredInput.closest(".form-group").querySelector("label").classList.remove("text-danger");


                if (requiredInput.value.length < 1) {
                    requiredInput.classList.add("border", "border-danger");
                    requiredInput.closest(".form-group").querySelector("label").classList.add("text-danger");
                    validationFail = true;
                }
            }

            // Validate inputs with pattern and set them red border if not pass
            for (inputPatternElement of inputsWithPatternCheck) {
                inputPatternElement.classList.remove("boder", "border-danger");
                inputPatternElement.closest(".form-group").querySelector("label").classList.remove("text-danger");
                // check if the element with attribute pattern is required or if not empty 
                if (inputPatternElement.hasAttribute("required") || inputPatternElement.value.length > 1) {

                    const pattern = inputPatternElement.getAttribute("pattern");
                    if (!validatePattern(inputPatternElement.value, pattern)) {
                        inputPatternElement.closest(".form-group").querySelector("label").classList.add("text-danger");
                        inputPatternElement.classList.add("border", "border-danger");
                        validationFail = true;
                    }
                }
            }

            if (validationFail) {
                return false;
            } else {
                return true;
            }

            // Check pattern 
            function validatePattern(patternText, regexText) {
                let regex = new RegExp(regexText);

                // pattern in html should be without first and last symbol for pattern - "/  /" in the pattern
                if (regex.test(patternText)) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        /**
         * 
         * @param {event} e - the event that calls the function
         */
        function validateUploadFiles(e) {
            const trigger = e.currentTarget;
            const allowedFileExtentionsString = trigger.getAttribute("data-allowed-extentions");
            const allowedFileExtentions = allowedFileExtentionsString.split(',');


            for (const file of trigger.files) {
                const fileExt = file.name.split('.').pop();

                if (!allowedFileExtentions.includes(fileExt)) {
                    alert(`Нямате право да качвате файл с такова разширение. Разрешени са само форматите ${allowedFileExtentionsString}`);
                    trigger.value = "";
                }

            }

        }

        function addEvents(loadPath, formContainer, submitPath) {
            const allSubmitters = document.querySelectorAll("[data-type='submit']");
            const filesInput = container.querySelector("[type='file']");
            if (filesInput) {

                filesInput.addEventListener("change", validateUploadFiles);
            }
            for (const sender of allSubmitters) {

                if (sender.tagName == "BUTTON" || sender.getAttribute("type") == "radio" || sender.getAttribute("type") == "checkbox") {

                    if (sender.getAttribute("listener") != "listen") {

                        sender.setAttribute("listener", "listen");

                        sender.addEventListener("click", (e) => {
                            sendDataFn(loadPath, submitPath, formContainer);
                        });

                    }

                }

                if (sender.tagName == "SELECT") {

                    if (sender.getAttribute("listener") != "listen") {

                        sender.setAttribute("listener", "listen");

                        sender.addEventListener("change", (e) => {
                            sendDataFn(loadPath, submitPath, formContainer);
                        });
                    }
                }
            }
        }

    }

})();