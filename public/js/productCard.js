document.addEventListener('DOMContentLoaded', function() {
    const addToWishlistBtn = document.querySelectorAll('.addToWishlist');
    const checkboxes = document.querySelectorAll('.custom-control-input:not(.selectAll), .custom-radio-input');
    const checkedBoxes = document.querySelectorAll('input:checked');
    const showing = document.querySelectorAll('.showing');
    const selectAll = document.querySelectorAll('.selectAll');
    const addToCartBtn = document.querySelectorAll('.addToCartBtn');
    const removeFromWishlist = document.querySelectorAll('.product-wishlist');
    const pagination = document.querySelectorAll('.page-link');
    let rangeOne = document.getElementById('rangeOne'),
        rangeTwo = document.getElementById('rangeTwo'),
        outputOne = document.querySelector('.outputOne'),
        outputTwo = document.querySelector('.outputTwo'),
        inclRange = document.querySelector('.incl-range'),
        selectedItems = document.getElementById('selectedItems');



    addToWishlistBtn?.forEach( function(item) {
        item.addEventListener('click', async function(event) {
            event.preventDefault()
            try {
                const response = await fetch(item.getAttribute('href'), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
               const data = await response.json();
                if (response.ok) {
                    
                    Swal.fire({
                        icon: "success",
                        title: this.dataset.title,
                        text: "is added To WishList !",
                        showConfirmButton: false,
                        iconColor: '#1b812f',
                        timer: 1500,
                        customClass: {
                            title: 'swal-title-custom-class',
                        },
                        didDestroy: () => {
                            // This function will be called when the modal is destroyed
                            window.location.href = data.redirect;
                        }
                      });                      
                } else {
                    if(response.status == 400){
                        Swal.fire({
                            icon: "Success",
                            title: "Already Added To WishList!",
                            customClass: {
                                title: 'swal-title-custom-class',
                            }
                        });
                    }
                    console.error('Failed to add to wishlist');
                }
            } catch (error) {
                console.error('Error: ' + error);
            }
        });
    });
    

    if(rangeOne && rangeTwo){
       let updateView = function () {
          // Convert values to integers
          let valueOne = parseInt(rangeOne?.value),
            valueTwo = parseInt(rangeTwo?.value),
            minPrice = this?.getAttribute('min'),
            maxPrice = this?.getAttribute('max');
  
            if (this.getAttribute('name') === 'minRange') {
                outputOne.innerHTML = `₹${valueOne}`;
                outputOne.style.left = (valueOne / this.getAttribute('max')) * 100 + '%';
        
                // Ensure rangeOne does not cross rangeTwo
                if (valueOne > valueTwo) {
                  rangeOne.value = valueTwo;
                  updateView.call(rangeOne);
                }
                 // If both sliders are in the same position, move rangeOne to the left
            
            } else {
                outputTwo.style.left = (valueTwo / this.getAttribute('max')) * 100 + '%';
                outputTwo.innerHTML = `₹${valueTwo}`;
                // Ensure rangeTwo does not cross rangeOne
                if (valueTwo < valueOne) {
                  rangeTwo.value = valueOne ;
                  updateView.call(rangeTwo);
                }
            }

            // Update the inclusive range
            inclRange.style.width = (Math.abs(valueTwo - valueOne) / (maxPrice - minPrice)) * 100 + '%';
            inclRange.style.left = (Math.min(valueOne, valueTwo) - minPrice) / (maxPrice - minPrice) * 100 + '%';
      
            // Prevent blue color when sliders cross
            if (valueOne > valueTwo) {
              inclRange.style.backgroundColor = 'transparent';
            } else {
              inclRange.style.backgroundColor = 'rgb(0, 136, 255)';
            }
        }
        updateView.call(rangeOne);
        updateView.call(rangeTwo);

        document.querySelectorAll('input[type="range"]').forEach(function (input) {
            input.addEventListener('mouseup', function () {
              this.blur();
            });
            input.addEventListener('mousedown', function () {
              updateView.call(this);
            });
            input.addEventListener('input', function () {
              updateView.call(this);
            });
        });
    }
     
    checkboxes?.forEach(function (checkbox) {
        checkbox.addEventListener('change', function (e) {
            if (checkbox.type === 'radio' && checkbox.getAttribute('name') == 'gender') {
                const radioValue = checkbox.value;
                checkbox.removeAttribute('name');
                document.getElementById('mainPage').value = radioValue;
            }
            document.getElementById('filterForm').submit();
        });  
    });
    
    checkedBoxes?.forEach( function (item) {
         // Create a button element
         const closeButton = document.createElement('button');
         closeButton.classList.add('btn', 'btn-sm', 'me-2', 'px-3');
         closeButton.innerHTML = `${item.value}<i class="fa-solid fa-circle-xmark ps-2"></i>`;
 
         closeButton?.addEventListener('click', function () {
            if(item.type == 'radio' && item.getAttribute('name') == 'gender') {
                item.checked = false;
                document.getElementById('mainPage').value = "kids"; 
                document.getElementById('filterForm').submit();
                
            } else if(item.type == 'checkbox'){
                let filter = item.getAttribute('name').replace(/\[\]/g, '');
                let selected = document.getElementById(`${filter}-all`);
                if(selected.checked) selected.checked = false;
                item.click();
            }
         });
         if(item.getAttribute('name') != 'sorting'){
              selectedItems.appendChild(closeButton);
         }
    });

    showing?.forEach( function(item){
        item?.addEventListener('click', function(e){
            e.preventDefault();
            

            const pageSize = item.dataset.value;
            const form = document.getElementById('filterForm');
    
            const pageSizeInput = document.createElement('input');
            pageSizeInput.type = 'hidden';
            pageSizeInput.name = 'pageSize';
            pageSizeInput.value = pageSize;
            
            form.appendChild(pageSizeInput);
            form.submit();
        })
    });


    selectAll?.forEach( function(opt) {
        const key = opt.id.replace(/-all$/, '');
        opt.addEventListener('change', function (e) {
            const allvalues = document.querySelectorAll(`input[name = "${key}[]"]`);
            allvalues?.forEach((item) => {
                if(item.checked){ item.checked = false }
                item.click()
            });
        });
    });


    addToCartBtn?.forEach( function(item) {

        item?.addEventListener('click',async function(e){
            e.preventDefault();
            const url = this.getAttribute('href');
    
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            const data = await response.json();
    
            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: this.dataset.title,
                    text: "is added To Cart !",
                    showConfirmButton: false,
                    timer: 1500,
                    iconColor: '#1b812f',
                    customClass: {
                        title: 'swal-title-custom-class',
                    }
                  });
                  document.querySelectorAll('.qnty').forEach(function(ele) {
                    ele.innerHTML = data.totalQty;
                 })
            } else if( response.status == 400){

                if(data.exist){
                    Swal.fire({
                        icon: "Success",
                        title: "Already Added !",
                        customClass: {
                            title: 'swal-title-custom-class',
                        }
                    });
                } else {
                    Swal.fire({
                        title: "Unfortunately",
                        text: "we're currently out of stock on that item!",
                        icon: "warning",
                    });
                }
            } else{
                console.log(data.message)
            }
        });
    });
    
    removeFromWishlist?.forEach(function(item){
        item.addEventListener('click', async function(e){
            e.preventDefault();
            const url = item.getAttribute('href');

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            const data = await response.json();
    
            if (response.ok) {
                console.log("okkkkk")
                Swal.fire({
                    icon: "success",
                    title: "Removed",
                    text: data.message,
                    showConfirmButton: false,
                    timer: 1500,
                    iconColor: '#1b812f',
                    customClass: {
                        title: 'swal-title-custom-class',
                    },
                    didDestroy: () => {
                        // This function will be called when the modal is destroyed
                        window.location.href = data.redirect;
                    }
                  });

            } else if( response.status == 400){

                if(data.exist){
                    Swal.fire({
                        icon: "Success",
                        title: "Already Added !",
                        customClass: {
                            title: 'swal-title-custom-class',
                        }
                    });
                }
            } else{ console.log(data.message) }
            })
        })

        pagination?.forEach(function (item) {
            item?.addEventListener('click', async function (e) {
                e.preventDefault();
        
                const pagination = item.dataset.pagination;
                const pageSize = item.dataset.size;
                const form = document.getElementById('filterForm');
        
                // Create hidden input fields for pagination and pageSize
                const paginationInput = document.createElement('input');
                paginationInput.type = 'hidden';
                paginationInput.name = 'pagination'; 
                paginationInput.value = pagination;
        
                const pageSizeInput = document.createElement('input');
                pageSizeInput.type = 'hidden';
                pageSizeInput.name = 'pageSize';
                pageSizeInput.value = pageSize;
                
                // Append the hidden inputs to the form
                form.appendChild(paginationInput);
                form.appendChild(pageSizeInput);
                form.submit();
            });
        });


        
});

    