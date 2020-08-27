function _get (elString) {
    return document.querySelector(elString);
} 
let simpBtn = _get("#simplify-button");
let msgBox = _get("#msg-box");
let mSel = _get("month-select")
let yearMonth;

const [ID, B_TYPE, DATES, NAME, S_NAME, UF_NAME, DETAIL] = [0, 1, 3, 7, 8, 9, 14]

function formatDate(dateString) {
    // TODO: remove 0:s, and calculate days
    // Three possible date formats
    // Single date 2020-07-23 00:00
    // Spanning date 2020-07-25 00:00:00 - 2020-08-05 00:00:00
    // Multiple dates 
    // 2020-07-25 00:00:00 - 2020-08-05 00:00:00 , 2020-08-10 00:00:00 - 2020-08-21 00:00:00
    
    ds = dateString.replace(/ (00:)+00/g, "");
    ds = ds.replace(/ , /g, ",");
    //console.log(ds);

    return ds;
}   

function lastOfMonthLookup(year, month) {
    // e.g. year: "2020", month: "07"
    const monthLookup = {
        "01": 31,
        "02": (Number(year) % 4 === 0) ? 29 : 28,
        "03": 31,
        "04": 30,
        "05": 31,
        "06": 30,
        "07": 31,
        "08": 31,
        "09": 30,
        "10": 31,
        "11": 30,
        "12": 31
    }
    return monthLookup[month]
}

function calculateDays(dateString) {
    // Check for multiple dates
    let dayCount = 0;
    let dates = dateString.split(",");
    console.log(dates)
    //yearMonth = _get("#month-select").value
    const firstOfMonth = `${yearMonth}-01`
    const lastDay = lastOfMonthLookup(yearMonth.slice(0, 4), yearMonth.slice(5, 7))
    const lastOfMonth = `${yearMonth}-${lastDay}`
    console.log("lastOfMonth:", lastOfMonth)
    console.log(lastOfMonth)

    for (let d of dates) {
        // If just one day booked
        if (d.length === 10) {
            dayCount += 1;
        }
        // if more days are booked
        else if (d.length > 15) {
           let [start, stop] = d.split(" - ")
           console.log(`start: ${start}, stop: ${stop}`)
           start = (start > firstOfMonth) ? start : firstOfMonth;
           stop = (stop < lastOfMonth) ? stop : lastOfMonth;
           let startNr = Number(start.slice(8, 10));
           let stopNr = Number(stop.slice(8, 10));
           let dayDiff = stopNr - startNr
           dayCount += dayDiff +1; 
           
        }
        else {
            console.log("Some error with date measurement")
            return "error";
        }
    }
    
    return dayCount;

}

function compareUniqueFieldName( a, b ) {
    if ( a.unique_field_name  < b.unique_field_name  ){
      return -1;
    }
    if ( a.unique_field_name  > b.unique_field_name  ){
      return 1;
    }
    return 0;
  }

function handleFileInput() {
    //e.preventDefault()

    const files = _get("#file-input").files;
    yearMonth = _get("#month-select").value;
    console.log("Month value:", yearMonth);
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
            rowObj.dates = formatDate(row[DATES]);
            rowObj.name = row[NAME];
            rowObj.second_name = row[S_NAME];
            rowObj.detail = row[DETAIL];
            rowObj.unique_field_name = row[UF_NAME];
            rowObj.days_in_month = calculateDays(rowObj.dates)
            rowObjects.push(rowObj)
        }
        rowObjects.sort(compareUniqueFieldName)
        console.log("Row Objects:", rowObjects)
    }

}

simpBtn.addEventListener("click", handleFileInput);