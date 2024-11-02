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

    // Sample two-dimensional data
    const sampleTableData = [
        ['Header 1', 'Header 2', 'Header 3'],
        ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
        ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3'],
        ['Row 3, Col 1', 'Row 3, Col 2', 'Row 3, Col 3']
    ];

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
            max-width:600px;
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

    // Define the function to capture elements and log the length
    function captureElements() {
        const elements = document.querySelectorAll('.dual-product-table-content .dual-product-table-content-list .content-list-item'); // Replace with your actual selector
        console.log("Number of elements:", elements.length);

        // Optional: Loop through and log each element if needed
        elements.forEach((pkg, index) => {
            console.log(`Element ${index + 1} =>`);

            const term = pkg.querySelector('p');
            if (term) {
                console.log("term spec: ", term.innerText);
            }

            const plans = pkg.querySelectorAll('.content-list-line');

            plans.forEach((line, index) => {
                console.log(`Line ${index + 1} =>`);

                const price = line.querySelectorAll('.content-table-price-width')[0];
                if (price) {
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
            })
        });

        renderTable(sampleTableData);
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
