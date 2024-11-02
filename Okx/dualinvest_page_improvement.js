// ==UserScript==
// @name         Show Dual Table
// @namespace    http://tampermonkey.net/
// @version      2024-11-01
// @description  try to take over the world!
// @author       You
// @match        https://www.okx.com/earn/dual
// @icon         https://www.google.com/s2/favicons?sz=64&domain=okx.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    console.log("Debug start, naforuke");

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