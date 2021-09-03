
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>

    <div class="static-content">
        ala-bala
    </div>

    <div class="ajax-load" id="container" data-load-path="/jsFetch/queries/formHandler.php" data-submit-path="/jsFetch/queries/insertQuery.php"></div>

    <script>
        ;
        (function fetchHtml() {
            const ajaxLoad = document.querySelectorAll(".ajax-load");

            if (!ajaxLoad) {
                return;
            }

            for (const load of ajaxLoad) {

                const loadPath = load.getAttribute("data-load-path");
                const formContainer = load.id;
                const submitPath = load.getAttribute("data-submit-path");

                handleFetch(loadPath, formContainer, submitPath);               

            }

            function handleFetch(loadPath, formContainer, submitPath) {
            
                const container = document.querySelector(`#${formContainer}`);
                const fetchData = new Promise((resolve, reject) => {
                    fetch(loadPath)
                        .then((response) => {
                            return response.text();
                        })
                        .then((html) => {
                            container.innerHTML = html
                        })
                        .then(() => {
                            const allSubmitters = document.querySelectorAll("[data-type='submit']");
                            const filesInput = container.querySelector("[type='file']");
                            if(filesInput) {

                                filesInput.addEventListener("change", validateUploadFiles);
                            }
                           
                            // console.log(filesInput);
                            for (const sender of allSubmitters) {

                                if (sender.tagName == "BUTTON" || sender.getAttribute("type") == "radio" || sender.getAttribute("type") == "checkbox") {

                                    sender.addEventListener("click", () => {
                                        sendDataFn(submitPath, formContainer);
                                    });
                                }

                                if (sender.tagName == "SELECT") {
                                    sender.addEventListener("change", () => {
                                        sendDataFn(submitPath, formContainer);
                                    });
                                }
                            }

                        });
                });

                fetchData  

                function sendDataFn(submitPath, formContainer) {

                    if (!validateData(formContainer)) {
                        return alert("Имате непопълнени полета задължителни полета (*) или невалидни данни");
                    }

                    const formContainerElement = document.querySelector(`#${formContainer}`);
                    const allInputs = document.querySelectorAll(`#${formContainer} input`);
                    const url = `${window.location.protocol}//${window.location.host}/${submitPath}`;
                    const formData = new FormData();
                    const feed = {};

                    for (const input of allInputs) {
                        // Check if input field has attribute [disabled] DONT send the input.
                        // If the input has attribute disabled, but You WANT TO SEND THE INPUT /If you only want the user to not change it, but send it. /  - set attrubte [send-disabled-field]
                        if (input.getAttribute("disabled") != null && input.getAttribute("send-disabled-field") == null) {
                            continue;
                        }

                        // IF form has files
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
                                console.log('Success:', data);
                            })
                            .catch((error) => {
                                console.error('Error:', error);
                            });

                    }

                    function sendFiles(formData) {

                        fetch(url, {
                                method: 'POST',
                                body: formData,
                            })
                            .then(response => response.text())
                            .then(result => {
                                console.log('Success:', result);
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });
                    }
                }

                function validateData(formContainer) {

                    const currentContainer = document.querySelector(`#${formContainer}`)
                    const inputsWithPatternCheck = currentContainer.querySelectorAll('[pattern]');
                    const requiredInputs = currentContainer.querySelectorAll("[required]:not([type='checkbox'])");
                    const requiredCheckboxes = currentContainer.querySelectorAll('input[type="checkbox"][required]');
                    const maxLength = currentContainer.querySelectorAll("[maxlength]");
                    let validationFail = false;

                    // Validate required checkboxes and set them red border if not pass
                    for (requiredCheckbox of requiredCheckboxes) {
                        requiredCheckbox.closest(".form-group").querySelector("label").classList.remove("text-danger");
                        if (!requiredCheckbox.checked) {
                            requiredCheckbox.closest(".form-group").querySelector("label").classList.add("text-danger");
                            validationFail = true;
                        }
                    }

                    // Validate required inputs and set them red border if not pass
                    for (requiredInput of requiredInputs) {

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

                function validateUploadFiles(e) {
                    const trigger = e.currentTarget;
                    const allowedFileExtentionsString = trigger.getAttribute("data-allowed-extentions");
                    const allowedFileExtentions = allowedFileExtentionsString.split(',');

                    
                    for(const file of trigger.files) {
                        const fileExt = file.name.split('.').pop();

                        if(!allowedFileExtentions.includes(fileExt)) {
                            alert(`Нямате право да качвате файл с такова разширение. Разрешени са само форматите ${allowedFileExtentionsString}`);
                            trigger.value = "";
                        }
                        
                    }
                    
                }

            }
        })();
    </script>



</body>

</html>