// ==UserScript==
// @name         Show Dual Table
// @namespace    http://tampermonkey.net/
// @version      2024-11-01
// @description  Showing all the dual invest plans in a table
// @author       iejr
// @match        https://www.okx.com/earn/dual
// @icon         https://www.google.com/s2/favicons?sz=64&domain=okx.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Inject CSS for the modal and table
    const style = document.createElement('style');
    style.innerHTML = `
        #modal {
            display:none;
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background-color:rgba(0,0,0,0.7);
            z-index:1000;
        }
        #modal > div {
            background:white;
            padding:20px;
            margin:50px auto;
            width:80%;
            max-width:1600px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    `;
    document.head.appendChild(style);

    // Inject the HTML structure for the modal
    const modalHtml = `
        <div id="modal">
            <div>
                <h2>Data Table</h2>
                <table id="dataTable">
                    <thead>
                        <tr></tr>
                    </thead>
                    <tbody>
                        <!-- Table data will be injected here -->
                    </tbody>
                </table>
                <button id="closeModal" style="margin-top: 20px;">Close</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Function to render the table in the modal
    function renderTable(data, highlightIdx) {
        const tableHead = document.querySelector('#dataTable thead tr');
        const tableBody = document.querySelector('#dataTable tbody');

        // Clear existing content
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        // Populate the header
        const headerRow = data[0];
        headerRow.forEach(header => {
            const th = document.createElement('th');
            th.innerText = header;
            tableHead.appendChild(th);
        });

        // Populate the body
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const tr = document.createElement('tr');

            row.forEach((cell, j) => {
                const td = document.createElement('td');
                td.innerText = cell;
                if (highlightIdx[i] && highlightIdx[i] == j) {
                    td.style.backgroundColor = 'yellow';
                    td.style.fontWeight = 'bold'; // Make the font bold
                }

                tr.appendChild(td);
            });

            tableBody.appendChild(tr);
        }

        // Show the modal
        document.getElementById('modal').style.display = 'block';
    }

    // Function to close the modal
    function closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    // Add event listener for the close button
    document.getElementById('closeModal').addEventListener('click', closeModal);

    function parseCurrency(str) {
        return parseFloat(str.replace(/[^\d.-]/g, ""));
    }

    function processPriceField(raw, maxSize) {
        const segments = raw.split('\n');

        let result = Array(maxSize).fill(null);
        for (let i = 0; i < segments.length && i < result.length; i++) {
            result[i] = segments[i];
        }

        return result;
    }

    function parseApyField(raw) {
        const segments = raw.split('\n');

        if (segments.length > 0) {
            return segments[0];
        }
        return raw;
    }

    // Function to insert <x, y> into table at column j
    function insertPair(table, x, y, j) {
        let found = false;

        // Check each row to see if the first element matches x
        for (let i = 0; i < table.length; i++) {
            if (table[i][0] === x) {
                // Ensure the row has enough columns to insert at position j
                while (table[i].length <= j) {
                    table[i].push(null);
                }
                table[i][j] = y;
                found = true;
                break;
            }
        }

        // If x was not found, create a new row
        if (!found) {
            const newRow = Array(j + 1).fill(null);
            newRow[0] = x;
            newRow[j] = y;
            table.push(newRow);
        }
    }

    // Define the function to capture elements and log the length
    function captureElements() {
        // Initialize planTable as an array of rows (1x1 initially)
        let planTable = [['dummy']];

        const elements = document.querySelectorAll('.dual-product-table-content .dual-product-table-content-list .content-list-item');

        // Optional: Loop through and log each element if needed
        elements.forEach((pkg, j) => {

            const term = pkg.querySelector('p');
            if (term) {
                planTable[0].push(term.innerText);
            } else {
                planTable[0].push('undefined');
            }

            const plans = pkg.querySelectorAll('.content-list-line');

            plans.forEach((line, i) => {

                const price = line.querySelectorAll('.content-table-price-width')[0];
                const apy = line.querySelectorAll('.content-table-apy-width')[0];
                if (price && apy) {
                    insertPair(planTable, price.innerText, parseApyField(apy.innerText), j + 1);
                } else {
                    console.log("\tNo <div price> or <div apy> element found");
                }

            })
        });

        const resultTable = genRenderTable(planTable);
        const highlightIdx = getOptimal(resultTable);
        renderTable(resultTable, highlightIdx);
    }

    function genRenderTable(table) {
        const metadataHeader = ["Price", "%"];
        const metadataHeaderLen = metadataHeader.length;
        const height = table.length;
        const width = table[0].length + 1;


        let outputTable = [metadataHeader];

        // process header
        for (let j = 1; j < table[0].length; j++) {
            outputTable[0].push(table[0][j]);
        }

        for (let i = 1; i < height; i++) {
            // process rate
            const metadata = processPriceField(table[i][0], metadataHeaderLen);
            outputTable.push(metadata);

            for (let j = 1; j < table[i].length; j++) {
                outputTable[i].push(table[i][j]);
            }
            while (outputTable[i].length < width) {
                outputTable[i].push(null);
            }
        }

        sortTable(outputTable, 0);
        return outputTable;
    }

    function sortTable(table, j) {
      table.sort((a, b) => {
          // Handle cases where the value in column j might be null or undefined
          const valA = parseCurrency(a[j]) ?? Infinity; // Use Infinity so null/undefined values go to the end
          const valB = parseCurrency(b[j]) ?? Infinity;
          return valB - valA; // Sort in descending order
      });
    }

    function getOptimal(table) {
        let optChoice = [null];
        for (let i = 1; i < table.length; i++) {
            let optVal = null;
            let optIdx = -1;
            for (let j = 2; j < table[i].length; j++) {
                if (!table[i][j]) {
                    continue;
                }
                const pureVal = parseFloat(table[i][j]);
                if (optIdx < 0 || pureVal > optVal) {
                    optIdx = j;
                    optVal = pureVal;
                }
            }
            optChoice.push(optIdx);
        }
        return optChoice;
    }

    // Create a button to trigger the function manually
    function addTriggerButton() {
        const button = document.createElement("button");
        button.innerText = "Trigger Capture";
        button.style.position = "fixed";
        button.style.top = "80px";
        button.style.left = "10px";
        button.style.zIndex = "9999";
        button.onclick = captureElements;
        document.body.appendChild(button);
    }

    // Wait for the page to load before adding the button
    window.addEventListener('load', addTriggerButton);
})();
