// Uncompressed script. DokuWikis JS compressor does not support ASI. To be compressed with https://closure-compiler.appspot.com/ (SIMPLE)

window.mobileTables = ((options) => {

    options = options || {}

    // A CSS query selector to find all tables to be transformed.
    const selector = options.selector || "table"

    // A callback to determine the index column of a table.
    const parseColumnIndex = options.parseColumnIndex || (node => -1)

    // Special schema values that are not repeated on the mobile table. Instead a cell with colspan = 2 is created.
    const hideHeadings = options.hideHeadings || []

    // Holds references to the original <table> elements to undo the transformation.
    const tableMap = new WeakMap()

    // Holds references to the transformed <th> and <td> elements to undo the transformation.
    const cellMap = new WeakMap()

    // Indicates that a cell should be treated as part of the index column.
    const indexColumn = Symbol("index")

    // Indicates that the cell heading should not be shown. The resulting cell will span both columns.
    const hiddenHeading = Symbol("hidden")

    // Creates an array of header cells that can be cloned for each "row" of the mobile version of the table.
    const extractSchema = (table, columnIndex) => {
        const schema = []

        // Get the schema from the first row.
        const row = table.querySelector("tr")
        let i = 0

        for (let cell of row.children) {
            const colSpan = cell.colSpan
            let indexSpan = 0

            // Add a cell one or more times to the schema (adjusting for colspan).
            while (indexSpan < colSpan) {
                if (i === columnIndex) {
                    schema.push(indexColumn)
                } else if (hideHeadings.includes(cell.innerText.trim())) {
                    schema.push(hiddenHeading)
                } else {
                    let td = document.createElement("td")
                    td.innerHTML = cell.innerHTML
                    schema.push(td)
                }

                i = i + 1
                indexSpan = indexSpan + 1
            }
        }

        return schema
    }

    const isTextCell = cell => cell.childNodes.length === 1 && cell.lastChild.nodeName === "#text"

    // Move cell contents instead of cloning to keep attached event handlers (footnotes etc.).
    const moveContent = (oldCell, newCell) => {
        // Text nodes can just be copied.
        if (isTextCell(oldCell)) {
            newCell.innerText = oldCell.innerText
            return false
        }

        //newCell.append(...oldCell.childNodes)
        while (oldCell.firstChild) {
            newCell.appendChild(oldCell.firstChild)
        }
        return true
    }

    const addRow = tbody => {
        const tr = document.createElement("tr")
        tbody.appendChild(tr)
        return tr
    }

    // Adds a cell containing content moved from the original table.
    const addCell = (tr, cell, colSpan) => {
        const newCell = cell.cloneNode(false)
        if (colSpan) {
            newCell.colSpan = 2
        }

        if (moveContent(cell, newCell)) {
            cellMap.set(cell, newCell)
        }
        tr.appendChild(newCell)

        return newCell
    }

    const addHeaderCell = (tr, cell) => {
        const newCell = document.createElement("th")
        newCell.colSpan = 2
        // Copy the CSS class for alignement etc.
        newCell.className = cell.className

        if (moveContent(cell, newCell)) {
            cellMap.set(cell, newCell)
        }
        tr.appendChild(newCell)

        //return newCell
    }

    const addNameCell = (tr, name) => {
        let cell

        if (isTextCell(name)) {
            cell = document.createElement("td")
            cell.innerText = name.innerText
        } else {
            cell = name.cloneNode(true)
        }

        tr.appendChild(cell)

        //return cell
    }

    const buildTable = (table, schema) => {
        const columnIndex = schema.indexOf(indexColumn)

        // Create shallow copies of the table and tbody.
        const newTable = table.cloneNode(false)
        const tbody = table.querySelector("tbody").cloneNode(false)
        newTable.appendChild(tbody)

        // Check for rowspans that need to be skipped.
        let rowSpans = new Array(schema.length).fill(0)

        let skip = true

        // Iterating all children of the <tbody> is not sufficient as there may be multiple <tr> elements inside <thead>.
        for (let row of table.querySelectorAll("tr")) {
            // Skip the first tow (header)
            if (skip) {
                skip = false
                continue
            }

            // A random header row appeared!
            if (row.children.length === 1) {
                addCell(addRow(tbody), row.firstElementChild, true)
                continue
            }

            // If there is an index column, create a header row.
            const header = (columnIndex !== -1) ? addRow(tbody) : null

            // Check for colspans that need to be converted to rowspans.
            let i = 0
            let rowSpan = 1

            let colOffset = 0

            for (let name of schema) {
                if (rowSpans[i] > 0) {
                    rowSpans[i] = rowSpans[i] - 1
                    colOffset = colOffset + 1
                    i = i + 1
                    continue
                }

                if (row.children[i - colOffset] === undefined) {
                    console.log("mobileTables: Unsupported table layout:")
                    console.log(row)
                    break
                }

                if (i === columnIndex) {
                    // The index column has already been created above, add the content.
                    addHeaderCell(header, row.children[i - colOffset])
                } else {
                    const tr = addRow(tbody)
                    if (name !== hiddenHeading) {
                        addNameCell(tr, name)
                    }

                    const colSpan = row.children[i - colOffset].colSpan
                    rowSpans[i] = row.children[i - colOffset].rowSpan - 1

                    if (rowSpan === 1) {
                        const newCell = addCell(tr, row.children[i - colOffset], name === hiddenHeading)
                        newCell.rowSpan = colSpan
                    }

                    rowSpan = (rowSpan === 1) ? colSpan : rowSpan - 1
                    if (rowSpan > 1) {
                        continue
                    }
                }

                i = i + 1
            }
        }

        return newTable
    }

    const replaceWithDummy = table => {
        // Create a dummy element to take the place of the table so we can modify it outside the document tree.
        const dummy = document.createElement("div")
        table.replaceWith(dummy)
        return dummy
    }

    const transform = tables => {
        tables = tables || document.querySelectorAll(selector)

        let mutation = false

        for (let table of tables) {
            if (tableMap.has(table) || table.classList.has("mobiletable-transformed")) {
                return
            }

            const columnIndex = parseColumnIndex(table)

            // Create the mobile table.
            const dummy = replaceWithDummy(table)
            const mobile = buildTable(table, extractSchema(table, columnIndex))

            // Replace the original table and save it for later.
            tableMap.set(mobile, table)
            dummy.replaceWith(mobile)

           table.classList.add("mobiletable-transformed")

            mutation = true
        }

        return mutation
    }

    const undo = tables => {
        tables = tables || document.querySelectorAll(selector)

        let mutation = false

        for (let table of tables) {
            const original = tableMap.get(table)

            if (original === undefined) {
                //console.log("mobileTables: Cannot find original for table:")
                //console.log(table)
                continue
            }

            const dummy = replaceWithDummy(table)

            // Move the cell contents back to the original table.
            for (let cell of original.querySelectorAll("td, th")) {
                const transformed = cellMap.get(cell)

                if (transformed !== undefined) {
                    moveContent(transformed, cell)
                }
            }

            dummy.replaceWith(original)

            table.classList.remove("mobiletable-transformed")

            mutation = true
        }

        return mutation
    }

    return (isMobile, tables) => isMobile ? transform(tables) : undo(tables)

})({
    selector: "div.page div.mobiletable table",
    parseColumnIndex: node => {
        const index = parseInt(node.parentElement.parentElement.getAttribute("data-column"), 10)
        return (isNaN(index) || index < 0) ? -1 : index
    },
    hideHeadings: window.JSINFO["plugin_mobiletable_hideHeadings"] || []
})


window.checkMobileTables = () => {
    const div = document.querySelector("div.mobiletable")

    if (!div) {
        return
    }

    const before = window.getComputedStyle(div, ":before")
        .getPropertyValue("content")
        .replace(/"|'/g, "")

    if (window.mobileTables(before === "mobile") && window.location.hash) {
        // Scroll to anchor after transformation.
        window.location.hash = window.location.hash
    }
}

// document.ready
(cb => ["complete", "interactive"].includes(document.readyState) ? setTimeout(cb, 0) : document.addEventListener("DOMContentLoaded", cb))(() => {

    let resizeTimer

    window.addEventListener("resize", () => {
        if (resizeTimer) {
            clearTimeout(resizeTimer)
        }
        resizeTimer = setTimeout(window.checkMobileTables, 200)
    })

    window.checkMobileTables()
})
