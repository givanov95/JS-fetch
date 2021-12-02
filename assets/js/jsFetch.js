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

        const loadPath = window.location.pathname + load.getAttribute("data-load-path");
        const formContainer = load.id;
        const submitPath = window.location.pathname + load.getAttribute("data-submit-path");

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
                    showHiddenSection();
                    addEvents(loadPath, formContainer, submitPath);
                    setContainerHeight();

                });
        });

        // Run the Promise the first time we open the main page
        fetchData


        /**
         * @param formContainer Automatically get this param from .js-ajax-load class
         * @param submitPath The path to the file where we'll send the POST query 
         */
        function sendDataFn(loadPath, submitPath, formContainer, e = null) {


            if (!validateData(formContainer)) {
                return alert("Имате непопълнени полета задължителни полета (*) или невалидни данни");
            }

            const formContainerElement = document.querySelector(`#${formContainer}`);           

            const allInputs = document.querySelectorAll(`#${formContainer} input, #${formContainer} select, #${formContainer} textarea`);
            const url = `${window.location.protocol}//${window.location.host}/${submitPath}`;
            const formData = new FormData();
            const feed = {};

            // Loader
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

                const inputSameName = input.getAttribute("name");
                const checkMultipleInputsWithSameNameAttr = input.closest(".js-fetch-container").querySelectorAll(`[name="${inputSameName}"]`).length;
                const inpName = input.getAttribute("name");
                let inpValue;
                if (checkMultipleInputsWithSameNameAttr > 1) {
                    inpValue = e.currentTarget.value;
                } else {                
                    inpValue = input.value;                    
                }

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
                        // Loader
                        let fetchContainer = formContainerElement.closest(".js-fetch-container");
                        let loader = fetchContainer.querySelector(".loader");

                        if (loader) {
                            formContainerElement.classList.remove("hidden");
                            loader.classList.add("hidden");
                        }
                        if (data.includes('Location:')) {
                            const redirect = data.split(": ");
                            location.href = redirect[1];
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
                    try {
                        // check if webshim polyfill exists 
                        $(`#${container.id}`).htmlPolyfill(html);
                    }catch(err) {
                        container.innerHTML = html;
                    }
                
                }).then(() => {
                    addEvents(loadPath, formContainer, submitPath);
                    showHiddenSection();
                    setContainerHeight();

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
                const thisFormGroup = requiredCheckbox.closest(".form-group");
                if(thisFormGroup) { // IF added form group

                    thisFormGroup.querySelector("label").classList.remove("text-danger");
                    if (!requiredCheckbox.checked) {
                        requiredCheckbox.closest(".form-group").querySelector("label").classList.add("text-danger");
                        validationFail = true;
                    }
                }                
               
            }

            // Validate required inputs and set them red border if not pass
            for (const requiredInput of requiredInputs) {

                const thisRequiredInput = requiredInput.closest(".form-group");

                if(thisRequiredInput) {
                    requiredInput.classList.remove("boder", "border-danger");
                    thisRequiredInput.querySelector("label").classList.remove("text-danger");

                    if (requiredInput.value.length < 1) {
                        requiredInput.classList.add("border", "border-danger");
                        requiredInput.closest(".form-group").querySelector("label").classList.add("text-danger");
                        validationFail = true;
                    }

                }
                                
            }

            // Validate inputs with pattern and set them red border if not pass
            for (const inputPatternElement of inputsWithPatternCheck) {
                const thisInputPatternFormGroup = inputPatternElement.closest(".form-group");

                inputPatternElement.classList.remove("boder", "border-danger");
                if(thisInputPatternFormGroup) {
                    thisInputPatternFormGroup.querySelector("label").classList.remove("text-danger");
                }
              
                // check if the element with attribute pattern is required or if not empty 
                if (inputPatternElement.hasAttribute("required") || inputPatternElement.value.length > 1) {

                    const pattern = inputPatternElement.getAttribute("pattern");
                    if (!validatePattern(inputPatternElement.value, pattern)) {
                        const thisInputPatternElement = inputPatternElement.closest(".form-group");

                        if(thisInputPatternElement) {
                            thisInputPatternElement.querySelector("label").classList.add("text-danger");
                            inputPatternElement.classList.add("border", "border-danger");
                            validationFail = true;
                        }
                        
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

                if (sender.tagName == "BUTTON" || sender.getAttribute("type") == "radio" || sender.getAttribute("type") == "checkbox" || sender.tagName == "SPAN") {

                    if (sender.getAttribute("listener") != "listen") {

                        sender.setAttribute("listener", "listen");

                        sender.addEventListener("click", (e) => {
                            sendDataFn(loadPath, submitPath, formContainer, e);
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


        /**
         * 
         * @returns void 
         * Function set event listeners to all elements with selector ".show-hidden-section"
         */
        function showHiddenSection() {

            const showHiddenSectionTrigger = document.querySelectorAll(".show-hidden-section");


            if (showHiddenSectionTrigger.length < 1) {
                return;
            }

            for (const el of showHiddenSectionTrigger) {
                el.addEventListener("click", showSelectedSection);

            }

            /**
             * 
             * @returns void
             * Then get the [data-selector] of the trigger element with class ".show-hidden-section";
             * [data-selector] Holds the selector wich to Show - remove class hidden /If selector has class hidden - it removes the class/ 
             * 
             */

            function showSelectedSection(e) {

                const trigger = e.currentTarget;
                const selector = trigger.getAttribute("data-selector");

                const elementsToShow = document.querySelectorAll(`${selector}`);

                for (const elToShow of elementsToShow) {
                    elToShow.classList.remove("hidden");
                }
            }
        }

    }

    function setContainerHeight() { 
        const divElement = document.querySelector(".js-fetch-container");
        const elemHeight = divElement.offsetHeight;    
        divElement.style=`min-height:${elemHeight}px`;
    }

})();