document.addEventListener('DOMContentLoaded', function () {
    let proceedToBtn = document.querySelectorAll('.proceed-btn')
    let backBtn = document.querySelectorAll('.backBtn');
    const razorpayOption = document.getElementById('razorpayOption');
    const checkoutCartForm = document.getElementById('checkoutCart');
    const fastDeliveryInput = document.getElementById('fastDelivery');
    const standardDelivery = document.getElementById('standardDelivery');
    const fsDelivery = document.getElementById('fast-delivery');
    const totalElement = document.getElementById('total');
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const removeCouponBtn = document.getElementById('removeCouponBtn');
    const checkoutAlert = document.getElementById('checkout-alert'); 
    const couponAlert = document.getElementById('coupon-alert');
   

    proceedToBtn?.forEach(function (button) {
        button.addEventListener('click', function () {
            const activeTab = document.querySelector('div.tab-pane.active');
            const activeNav = document.getElementById(activeTab.getAttribute('data-nav'));
            checkoutAlert.innerHTML = '';

            if (validateInputs(activeTab)) {
                let proceedNav = this.getAttribute('data-proceed-nav');
                let nextTabItem = this.getAttribute('data-next');
                let nextNav = document.getElementById(proceedNav);
                let nextTab = document.getElementById(nextTabItem);
  
                if (nextNav && nextTab) {
                  activeNav.classList.remove('active')
                  activeTab.classList.remove('active', 'show');
                  nextNav.classList.add('active');
                  nextTab.classList.add('active','show');
              } else {
                  checkoutAlert.innerHTML = "No next tab or nav-item found!"
              }
            } else {
                checkoutAlert.innerHTML = "Please fill in all required fields!"
            }
        });
    });

    function validateInputs(activeTab){
        const inputBoxes = activeTab.querySelectorAll('input');
        const isChecked = Array.from(inputBoxes).some(input => input.checked);
        if (isChecked) return true; 
        else {
            return false; 
        }  
    }


    backBtn?.forEach(eachBtn => {
        eachBtn?.addEventListener('click', function() {
            const activeTab = document.querySelector('div.tab-pane.active');
            const activeNav = document.getElementById(activeTab.getAttribute('data-nav'));
            checkoutAlert.innerHTML = '';

            if (activeTab) {
                let backNavItem = this.getAttribute('data-back-nav');
                let prevTabItem = this.getAttribute('data-prev');
                let backNav = document.getElementById(backNavItem);
                let backTab = document.getElementById(prevTabItem);
  
                if (backNav && backTab) {
                  activeTab.classList.remove('active')
                  activeNav.classList.remove('active', 'show');
                  backNav.classList.add('active');
                  backTab.classList.add('active','show');
              } else {
                  checkoutAlert.innerHTML = "No prev tab or nav-item found!"
              }
            } else {
                checkoutAlert.innerHTML = "Something went wrong!"
            }
        }) 
    })


    fastDeliveryInput?.addEventListener('change', function(){
        const totalValue = document.getElementById('total-value');
        fsDelivery.style.display = 'flex';
        totalElement.textContent = parseInt(totalValue.value) + 25; 
    });

    standardDelivery?.addEventListener('change', function(){
        const totalValue = document.getElementById('total-value');
        fsDelivery.style.display = 'none';
        totalElement.textContent = parseInt(totalValue.value);
    });

    
    checkoutCartForm?.addEventListener( 'submit',async function(event){
        event.preventDefault();
        const activeTab = document.querySelector('div.tab-pane.active');
        checkoutAlert.innerHTML = '';
        
        if (validateInputs(activeTab)) {
            if(razorpayOption &&  razorpayOption.checked){
                try {
                    const formData =  new FormData(checkoutCartForm);
        
                    const response = await fetch('/checkout/orders/', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(Object.fromEntries(formData)),
                    });
    
                    const result = await response.json();
              
                    if(response.ok){
                        let options = {
                            key: 'rzp_test_VmjxeAY1dbkR2y', // Replace with your actual key
                            amount: result.razorpayOrderData.amount,
                            currency: result.razorpayOrderData.currency,
                            name: 'VOGUISH Fashion',
                            description: 'Test Transaction',
                            order_id: result.razorpayOrderData.id,
                            callback_url: '/razorpay/order-payment',
                        };
        
                        let rzp = new Razorpay(options);
                        rzp.open();
                    }       
                } catch (error) {
                    console.error('Error creating Razorpay order:', error);
                } 
            }else{
                checkoutCartForm.submit();
            } 
        } else {
          checkoutAlert.innerHTML = "Please fill in all required fields!"
        }    
    });


    applyCouponBtn?.addEventListener('click', async function() {
        const couponCode = document.getElementById('coupon').value;
        const totalPrice = document.getElementById('total-price');
        const totalValue = document.getElementById('total-value');
       
        const response = await fetch('/checkout/apply-coupon', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ purchaseAmnt: parseInt(totalPrice.value), couponCode }),
        });
        const result = await response.json();
  
        if(response.ok){
  
          let totalDSC = (parseInt(totalValue.value) - parseInt(result.discAmt));
          totalValue.value = totalDSC;
          document.getElementById('coupon-applied').style.display = 'flex';
          document.getElementById('couponAmnt').innerHTML = `-₹${result.discAmt}`;
          document.getElementById('cpnDsc').value = result.discAmt;
          if(fastDeliveryInput.checked) totalDSC = totalDSC + 25;

          totalElement.textContent = parseInt(totalDSC);
          applyCouponBtn.style.display = 'none';
          removeCouponBtn.style.display = 'block';
          couponAlert.innerHTML = "Coupon Added Successfully!";   
        } else{
            couponAlert.innerHTML = result.message;
        }
    });


    removeCouponBtn?.addEventListener('click', function() {
        const totalValue = document.getElementById('total-value');
        const cpnDSCamnt = document.getElementById('cpnDsc');      
        let totalDSC = parseInt(totalValue.value) + parseInt(cpnDSCamnt.value);
        totalValue.value = totalDSC;

        if(fastDeliveryInput.checked) totalDSC = totalDSC + 25;

        totalElement.textContent = totalDSC; 
        document.getElementById('coupon').value = '';
        cpnDSCamnt.value = 0;
        document.getElementById('coupon-applied').style.display = 'none';
        applyCouponBtn.style.display = 'block';
        removeCouponBtn.style.display = 'none';

        couponAlert.innerHTML = 'Coupon Removed Successfully!';

    })
});
  
  




    /*
    
    const shippingAddressCollapse = document.getElementById('shipping-address'); 
    let navItems = document.querySelectorAll('.nav-item');
    const formElements = document.querySelectorAll('#newaddressForm input, #newaddressForm select, #newaddressForm textarea');
    
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


  
    proceedToBtn?.forEach(eachBtn => {
        eachBtn.addEventListener('click', function (event) {
            let getProceed = eachBtn.getAttribute('data-proceed');
            let navItem = document.getElementById(getProceed);
            navItem.click();
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
   
    });*/