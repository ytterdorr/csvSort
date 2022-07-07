function _get(elString) {
    return document.querySelector(elString);
}

function _create(elementString, innerHTML = "") {
    return Object.assign(document.createElement(elementString), { innerHTML })
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/geral/utf-8 [rev. #1]

var UTF8 = {
    encode: function (s) {
        for (var c, i = -1, l = (s = s.split("")).length, o = String.fromCharCode; ++i < l;
            s[i] = (c = s[i].charCodeAt(0)) >= 127 ? o(0xc0 | (c >>> 6)) + o(0x80 | (c & 0x3f)) : s[i]
        );
        return s.join("");
    },
    decode: function (s) {
        for (var a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;
            ((a = s[i][c](0)) & 0x80) &&
            (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?
                o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
        );
        return s.join("");
    }
};

const monthLookup = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]

let simpBtn = _get("#simplify-button");
let msgBox = _get("#msg-box");
let yearMonth;
let csvContent;

_get("#download-pdf").addEventListener("click", printPDF)
_get("#download-csv").addEventListener("click", downloadCSV)

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

function printPDF() {
    window.print();
}

function createCSVContent(rowObjects) {
    console.log(rowObjects)
    let month = monthLookup[new Date(_get("#month-select").value).getMonth()]
    csvContent = `Bokningstyp\tDatum\tDagar i ${month}\tObs\tFörnamn\tEfternamn\tu_field\tDetaljer\tFaktura`

    for (let obj of rowObjects) {
        csvContent += `\n${obj.booking_type}\t${obj.dates}\t${obj.days_in_month}\t${obj.month_crossover ? "x" : " "}\t${obj.name}\t${obj.second_name}\t${obj.unique_field_name}\t${obj.detail}\t  `
    }

    console.log("csvContent:", csvContent)

}

function downloadCSV() {
    console.log("Download csv")
    let yearMonth = _get("#month-select").value

    // This download funciton is stolen from: Arne H. Bitubekk
    // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
    // who got it from dandavis: dandavis https://stackoverflow.com/a/16377813/1350598
    var download = function (content, fileName, mimeType) {
        var a = document.createElement('a');
        mimeType = mimeType || 'application/octet-stream';

        if (navigator.msSaveBlob) { // IE10
            navigator.msSaveBlob(new Blob([content], {
                type: mimeType
            }), fileName);
        } else if (URL && 'download' in a) { //html5 A[download]
            a.href = URL.createObjectURL(new Blob([content], {
                type: mimeType
            }));
            a.setAttribute('download', fileName);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
        }
    }

    download(csvContent, `bokningar_${yearMonth}.tsv`, 'text/csv;encoding:utf-8');
}

function calculateDays(rowObj) {
    let dateString = rowObj.dates
    // Check for multiple dates
    let dayCount = 0;
    let dates = dateString.split(",");
    //console.log(dates)
    //yearMonth = _get("#month-select").value
    yearMonth = _get("#month-select").value;
    const firstOfMonth = String(`${yearMonth}-01`)
    const lastDay = lastOfMonthLookup(yearMonth.slice(0, 4), yearMonth.slice(5, 7))
    const lastOfMonth = String(`${yearMonth}-${lastDay}`)
    //console.log(`firstOfMonth: ${firstOfMonth}`)
    //console.log("lastOfMonth:", lastOfMonth)

    for (let d of dates) {
        // If just one day booked
        if (d.length === 10 && d <= lastOfMonth && d >= firstOfMonth) {
            dayCount += 1;
        }
        // if more days are booked
        else if (d.length > 15) {
            let [start, stop] = d.split(" - ")
            //console.log(`start: ${start}, stop: ${stop}`)
            //console.log("start < firstOfMonth:", new Date(start) < new Date (firstOfMonth))
            // Check if month crossing

            // If both dates are out of bounds

            if (start > lastOfMonth || stop < firstOfMonth) {
                console.log(`date out of bounds, start: ${start}, stop: ${stop}`);
                continue
            }

            if (new Date(start) < new Date(firstOfMonth)) {
                start = firstOfMonth;
                rowObj.month_crossover = true;
            }

            if (stop > lastOfMonth) {
                stop = lastOfMonth;
                rowObj.month_crossover = true
            }



            // Calculate diff
            let startNr = Number(start.slice(8, 10));
            let stopNr = Number(stop.slice(8, 10));
            let dayDiff = stopNr - startNr
            dayCount += dayDiff + 1;

        }
        else {
            console.log("Some error with date measurement")
            return "error";
        }
    }
    //console.log("dayCount:", dayCount)
    rowObj.days_in_month = dayCount
    return rowObj;

}

function compareSecondName(a, b) {
    let aComp = a.second_name.toLowerCase()
    let bComp = b.second_name.toLowerCase()
    if (aComp < bComp) {
        return -1;
    }
    if (aComp > bComp) {
        return 1;
    }
    return 0;
}

function handleEndOfFiles(rowObjects) {
    createTable(rowObjects)
    createCSVContent(rowObjects)
    _get(".button-container").classList.remove("hidden")
}

function createTable(rowObjects) {
    console.log("rowObjects for table:", rowObjects)
    table = _get("#result-table");
    // Clear table
    table.innerHTML = "";

    let month = new Date(_get("#month-select").value).getMonth()
    let th = _create("tr", _create("th", "Bokningstyp").outerHTML +
        _create("th", "Datum").outerHTML +
        _create("th", `Dagar i ${monthLookup[month]}`).outerHTML +
        _create("th", "Obs").outerHTML +
        _create("th", "Förnamn").outerHTML +
        _create("th", "Efternamn").outerHTML +
        _create("th", "u_field").outerHTML +
        _create("th", "Detaljer").outerHTML +
        _create("th", "Faktura").outerHTML
    )
    let thead = _create("thead").appendChild(th)
    table.appendChild(thead)
    console.log(thead)

    // Table body
    let tbody = _create("tbody")

    for (let obj of rowObjects) {
        let row = _create("tr")

        let bookingType = _create("td", obj.booking_type)
        bookingType.classList.add("booking-type")
        row.appendChild(bookingType)


        // Date handle
        let datesTd = _create("td")
        datesTd.classList.add("dates")
        let dates = obj.dates.replace(",", ",<br />")
        datesTd.innerHTML = dates

        row.appendChild(datesTd)
        row.appendChild(_create("td", obj.days_in_month))
        row.appendChild(_create("td", obj.month_crossover ? "x" : ""))
        row.appendChild(_create("td", obj.name))
        row.appendChild(_create("td", obj.second_name))
        row.appendChild(_create("td", obj.unique_field_name))

        let detail = _create("td", obj.detail)
        detail.classList.add("detail")
        row.appendChild(detail)
        row.appendChild(_create("td", ""))
        tbody.appendChild(row)

    }

    console.log("tbody", tbody)

    table.appendChild(tbody)
}



async function handleFileInput() {
    //e.preventDefault()

    const files = _get("#file-input").files;
    yearMonth = _get("#month-select").value;
    //console.log("Month value:", yearMonth);

    // Escape if no month selected
    if (!yearMonth) {
        msgBox.innerHTML = "Ingen månad vald"
        return
    }

    // Escape if no file is seleted
    if (files.length <= 0) {
        msgBox.innerHTML = "Ingen fil vald"
        return
    }


    // Else work on file

    //console.log("First file", f)

    let fileCounter = 0
    //let f = files[0]

    rowObjects = []


    let reader = new FileReader();
    reader.onload = function (event) {
        let tsv = event.target.result;

        let parsed = Papa.parse(tsv);
        //console.log(result.meta.delimiter)
        let headers = parsed.data[0]
        let firstRow = parsed.data[1]
        let allRows = parsed.data.slice(1, parsed.data.length)
        //console.log("All rows:", allRows)

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
            rowObj = calculateDays(rowObj)
            rowObjects.push(rowObj)
        }
        rowObjects.sort(compareSecondName)
        fileCounter += 1

        // Read next file if there are more
        if (fileCounter < files.length) {
            reader.readAsText(files[fileCounter])
        }

        // Create table when finished
        else if (fileCounter == files.length) {
            handleEndOfFiles(rowObjects)
        }

        // let rowObjsWithmonth_crossover = rowObjects.filter(obj => obj.month_crossover);
        // console.log("rowObjsWithmonth_crossover:", rowObjsWithmonth_crossover)
        //console.log("Row Objects:", rowObjects)

    }
    // Start reading files
    reader.readAsText(files[0])






}

simpBtn.addEventListener("click", handleFileInput);