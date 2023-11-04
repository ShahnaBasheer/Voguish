document.addEventListener('DOMContentLoaded', function () {
  let proceedToShippingBtn = document.getElementById('proceedToShippingBtn'); // ID of the "Proceed to Shipping" button
  let proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');
  let proceedToBtn = document.querySelectorAll('.proceed-btn')
  let shippingRadio = document.querySelectorAll('input[name="shippingMethod"]');
  let checkoutAddressRadio = document.querySelectorAll('input[name="checkoutAddress"]');
  let paymentRadio = document.querySelectorAll('input[name="billingOptions"]');
  let navItems = document.querySelectorAll('.nav-item');
  let newAddressForm = document.getElementById('newaddressForm')
  const submitButton = newAddressForm.querySelector('button[type="submit"]');
  const shippingAddressCollapse = document.getElementById('shipping-address');
  const formElements = document.querySelectorAll('#newaddressForm input, #newaddressForm select, #newaddressForm textarea');
 
  let allowToProceed = [false, false]; // Flags to track if user can proceed to shipping and payment respectively
  
  formElements.forEach(field => {
    field.removeAttribute('required', 'true');
  });

  shippingAddressCollapse.addEventListener('show.bs.collapse', function () {
    formElements.forEach(field => {
      field.setAttribute('required', 'true');
    })
  });

// Add the 'required' attribute back when the collapsed section is hidden
    shippingAddressCollapse.addEventListener('hidden.bs.collapse', function () {
      formElements.forEach(field => {
         field.removeAttribute('required');
      });
    });

  submitButton.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = {};
    
    formElements.forEach(element => {
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
  
  proceedToBtn.forEach(eachBtn => {
    eachBtn.addEventListener('click', function (event) {
        let getProceed = eachBtn.getAttribute('data-proceed');
        let navItem = document.getElementById(getProceed);
        navItem.click();
    });
  });
 

  navItems.forEach(function (navItem) {
    navItem.addEventListener('click', function (event) {
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


});
  
/*
checkoutAddressRadio.forEach(checkoutbtn => {
      checkoutbtn.addEventListener('change', function () {
          allowToProceed[0] = true;
          enableProceedButton(proceedToShippingBtn, allowToProceed);
      });
  });
  // Enable the "Proceed to Shipping" button when shipping option is selected
  shippingRadio.forEach(shippingbtn => {
      shippingbtn.addEventListener('change', function () {
          allowToProceed[0] = true;
          enableProceedButton(proceedToShippingBtn, allowToProceed);
      });
  });

  // Enable the "Proceed to Payment" button when payment option is selected
  paymentRadio.forEach(paymentbtn => {
      paymentbtn.addEventListener('change', function () {
          allowToProceed[1] = true;
          enableProceedButton(proceedToPaymentBtn, allowToProceed);
      });
  });

  // Function to enable or disable the specified button based on the allowToProceed array
  function enableProceedButton(button, allowArray) {
      if (allowArray.every(Boolean)) {
          button.disabled = false;
      } else {
          button.disabled = true;
      }
  }

  // Prevent navigation to the next tab using nav-items in nav-pills
  var navItems = document.querySelectorAll('.nav-pills .nav-item');
  navItems.forEach(function (navItem) {
      navItem.addEventListener('click', function (e) {
          if (!allowToProceed.every(Boolean)) {
              e.preventDefault(); // Prevent tab change if not allowed
          }
      });
  });

  // Handle button click event
  ;
*/ 
