function _get (elString) {
    return document.querySelector(elString);
} 
simpBtn = _get("#simplify-button");
msgBox = _get("#msg-box");

const [ID, B_TYPE, DATES, NAME, S_NAME, DETAIL] = [0, 1, 3, 7, 8, 14]

function formatDate() {
    // TODO: remove 0:s, and calculate days
}

function handleFileInput() {
    //e.preventDefault()
    

    const files = _get("#file-input").files;
    // Escape if no file is seleted
    if (files.length <= 0) {
        msgBox.innerHTML = "Ingen fil vald"
        return
    } 
    // Else work on file
    let f = files[0]
    console.log("First file", f)

    rowObjects = []
    let reader = new FileReader();
    reader.readAsText(f)
    reader.onload = function(event) {
        let tsv = event.target.result;

        let parsed = Papa.parse(tsv);
        //console.log(result.meta.delimiter)
        let headers = parsed.data[0]
        let firstRow = parsed.data[1]
        let allRows = parsed.data.slice(1, parsed.data.length)
        console.log(headers[DETAIL])
        console.log("All rows:", allRows)

        // [ID, B_TYPE, DATES, NAME, S_NAME, DETAIL]
        for (let row of allRows) {
            let rowObj = {}
            rowObj.id = row[ID];
            rowObj.booking_type = row[B_TYPE];
            rowObj.dates = row[DATES];
            rowObj.name = row[NAME];
            rowObj.second_name = row[S_NAME];
            rowObj.detail = row[DETAIL];
            rowObjects.push(rowObj)
        }
        console.log("Row Objects:", rowObjects)
    }
    

}

simpBtn.addEventListener("click", handleFileInput);