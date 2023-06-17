let searchValues = [];

function addToList() {
    let inputValue = document.getElementById("inputValue").value;
    if (inputValue.trim() !== "") {
        searchValues.push(inputValue);
        let listItem = document.createElement("li");
        listItem.textContent = inputValue;
        let valueList = document.getElementById("skillList");
        valueList.appendChild(listItem);
        document.getElementById("inputValue").value = "";
    }
}

function handleFileSelect() {
    var fileInput = document.getElementById("fileInput");
    if (fileInput.files.length > 0) {
        var file = fileInput.files[0];
        var fileReader = new FileReader();
        fileReader.onload = function (event) {
            var typedarray = new Uint8Array(event.target.result);
            pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
                var searchResults = [];
                var numPages = pdf.numPages;
                var pagePromises = [];
                for (var pageNumber = 1; pageNumber <= numPages; pageNumber++) {
                    pagePromises.push(
                        pdf.getPage(pageNumber).then(function (page) {
                            return page.getTextContent().then(function (textContent) {
                                var pageText = "";
                                textContent.items.forEach(function (item) {
                                    pageText += item.str + " ";
                                });
                                return pageText;
                            });
                        })
                    );
                }
                Promise.all(pagePromises).then(function (allPageTexts) {
                    var fullText = allPageTexts.join(" ");
                    for (var i = 0; i < searchValues.length; i++) {
                        var searchTerm = searchValues[i];
                        var found = fullText.includes(searchTerm);
                        searchResults.push({ term: searchTerm, found: found });
                    }
                    console.log(searchResults);
                    let percent = (searchResults.filter((result) => result.found).length / searchResults.length) * 100;
                    console.log(percent);

                    var percentageMessage = document.createElement("p");
                    percentageMessage.textContent = "Percentage: " + percent + "%";
                    percentageMessage.style.color = "white";
                    percentageMessage.style.fontFamily = "Arial, sans-serif";
                    percentageMessage.style.fontSize = "16px";
                    document.getElementById("resultContainer").appendChild(percentageMessage);

                    var foundValues = searchResults.filter((result) => result.found);
                    var foundValuesList = document.createElement("ul");
                    foundValuesList.textContent = "Values Found:";
                    foundValuesList.style.color = "white";
                    foundValuesList.style.fontFamily = "Arial, sans-serif";
                    foundValuesList.style.fontSize = "14px";
                    foundValues.forEach(function (value) {
                    var listItem = document.createElement("li");
                    listItem.textContent = value.term;
                    listItem.style.marginLeft = "20px";
                    foundValuesList.appendChild(listItem);
                    });
                    document.getElementById("resultContainer").appendChild(foundValuesList);

                    var notFoundValues = searchResults.filter((result) => !result.found);
                    var notFoundValuesList = document.createElement("ul");
                    notFoundValuesList.textContent = "Values Not Found:";
                    notFoundValuesList.style.color = "white";
                    notFoundValuesList.style.fontFamily = "Arial, sans-serif";
                    notFoundValuesList.style.fontSize = "14px";
                    notFoundValues.forEach(function (value) {
                    var listItem = document.createElement("li");
                    listItem.textContent = value.term;
                    listItem.style.marginLeft = "20px";
                    notFoundValuesList.appendChild(listItem);
                    });
                    document.getElementById("resultContainer").appendChild(notFoundValuesList);

                    var completeMessage = document.createElement("p");
                    completeMessage.textContent = "Analysis Complete";
                    completeMessage.style.color = "white";
                    completeMessage.style.fontFamily = "Arial, sans-serif";
                    completeMessage.style.fontSize = "16px";
                    document.getElementById("resultContainer").appendChild(completeMessage);

                    document.getElementById("waitingMessage").style.display = "none";
                    document.getElementById("loadingSpinner").style.display = "none";
                });
            });
        };
        fileReader.readAsArrayBuffer(file);
    }
}