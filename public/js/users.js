
document.addEventListener("DOMContentLoaded", function() {
    const table = $('#myTable').DataTable({ responsive: true });
    const checkboxes = document.querySelectorAll('.flexSwitchCheck');
    const deletebtns = document.querySelectorAll('.deletebtn');
    const sizeSelect = document.getElementById('sizes');
    const sizeTable = document.getElementById('sizeTable');
    const sizeTableBody = document.getElementById('sizeTableBody');
    const addSizeBtn = document.getElementById("addsize");
    const imageSelect = document.querySelectorAll(".imgSelect");
    const editProductForm = document.getElementById('editProductForm');
    const productForm = document.getElementById('productForm');

    
    checkboxes?.forEach(checkbox => {
        const spanElement = checkbox.closest('.form-check').querySelector('.form-switch span');;

        checkbox.addEventListener('change',async function() {
            const id = this.dataset.id;
            const route = this.checked ? `block-user/${id}` : `unblock-user/${id}`;
            if(this.checked){ spanElement.textContent= 'Blocked'; }
            else spanElement.textContent = '';
            
            await fetch(route, {method: 'GET',});
        });
    });

    deletebtns?.forEach(deletebtn => {       
        deletebtn.addEventListener('click',async function(event) {
          event.preventDefault(); 
          const confirmDelete = confirm('Are you sure you want to delete?'); 
          
          if (confirmDelete) {
              window.location.href = deletebtn.getAttribute('href');
          }
        });
    });

   
    sizeSelect?.addEventListener('change', function () {
        const selectedSize = sizeSelect.value.toUpperCase();

        const existingRow = Array.from(sizeTableBody.children).find(row => {
            const sizeInput = row.querySelector('input[type="text"]').value.toUpperCase();
            return sizeInput === selectedSize;
        });
        if (selectedSize && !existingRow) {
            // Show the table if it's not visible
            if (sizeTable.style.display === 'none') {
                sizeTable.style.display = 'block';
            }

            // Populate the table with selected size name and stock count input field
            sizeTableBody.innerHTML += `
                <tr data-size="${selectedSize}">
                    <td><input type="text" value=${selectedSize}></td>
                    <td>
                        <div class="size-addInfo">
                            <table cellpadding="0" cellspacing="0" border="0" class="addInfo-table">
                                <tbody class="infoTableBody"></tbody>
                            </table>    
                            <div class="addInfo-add-row">
                                <span class="add-row-btn text-center">+</span>
                            </div>
                        </div>
                    </td>
                </tr>`;
        }
    });

    sizeTableBody?.addEventListener('click', function (e) {
        const target = e.target;
        if (target.classList.contains('add-row-btn')) {
            
            const htmlString = `
                <tr>
                    <td class="addInfo-table-cell">
                        <input type="text" class="addInfo-text color" placeholder="color">
                    </td>
                    <td class="addInfo-table-cell">
                        <input type="text" class="addInfo-text stock" placeholder="stock">
                    </td>
                    <td class="addInfo-table-cell">
                        <button class="del-row-btn">x</button>
                    </td>
                </tr>`;
            const infoTableBody = target.closest('.size-addInfo').querySelector('.infoTableBody');
            infoTableBody.insertAdjacentHTML('beforeend', htmlString);
        }

        if (target.classList.contains('del-row-btn')) {
            const row = target.closest('tr');
            row?.remove();
        }
    });

    addSizeBtn?.addEventListener('click', function () {
        const input = document.getElementById("newSizeInput");
        const optionValue = input.value.trim().toUpperCase(); // Convert to lowercase
    
        // Check if the option already exists in the select dropdown (case-insensitive)
        const optionExists = Array.from(sizeSelect.options).some(option => 
            option.value.toLowerCase() === optionValue.toLowerCase());
    
        if (optionValue && !optionExists) {
            const option = document.createElement("option");
            option.text = optionValue;
            option.value = optionValue;
            sizeSelect.add(option);
            input.value = "";
        }
    });

    productForm?.addEventListener('submit', function (event) {
        event.preventDefault();
        colorStock();
        productForm.submit();
    });


    imageSelect?.forEach(function(item){
        const imageInput = item.querySelector(".upload");
        const imagePreview = item.querySelector('.imagePreview');
        
        imageInput?.addEventListener('change', function() {
            const selectedFile = imageInput.files[0];
        
            if (selectedFile) {
                const reader = new FileReader();
      
                reader.onload = function(event) {
                    const imgElement = document.createElement('img');
                    imgElement.src = event.target.result;
                    imgElement.alt = 'Image Preview';
                    imgElement.style.width = '150px';    
                    imagePreview.innerHTML = ''; // Clear previous previews
                    imagePreview.appendChild(imgElement);
                };
                reader.readAsDataURL(selectedFile);
            } else { imagePreview.innerHTML = ''; }
        });
    });
    
    if(editProductForm){
        const existingData = new FormData(editProductForm);

        editProductForm?.addEventListener('submit', function (event) {
            event.preventDefault();
            
            let  changedData = {}
            let slug = document.getElementById('slug').value;
            colorStock();
            let updatedForm = new FormData(editProductForm);

            for(const pair of updatedForm.entries()){
                const fieldName = pair[0];
                const fieldValue = pair[1];
                const existingValue = existingData.get(fieldName);
         
                if (fieldValue instanceof File) {
                    if (fieldValue.name !== existingValue && fieldValue.name) {
                        changedData[fieldName] = fieldValue;
                    }
                }else{
                    if (existingValue === undefined || fieldValue !== existingValue) {
                        changedData[fieldName] = fieldValue;
                    }
                }    
            }
            const formDataToSend = new FormData();
            for (const key in changedData) formDataToSend.append(key, changedData[key]);
    
            fetch(`/admin/edit-product/${slug}`, {
                method: 'PATCH',
                body: formDataToSend,
                }).then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                }).then(data => { 
                    if (data.redirect) window.location.href = data.redirect;    
                }).catch(error => { console.error('Error:', error); });
        });
    }
});

function colorStock(){
    const sizeData = {};
    const sizeDataInput = document.getElementById('sizeDataInput');
    const sizeRows = Array.from(sizeTableBody.children);
    
    sizeRows?.forEach(row => {
        const size = row.querySelector('td:first-child input').value.toUpperCase();
        const colorCells = Array.from(row.querySelectorAll('.addInfo-text.color'));
        const stockCells = Array.from(row.querySelectorAll('.addInfo-text.stock'));
        const sizeInfo = [];

        for (let i = 0; i < colorCells.length; i++) {
            const color = colorCells[i].value.trim();
            const stock = parseInt(stockCells[i].value, 10);
            sizeInfo.push({ color, stock });
        }
        sizeData[size] = sizeInfo;
    }); 
    sizeDataInput.value = JSON.stringify(sizeData);
}
