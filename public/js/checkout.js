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
    const walletOption = document.getElementById('walletOption');
   

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
                            key: 'rzp_test_FmNCCXUWBBloc6', // Replace with your actual key
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

    
    fastDeliveryInput?.addEventListener('change', function(){
        const totalWithDelivery = document.getElementById('totalWithDelivery');
        const grandTotal = document.getElementById('grand-total');
        if(walletOption.checked){
            walletOption.checked = false;
            const changeEvent = new Event('change');
            walletOption.dispatchEvent(changeEvent);
        }
        fsDelivery.style.display = 'flex';
        grandTotal.value = parseInt(totalWithDelivery.value) + 25;
        totalElement.textContent = grandTotal.value;

    });

    standardDelivery?.addEventListener('change', function(){
        const totalWithDelivery = document.getElementById('totalWithDelivery');
        const grandTotal = document.getElementById('grand-total');
        if(walletOption.checked){
            walletOption.checked = false;
            const changeEvent = new Event('change');
            walletOption.dispatchEvent(changeEvent);
        }
        fsDelivery.style.display = 'none';
        totalElement.textContent = parseInt(totalWithDelivery.value);
        grandTotal.value = parseInt(totalWithDelivery.value);
        
    });


    applyCouponBtn?.addEventListener('click', async function() {
        const couponCode = document.getElementById('coupon').value;
        const totalWithDelivery = document.getElementById('totalWithDelivery');
        const grandTotal = document.getElementById('grand-total');
       
        const response = await fetch('/checkout/apply-coupon', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ couponCode }),
        });
        const result = await response.json();
  
        if(response.ok){

            if(walletOption.checked){
               walletOption.checked = false;
               const changeEvent = new Event('change');
               walletOption.dispatchEvent(changeEvent);
           }

           let totalDSC = (parseInt(totalWithDelivery.value) - parseInt(result.discAmt));
           totalWithDelivery.value = totalDSC;
           totalDSC +=  (fastDeliveryInput?.checked)?25:0
           grandTotal.value = totalDSC ;
           document.getElementById('coupon-applied').style.display = 'flex';
           document.getElementById('couponAmnt').innerHTML = `-₹${result.discAmt}`;
           document.getElementById('cpnDsc').value = result.discAmt;
           totalElement.textContent = grandTotal.value;
           applyCouponBtn.style.display = 'none';
           removeCouponBtn.style.display = 'block';
           couponAlert.classList.add('text-success');
           couponAlert.innerHTML = "Coupon Added Successfully!";   
        } else{
            couponAlert.innerHTML = result.message;
        }
    });


    removeCouponBtn?.addEventListener('click', function() {
        const totalWithDelivery = document.getElementById('totalWithDelivery');
        const cpnDSCamnt = document.getElementById('cpnDsc');     
        const grandTotal = document.getElementById('grand-total');
        totalWithDelivery.value = parseInt(totalWithDelivery.value) + parseInt(cpnDSCamnt.value);
        grandTotal.value = parseInt(grandTotal.value) + parseInt(cpnDSCamnt.value); 
        totalElement.textContent = grandTotal.value; 
        cpnDSCamnt.value = 0;
        document.getElementById('coupon').value = '';
        document.getElementById('coupon-applied').style.display = 'none';
        applyCouponBtn.style.display = 'block';
        removeCouponBtn.style.display = 'none';
        couponAlert.classList.remove('text-success');
        couponAlert.classList.add('text-danger');
        couponAlert.innerHTML = 'Coupon Removed Successfully!';
    });

    walletOption?.addEventListener('change', async function () {
        try {
            const grandTotal = document.getElementById('grand-total');
            const razorpayOption = document.getElementById('razorpayOption');
            const available = document.getElementById('available');
            const redeemedAmnt = document.getElementById('redeemedAmnt');
            const walletBlnc = document.getElementById('walletBalance');
            const redeemedValue = document.getElementById('redeemedValue');
            const walletAlert = document.getElementById('wallet-alert'); 
            const walletRedeemed = document.getElementById('wallet-redeemed');
            const totalElement = document.getElementById('total');
            const codP = document.getElementById('codP');
            const rzrP = document.getElementById('rzrP');
            
            if(walletOption.checked){
                const response = await fetch('/wallet/redeem-wallet-money', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ grandTotal: grandTotal.value }),
                });
    
                if (response.ok) {
                    const result = await response.json();

                    if(result?.isWalletUsedFull){
                        razorpayOption.disabled = true;
                        CODoption.disabled = true;
                        codP.classList.remove('opacity-100');
                        rzrP.classList.remove('opacity-100');
                        codP.classList.add('opacity-50');
                        rzrP.classList.add('opacity-50');
                    }
    
                    if(result?.isWalletUsedPartial){
                        CODoption.disabled = true;
                        codP.classList.remove('opacity-100');
                        codP.classList.add('opacity-50');
                    }
         
                    walletRedeemed.style.display = 'flex';
                    redeemedAmnt.innerHTML = `-₹${result.redeemAmount}`;
                    walletBlnc.innerHTML = `${result.walletBalance}`;
                    redeemedValue.value = result.redeemAmount;
                    walletAlert.innerHTML = `-₹${result.redeemAmount} redeemed!`;
                    grandTotal.value = parseInt(result.GrandTotal);
                    totalElement.innerHTML = `${result.GrandTotal}`;
                } else {

                }
            }else{
                codP.classList.remove('opacity-50');
                rzrP.classList.remove('opacity-50');
                codP.classList.add('opacity-100');
                rzrP.classList.add('opacity-100');
                razorpayOption.disabled = false;
                CODoption.disabled = false;
                walletAlert.innerHTML = '';
                walletRedeemed.style.display = 'none';
                grandTotal.value = (parseInt(grandTotal.value) + parseInt(redeemedValue.value));
                walletBlnc.innerHTML = available.value;
                totalElement.innerHTML = `${grandTotal.value}`;
            }
            
        } catch (error) {
            console.error('An error occurred during wallet redemption:', error);
            // You can show an error message to the user or take appropriate action
        }
    });
    
     
});
  
  







    /*if(walletOption.checked){
            let available = document.getElementById('available');
            let walletBalance = parseInt(available.value);
            let totalAmountToPay = parseInt(grand.value);
    
            console.log(parseInt(walletBalance) - parseInt(totalAmountToPay))
    
            if (validateWalletBalance(walletBalance, totalAmountToPay)) {
                document.getElementById('wallet-alert').innerHTML = `-₹${totalAmountToPay} redeemed!`;
                available.value = parseInt(walletBalance) - parseInt(totalAmountToPay);
                console.log('Payment successful');
            } else {
                // Insufficient balance, show an error message or take appropriate action
                document.getElementById('wallet-alert').innerHTML = `You have Insufficient balance! Go for another payment methods`;
                console.log('Insufficient balance');
            }
        }
        

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