
document.addEventListener('DOMContentLoaded', function() {

'use strict';

/* ===== Enable Bootstrap Popover (on element) ====== */
const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
popoverTriggerList.forEach((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl));

/* ==== Enable Bootstrap Alert ====== */
const alertList = document.querySelectorAll('.alert');
alertList.forEach((alert) => new bootstrap.Alert(alert));

/* ===== Responsive Sidepanel ====== */
const table = $('#myTable').DataTable({ responsive: true });
const sidePanelToggler = document.getElementById('sidepanel-toggler');
const sidePanel = document.getElementById('app-sidepanel');
const sidePanelDrop = document.getElementById('sidepanel-drop');
const sidePanelClose = document.getElementById('sidepanel-close');
const searchMobileTrigger = document.querySelector('.search-mobile-trigger');
const searchBox = document.querySelector('.app-search-box');



    function initTooltips(){
        document.querySelectorAll(".address-tooltip-trigger")?.forEach(function (trigger) {
            const tooltip = new bootstrap.Tooltip(trigger, {
                title: () => {
                    const addresses = Array.from(trigger.nextElementSibling.querySelectorAll('.address'))?.
                    map((address, index) => `
                        <div class="row text-start">
                            <div class="col-1">${index + 1}</div>
                            <div class="col-9 text-start">${address.textContent}</div>
                        </div>
                    `).join('');
                    
                    return addresses;
                },
                placement: "top", // Adjust placement as needed
                html: true, // Enable HTML content
            });
        });

        document.querySelectorAll('.sizes-tooltip-trigger')?.forEach(function (trigger) {
            const tooltip = new bootstrap.Tooltip(trigger, {
                title: () => {
                    const tableRows = Array.from(trigger.nextElementSibling.querySelectorAll('.sizerow'))?.
                        map(row => `
                            <div class="d-flex justify-content-between">
                                <div class="text-start">${row.querySelector('.size').textContent}</div>
                                <div class="text-start">${row.querySelector('.stock').textContent}</div>
                            </div>`).join('');
    
                    return `
                        <div class="custom-tooltip-content">
                            <div class="d-flex justify-content-between">
                                <div class="text-center">size</div>
                                <div class="text-center">stock</div>
                            </div> 
                            ${tableRows}
                        </div>`;
                },
                placement: "top", // Adjust placement as needed
                html: true, // Enable HTML content
            });
        });


        document.querySelectorAll('.moreinfo-tooltip-trigger')?.forEach(function (trigger){
            const tooltip = new bootstrap.Tooltip(trigger, {
                title: () => {
                    const tableRows = Array.from(trigger.nextElementSibling.querySelectorAll('.inforow'))?.
                        map(row => `
                            <div class="d-flex justify-content-between">
                                <div class="text-start">${row.querySelector('.attribute').textContent}</div>
                                <div class="text-start">${row.querySelector('.value').textContent}</div>
                            </div>`).join('');
    
                    return `
                        <div class="custom-info-tooltip">
                            ${tableRows}
                        </div>`;
                },
                placement: "top", // Adjust placement as needed
                html: true, // Enable HTML content
            });
        });

        document.querySelectorAll('[data-bs-toggle="tooltip"]')?.forEach(function(tooltipTriggerEl) {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    initTooltips();

    table?.on('draw.dt', function () { initTooltips() });

    window.addEventListener('load', function () {
        responsiveSidePanel();
    });
    
    window.addEventListener('resize', function () {
        responsiveSidePanel();
    });
    
    function responsiveSidePanel() {
        let w = window.innerWidth;
        if (w >= 1200) {
            sidePanel.classList.remove('sidepanel-hidden');
            sidePanel.classList.add('sidepanel-visible');
        } else {
            sidePanel.classList.remove('sidepanel-visible');
            sidePanel.classList.add('sidepanel-hidden');
        }
    }

    sidePanelToggler?.addEventListener('click', () => {
        if (sidePanel.classList.contains('sidepanel-visible')) {
            sidePanel.classList.remove('sidepanel-visible');
            sidePanel.classList.add('sidepanel-hidden');
        } else {
            sidePanel.classList.remove('sidepanel-hidden');
            sidePanel.classList.add('sidepanel-visible');
        }
    });

    sidePanelClose?.addEventListener('click', (e) => {
        e.preventDefault();
        sidePanelToggler.click();
    });
    
    sidePanelDrop?.addEventListener('click', (e) => {
        sidePanelToggler.click();
    });
    
    /* ====== Mobile search ======= */
    
    
    searchMobileTrigger?.addEventListener('click', () => {
        searchBox.classList.toggle('is-visible');
        const searchMobileTriggerIcon = document.querySelector('.search-mobile-trigger-icon');
    
        if (searchMobileTriggerIcon.classList.contains('fa-magnifying-glass')) {
            searchMobileTriggerIcon.classList.remove('fa-magnifying-glass');
            searchMobileTriggerIcon.classList.add('fa-xmark');
        } else {
            searchMobileTriggerIcon.classList.remove('fa-xmark');
            searchMobileTriggerIcon.classList.add('fa-magnifying-glass');
        }
    });

    

});