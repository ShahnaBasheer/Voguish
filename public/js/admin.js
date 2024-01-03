
document.addEventListener("DOMContentLoaded", function() {
    
    const checkboxes = document.querySelectorAll('.flexSwitchCheck');
    const deletebtns = document.querySelectorAll('.deletebtn');
    const sizeSelect = document.getElementById('sizes');
    const sizeTable = document.getElementById('sizeTable');
    const sizeTableBody = document.getElementById('sizeTableBody');
    const addSizeBtn = document.getElementById("addsize");
    const editProductForm = document.getElementById('editProductForm');
    const productForm = document.getElementById('productForm'); 
    const editCouponButtons = document.querySelectorAll('.edit-coupon-btn');
    const editCouponModal = document.getElementById('editCouponModal');

    
    checkboxes?.forEach(checkbox => {
        checkbox.addEventListener('change',async function() {
            const id = this.dataset.id;
            const route = this.checked ? `block-user/${id}` : `unblock-user/${id}`;
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

    function productFormValidation() {
        const title = validateString('title', 'Invalid product title!');
        const gender = validateSelect('gender', 'Please select a valid gender!');
        const category = validateSelect('category', 'Please select a valid category!');
        const brand = validateSelect('brand', 'Please select a valid brand!');
        const discount = validateDiscount('discount', 'Invalid! Enter a discount from 0 to 99 only');
        const mrp = validateMRP('mrp', 'Invalid MRP!');
        const size = validateSize('Enter proper values for stock and count!');
        const images = validateImage('Upload at least 2 product images!');
        const description = validateDescription('description', 
                    'Invalid product description and Minimum 40 characters should be entered!');
        const more = validateMoreInfo('Invalid Input!');


        function validateString(id, errorMessage) {
            const value = document.getElementById(id).value.trim().replace(/\s{2,}/g, '');
            const isValid = /^(\S\s*){3,}$/.test(value);
            if (!isValid) {
                showError(id + '-message', errorMessage);
                return false;
            }else validMessage(id + '-message');
            return isValid;
        }
        
        function validateDescription(id, errorMessage) {
            const value = document.getElementById(id).value.trim().replace(/\s{2,}/g, '');
            const isValid = ( value === '') || /^(\S\s*){40,}$/.test(value);
            if (!isValid) {
                showError(id + '-message', errorMessage);
                return false;
            }else validMessage(id + '-message');
            return isValid;
        }
    
    
        function validateSelect(id, errorMessage) {
            const value = document.getElementById(id).value;
            const isValid = value !== '';
            if (!isValid) {
                showError(id + '-message', errorMessage);
                return false;
            }else validMessage(id + '-message');
            return isValid;
        }
    
        function validateDiscount(id, errorMessage) {
            const value = document.getElementById(id).value.trim();
            const isValid = /^[0-9]\d?$|^99$|^0$/.test(Number(value));
            if (!isValid) { 
                showError(id + '-message', errorMessage);
                return false;
            }else validMessage(id + '-message');   
            return isValid;
        }
    
        function validateMRP(id, errorMessage) {
            const value = document.getElementById(id).value.trim();
            const isValid = /^[1-9]\d{1,}$/.test(value);
            if (!isValid) {
                showError(id + '-message', errorMessage);
                return false;
            }else validMessage(id + '-message');
            return isValid;
        }
        
        function validateSize(errorMessage){
            const sizeDataInput = document.getElementById('sizeDataInput').value;
            const sizeData = JSON.parse(sizeDataInput);
    
            for (const size in sizeData) {
                if (sizeData.hasOwnProperty(size)) {
                    const sizeArray = sizeData[size];
        
                    // Check if sizeArray is empty
                    if (sizeArray.length === 0) {
                        showError('size-message', errorMessage);
                        return false;
                    }
        
                    // Check each object in the array
                    const isValid = sizeArray.every(obj => {
                        const isColorValid = typeof obj.color === 'string' &&
                            /^(\S\s*){3,}$/.test(obj.color.trim());
    
                        const isStockValid = /^[1-9]\d{0,}$/.test(obj.stock);
        
                        return isColorValid && isStockValid;
                    });
        
                    if (isValid) {
                        validMessage('size-message');
                        return true;
                    }
                }
            }
            showError('size-message', errorMessage);
            return false;
    
        }
    
        function validateImage(errorMessage){
            const images = document.querySelectorAll('.upload');
            const indices = Array.from(images).map(input => parseInt(input.dataset.index)).sort((a, b) => a - b);
            
            let nonConsecutiveIndex = null;
            for (let i = 1; i <= indices.length; i++) {
                if (indices[i - 1] !== i) {
                    nonConsecutiveIndex = i;
                    break;
                }
            }
    
            if(!nonConsecutiveIndex && images?.length <= 4 && images?.length >= 2){
                return true;       
            } else if(nonConsecutiveIndex){
                console.log('hey')
                showError('image-message', `Select Image-${nonConsecutiveIndex}`);
                return false;
            } else {
                showError('image-message', errorMessage);
                return false;
            }
        }
    
        function validateMoreInfo(errorMessage){
            const inputs = document.querySelectorAll('#moreInfo .form-control');
            let isValid = true;
    
            inputs.forEach((input) => {
                const value = input.value.trim().replace(/\s{2,}/g, '');
                const isInputValid = (value === '') || /^.{3,}$/.test(value);
      
                if (!isInputValid) {
                    showError(input.id + '-message', errorMessage);
                    isValid = false;
                } else {
                    validMessage(input.id + '-message');
                }
            });
            return isValid;
    
        }
    
    
        function showError(elementId, message) {
            const errorElement = document.getElementById(elementId);
            if(errorElement){
                errorElement.classList.remove('text-danger', 'text-success');
                errorElement.classList.add('text-danger');
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }
    
        function validMessage(elementId){
            const element = document.getElementById(elementId);
            if(element){
                element.classList.remove('text-danger', 'text-success');
                element.classList.add('text-success');
                element.textContent = "Input is Valid!";
                element.style.display = 'block';
            }
        }
    
        return title && gender && category && brand && discount && mrp && size && description && images && more;
    }

    function resetErrorMessages() {
        const errorElements = document.querySelectorAll('.alert-message');
        errorElements.forEach((element) => {
            if(element){
                element.textContent = '';
                element.style.display = 'none';
            }  
        });
    }
    


    productForm?.addEventListener('submit', function (event) {
        event.preventDefault();
        resetErrorMessages();
        colorStock();    
        if (productFormValidation()) {
            productForm.submit();;
        } 
    });


    if(editProductForm){
        const existingData = new FormData(editProductForm);

        editProductForm?.addEventListener('submit', async function (event) {
            event.preventDefault();
            resetErrorMessages();
            colorStock(); 

            if (productFormValidation()){
                let  changedData = {}
                let slug = document.getElementById('slug').value;
                colorStock();
                let updatedForm = new FormData(editProductForm);
    
                for(const pair of updatedForm.entries()){
                    const fieldName = pair[0];
                    const fieldValue = pair[1];
                    const existingValue = existingData.get(fieldName);
             
                    if (fieldValue instanceof File) {
                        changedData[fieldName] = fieldValue;
                    }else{
                        if (existingValue === undefined || fieldValue !== existingValue) {
                            changedData[fieldName] = fieldValue;
                        }
                    }    
                }
                
                changedData['selectedImg'] = JSON.stringify(Array.from(document.querySelectorAll('.upload')).map((item) => item?.name));
                
                const formDataToSend = new FormData();
                for (const key in changedData) formDataToSend.append(key, changedData[key]);
                console.log(formDataToSend)
                
                fetch(`/admin/edit-product/${slug}`, {
                    method: 'PATCH',
                    body: formDataToSend,
                    }).then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.json();
                    }).then(data => { 
                        if (data.redirect) window.location.href = data.redirect;    
                    }).catch(error => { console.error('Error:', error); });  
            }
            
        });
    }

    editCouponButtons?.forEach(button => {
        button.addEventListener('click', async function () {
            const statusText = document.getElementById('statusText');
            statusText.classList.remove('alert-primary','alert-danger');
            statusText.textContent = '';
            const couponId = this.dataset?.couponid;
    
            try {
                const clonedModal = editCouponModal?.cloneNode(true);
    
                // Fetch coupon details using the couponId
                const response = await fetch(`/admin/fetch-coupon?couponId=${couponId}`);
    
                if (!response.ok) {
                    throw new Error(`Failed to fetch coupon details: ${response?.message}`);
                }
    
                const coupon = await response.json();
                // Populate the cloned modal fields with the fetched details
                populateModalFields(clonedModal, coupon);
    
                const editCpnBtn = clonedModal.querySelector('#edit-btn');
    
                editCpnBtn?.addEventListener('click', async function (e) {
                    const updatedCoupon = {
                        couponTitle: clonedModal.querySelector('#couponTitle2').value,
                        code: clonedModal.querySelector('#couponCode2').value,
                        discount: clonedModal.querySelector('#couponDiscount2').value,
                        maxDiscountAmount: clonedModal.querySelector('#maxDiscount2').value,
                        minPurchaseAmount: clonedModal.querySelector('#minAmount2').value,
                        usageLimit: clonedModal.querySelector('#usageLimit2').value,
                        targetUserGroups: clonedModal.querySelector('#userGroups2').value,
                        isForAllUsers: clonedModal.querySelector('#isForAllUsers2').value,
                        startDat: clonedModal.querySelector('#startDate2').value,
                        endDate: clonedModal.querySelector('#endDate2').value,
                        status: clonedModal.querySelector('#statusField2').value,
                        id: clonedModal.querySelector('#id-field').value,
                    };
        
                    // Send PATCH request to update the coupon
                    const patchResponse = await fetch(`/admin/edit-coupon`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedCoupon),
                    });
                    
                    const data = await patchResponse.json();

                    if (patchResponse.ok) {
                        clonedModal.querySelector('#modal-close').click();
                        statusText.classList.remove('alert-primary','alert-danger');
                        statusText.classList.add('alert-primary');
                        statusText.textContent = data.message;
                    } else {
                        statusText.classList.remove('alert-primary','alert-danger');
                        statusText.classList.add('alert-danger');
                        statusText.textContent = data.message;
                    }
                });
    
                new bootstrap.Modal(clonedModal).show();
            } catch (error) {
                console.log(error);
            }
        });
    });


    function addImageToUploadContent(file, imageIndex) {
        let reader = new FileReader();

        reader.onload = function (e) {
        
            let uploadContent = document.querySelector('.file-upload-content');
            let imageContainer = document.createElement('div');
            imageContainer.className = 'file-upload-image-container mx-2';
            imageContainer.id = `uploaded-${imageIndex}`;
            imageContainer.dataset.file = `${file.name}`
            imageContainer.innerHTML = `
                <i class="remove-image fas fa-times-circle" data-index="${imageIndex}"></i>
                <img class="file-upload-image" src="${e.target.result}" data-bs-toggle="tooltip"
                   title="${file.name}">
                <div class="text-center text-primary fw-semibold img-text">image-${imageIndex}</div>`;

            uploadContent.appendChild(imageContainer);
            
        }

        reader.readAsDataURL(file);
    }


    document.querySelector('.file-upload-content')?.addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-image')) {
          let index = event.target.getAttribute('data-index');
          let imageContainer = document.getElementById(`uploaded-${index}`);
          removeImage(imageContainer, index);
          document.querySelector('.limit-message').style.display = 'none';
        }
    }); 


    function removeImage(imageContainer, index) {
        //let filename = imageContainer.dataset.file;
        imageContainer?.parentNode?.removeChild(imageContainer);
    
        if (document.querySelector('.file-upload-content').childElementCount === 0) {
            document.querySelector('.drag-text').style.display = 'block';
        }

        document.querySelectorAll('.upload')?.forEach(input => {
            if(parseInt(input.dataset.index) == parseInt(index)){
                document.getElementById('file-upload').removeChild(input);
            }
        });


        //document.querySelector('#productForm #removedImgs').value = [`img-${index}`]

        document.querySelectorAll('#productForm .upload')?.forEach((input,index) => {
            const idx = parseInt(input.dataset.index);
            const newIdx = index + 1;
            input.name = `img-${newIdx}`;
            input.dataset.index = newIdx;
            const container = document.getElementById(`uploaded-${idx}`);
            container.querySelector('.img-text').textContent = `image-${newIdx}`;
            container.querySelector('.remove-image').dataset.index = newIdx
            container.id = `uploaded-${newIdx}`;
        });
    };


    document.querySelector('.file-upload-btn')?.addEventListener('click', async function () {
        try {
            let limitMessage = document.querySelector('.limit-message');
            const imgs = Array.from(document.querySelectorAll('.upload'))
                .map(child => parseInt(child?.name?.replace('img-', '')));

            const index = imgs?.length ? [1, 2, 3, 4, 5].find(value => !imgs?.includes(value)) : 1;
    
            if(imgs.length < 4){
                document.querySelector('.drag-text').style.display = 'none';
                limitMessage.style.display = 'none';
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.name = `img-${index}`;
                fileInput.dataset.index = `${index}`
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                fileInput.className = 'upload';
        
                // Use await to wait for the asynchronous operation to complete
                await new Promise((resolve, reject) => {
                    fileInput.addEventListener('change', () => {
                        try {
                            addImageToUploadContent(fileInput?.files[0], index)
                            resolve(); // Resolve the promise when a file is selected
                        } catch (error) {
                            reject(error); // Reject the promise if an error occurs during readURL
                        }
                    });
        
                    fileInput.click(); // Initiate file selection
                });
        
                // Append the fileInput element to the file-upload container
                document.getElementById('file-upload').appendChild(fileInput);
            } else {
                limitMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('An error occurred:', error);
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

    
    
    
    function populateModalFields(modal, coupon) {
        modal.querySelector('#couponTitle2').value = coupon?.couponTitle;
        modal.querySelector('#couponCode2').value = coupon?.code;
        modal.querySelector('#couponDiscount2').value = coupon?.discount;
        modal.querySelector('#maxDiscount2').value = coupon?.maxDiscountAmount;
        modal.querySelector('#minAmount2').value = coupon?.minPurchaseAmount;
        modal.querySelector('#usageLimit2').value = coupon?.usageLimit;
        modal.querySelector('#userGroups2').value = coupon?.targetUserGroups; // Adjust based on your data structure
        modal.querySelector('#isForAllUsers2').checked = coupon?.isForAllUsers;
        const startDateInput = modal.querySelector('#startDate2');
        startDateInput.value = formatAsYYYYMMDD(coupon?.startDate);
    
        const endDateInput = modal.querySelector('#endDate2');
        endDateInput.value = formatAsYYYYMMDD(coupon?.endDate);
        modal.querySelector('#statusField2').value = coupon?.status;
        modal.querySelector('#id-field').value = coupon?._id;
    }
    
    // Function to format a date as "yyyy-mm-dd"
    function formatAsYYYYMMDD(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

});


