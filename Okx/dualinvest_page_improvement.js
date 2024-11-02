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
    function renderTable(data) {
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

            row.forEach(cell => {
                const td = document.createElement('td');
                td.innerText = cell;
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

    function stringToHex(str) {
        let hexString = '';
        for (let i = 0; i < str.length; i++) {
            // Get the Unicode code of the character, then convert it to a hex string
            const hex = str.charCodeAt(i).toString(16);
            hexString += hex.padStart(2, '0'); // Ensure each hex code is 2 digits
        }
        return hexString;
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
        let planTable = [['initial']];

        const elements = document.querySelectorAll('.dual-product-table-content .dual-product-table-content-list .content-list-item'); // Replace with your actual selector
        console.log("Number of elements:", elements.length);

        // Optional: Loop through and log each element if needed
        elements.forEach((pkg, j) => {
            console.log(`Element ${j + 1} =>`);

            const term = pkg.querySelector('p');
            if (term) {
                planTable[0].push(term.innerText);
                console.log("term spec: ", term.innerText);
            } else {
                planTable[0].push('undefined');
            }

            const plans = pkg.querySelectorAll('.content-list-line');

            plans.forEach((line, i) => {
                console.log(`Line ${i + 1} =>`);

                const price = line.querySelectorAll('.content-table-price-width')[0];
                if (price) {
                    const price_val = stringToHex(price.innerText);
                    console.log("\tprice => ", price.innerText);
                } else {
                    console.log("\tNo <div price> element found");
                }

                const expire = line.querySelectorAll('.content-table-expire-width')[0];
                if (expire) {
                    console.log("\texpire => ", expire.innerText);
                } else {
                    console.log("\tNo <div expire> element found");
                }

                const apy = line.querySelectorAll('.content-table-apy-width')[0];
                if (apy) {
                    console.log("\tAPY => ", apy.innerText);
                } else {
                    console.log("\tNo <div apy> element found");
                }

                insertPair(planTable, price.innerText, apy.innerText, j + 1);
            })
        });

        renderTable(planTable);
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
