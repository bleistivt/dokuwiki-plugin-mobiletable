window.mobileTables = ((options) => {

    options = options || {}

    // A CSS query selector to find all tables to be transformed.
    const selector = options.selector || "table"

    // A callback to determine the index column of a table.
    const parseColumnIndex = options.parseColumnIndex || (node => -1)

    // Special schema values that are not repeated on the mobile table. Instead a cell with colspan = 2 is created.
    const hideHeadings = options.hideHeadings || []

    // Holds references to the original <table> elements to undo the transformation.
    const tables = new WeakMap()

    // Holds references to the transformed <th> and <td> elements to undo the transformation.
    const cells = new WeakMap()

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
                } else if (hideHeadings.includes(cell.innerText)) {
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
            cells.set(cell, newCell)
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
            cells.set(cell, newCell)
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

            for (let name of schema) {
                if (row.children[i] === undefined) {
                    console.log("mobileTables: Unsupported table layout:")
                    console.log(row)
                    break
                }

                if (i === columnIndex) {
                    // The index column has already been created above, add the content.
                    addHeaderCell(header, row.children[i])
                } else {
                    const tr = addRow(tbody)
                    if (name !== hiddenHeading) {
                        addNameCell(tr, name)
                    }

                    const colSpan = row.children[i].colSpan

                    if (rowSpan === 1) {
                        const newCell = addCell(tr, row.children[i], name === hiddenHeading)
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

    const transform = doc => {
        doc = doc || document

        for (let table of doc.querySelectorAll(selector)) {
            if (tables.has(table)) {
                return
            }

            const columnIndex = parseColumnIndex(table)

            // Create the mobile table.
            const dummy = replaceWithDummy(table)
            const mobile = buildTable(table, extractSchema(table, columnIndex))

            // Replace the original table and save it for later.
            tables.set(mobile, table)
            dummy.replaceWith(mobile)
        }
    }

    const undo = doc => {
        doc = doc || document

        for (let table of doc.querySelectorAll(selector)) {
            const original = tables.get(table)

            if (original === undefined) {
                console.log("mobileTables: Cannot find original for table:")
                console.log(table)
                continue
            }

            const dummy = replaceWithDummy(table)

            // Move the cell contents back to the original table.
            for (let cell of original.querySelectorAll("td, th")) {
                const transformed = cells.get(cell)

                if (transformed !== undefined) {
                    moveContent(transformed, cell)
                }
            }

            dummy.replaceWith(original)
        }
    }

    return (isMobile, doc) => isMobile ? transform(doc) : undo(doc)

})({
    selector: "div.page div.mobiletable table",
    parseColumnIndex: node => {
        const index = parseInt(node.parentElement.parentElement.getAttribute("data-column"), 10)
        return (isNaN(index) || index < 0) ? -1 : index
    },
    hideHeadings: ["image", "Image", "Bild"]
})


window.checkMobileTables = () => {
    const div = document.querySelector("div.mobiletable")

    if (!div) {
        return
    }

    const before = window.getComputedStyle(div, ":before")
        .getPropertyValue("content")
        .replace(/"|'/g, "")

    window.mobileTables(before === "mobile")
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
