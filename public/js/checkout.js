document.addEventListener('DOMContentLoaded', function () {
    let proceedToBtn = document.querySelectorAll('.proceed-btn')
    let navItems = document.querySelectorAll('.nav-item');
    let newAddressForm = document.getElementById('newaddressForm')
    const submitButton = newAddressForm.querySelector('button[type="submit"]');
    const shippingAddressCollapse = document.getElementById('shipping-address');
    const formElements = document.querySelectorAll('#newaddressForm input, #newaddressForm select, #newaddressForm textarea');
    const fastDelivery = document.getElementById('fastDelivery');
    const standardDelivery = document.getElementById('standardDelivery');
    const fsDelivery = document.getElementById('fast-delivery');
    const totalValue = document.getElementById('total-value').value;
    const totalElement = document.getElementById('total');
  
    formElements?.forEach(field => {
      field.removeAttribute('required', 'true');
    });
  
    shippingAddressCollapse?.addEventListener('show.bs.collapse', function () {
      formElements.forEach(field => {
        field.setAttribute('required', 'true');
      })
    });

    // Add the 'required' attribute back when the collapsed section is hidden
    shippingAddressCollapse?.addEventListener('hidden.bs.collapse', function () {
      formElements.forEach(field => {
         field.removeAttribute('required');
      });
    });

    submitButton?.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default form submission
  
      const formData = {};
      
      formElements?.forEach(element => {
          if (element.name) {
              formData[element.name] = element.value;
          }
      });
    
      fetch('/profile/add-address', {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: {
              'Content-Type': 'application/json'
          }
      })
      .then(response => {
          if(response.ok){
            window.location.reload();
          }
      })
      .catch(error => {
          // Handle errors
          console.error(error);
      });
    });
  
    proceedToBtn?.forEach(eachBtn => {
      eachBtn.addEventListener('click', function (event) {
          let getProceed = eachBtn.getAttribute('data-proceed');
          let navItem = document.getElementById(getProceed);
          navItem.click();
      });
    });
 

    navItems?.forEach(function (navItem) {
      navItem?.addEventListener('click', function (event) {
          let targetTabId = navItem.querySelector('a').getAttribute('href').substring(1);
          let targetTabPane = document.getElementById(targetTabId);
          if (areRequiredFieldsFilled(targetTabPane)) {
              return true;
          } else {
              event.preventDefault();
          }
      });
    });

   function areRequiredFieldsFilled(tabPane) {
     // Check if all radio buttons in the tab-pane are checked
     let radioButtons = tabPane.querySelectorAll('input[type="radio"]');
     let radioButtonsChecked = Array.from(radioButtons).some(radio => radio.checked);
     let inputBoxes = tabPane.querySelectorAll('input[type="text"]');
     let inputBoxesFilled = Array.from(inputBoxes).every(input => input.value.trim() !== '');
     return radioButtonsChecked && inputBoxesFilled;
   }
   

    fastDelivery?.addEventListener('change', function(){
        fsDelivery.style.display = 'flex';
        totalElement.textContent = parseInt(totalValue) + 25; 
    });

    standardDelivery?.addEventListener('change', function(){
        fsDelivery.style.display = 'none';
        totalElement.textContent = parseInt(totalValue);
    });

});
  

