
document.addEventListener('DOMContentLoaded', function() {
    const editBtn = document.querySelectorAll('.edit-btn');
    const saveBtn = document.querySelectorAll('.save-button');
    const emailText = document.getElementById('email-text');
    const phoneText = document.getElementById('phone-text');
    const addressForm = document.querySelectorAll('.addressForm');
    const deleteAddress = document.querySelectorAll('.delete-address');
    const messageAddress = document.getElementById('addressMessage');
    const defaultAddres =  document.querySelectorAll('.default-address');
    const buyagain = document.querySelectorAll('.buyagain');
    const orderFilter = document.querySelectorAll('#orderFilter input, .form-select');
    const cancelBtn = document.querySelectorAll('.cancel-btn');
    const submitBtn = document.getElementById('submitBtn');
    const removeFromWishlist = document.querySelectorAll('.removeBtn');
    

    
    submitBtn?.addEventListener('click',async function(e){
        e.preventDefault();

        const passAlert = document.getElementById('password-message');
        passAlert.innerHTML = '';
        const currentPassValue = document.getElementById('currentPassword')?.value.trim();
        const newPasswordValue = document.getElementById('newPassword')?.value.trim();
        const confirmPasswordValue = document.getElementById('confirmPassword')?.value.trim();

        // Check if any of the fields is empty
        if (!currentPassValue || !newPasswordValue || !confirmPasswordValue) {
            passAlert.style.display = 'block';
            passAlert.innerHTML = 'Please fill in all the fields';
            return false;
        }

        // Check if passwords match
        if (newPasswordValue !== confirmPasswordValue) {
            passAlert.style.display = 'block';
            passAlert.innerHTML = 'New password and confirm password do not match';
            return false;
        }

        try {
            const response = await fetch('/change-old-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: currentPassValue,
                    newPassword: newPasswordValue,
                    confirmPassword: confirmPasswordValue,
                }),
            });
    
            // Handle the response
            const data = await response.json();
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Changed Successfully!',
                    showConfirmButton: false,
                    timer: 1500
                });
                document.getElementById('passwordChange').style.display = 'none';
                
            } else {
                passAlert.style.display = 'block';
                passAlert.innerHTML = data.error;
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }
    });



    document.getElementById('currentPassword')?.addEventListener('keydown', preventSpaces);
    document.getElementById('newPassword')?.addEventListener('keydown', preventSpaces);
    document.getElementById('confirmPassword')?.addEventListener('keydown', preventSpaces);

    // Function to prevent spaces in input fields
    function preventSpaces(event) {
        if (event.key === ' ' || event.code === 'Space') {
            event.preventDefault();
        }
    }

    document.getElementById('change-password')?.addEventListener('click', function(){
        document.getElementById('passwordChange').style.display = 'block';      
    });

    document.getElementById('cancelChange')?.addEventListener('click', function(){
        document.getElementById('passwordChange').style.display = 'none'; 
    })
    
    cancelBtn.forEach( function(item) {
        item?.addEventListener('click', function(event){
          event.preventDefault();
          const fieldName = this.getAttribute('data-field');
          const saveButton = document.querySelector(`.save-button[data-field="${fieldName}"]`);
          const editBtn = document.querySelector(`.edit-btn[data-field="${fieldName}"]`)
          const formField = document.querySelectorAll(`input[data-field="${fieldName}"]`);

          if(formField.length > 1){
            formField?.forEach(i => {
               i.setAttribute('disabled', true)})
          } else {
             console.log(formField)
              formField[0].setAttribute('disabled', true);
          }
          saveButton.style.display = 'none';
          editBtn.style.display = 'inline';
          this.style.display = 'none';
        });
    })



    editBtn?.forEach(editLink => {
        editLink?.addEventListener('click', function(event) {
          event.preventDefault();
          const fieldName = this.getAttribute('data-field');
          const saveButton = document.querySelector(`.save-button[data-field="${fieldName}"]`);
          const cancelBtn = document.querySelector(`.cancel-btn[data-field="${fieldName}"]`)
          const formField = document.querySelectorAll(`input[data-field="${fieldName}"]`);
    
          if(formField?.length > 1){
               formField?.forEach(item => {
                  item.removeAttribute('disabled')})

          }else formField[0].removeAttribute('disabled');
          saveButton.style.display = 'inline';
          cancelBtn.style.display = 'inline';
          this.style.display = 'none';
        });
    });

    
    saveBtn?.forEach(saveButton => {
      saveButton.addEventListener('click', async function(event) {
        event.preventDefault();
        emailText.innerHTML = '';
        phoneText.innerHTML = '';
        
        try{
            const fieldName = this?.getAttribute('data-field');
            const inputElement = document.querySelector(`input[data-field="${fieldName}"]`);

            let inputValue = inputElement?.value;

            if(fieldName == 'gender'){
                inputValue = document.querySelector(`input[data-field="${fieldName}"]:checked`)?.value;
            }
            let payload = {};
            payload[fieldName] = inputValue;

            if(profileValidation(fieldName, inputValue)){
                let response = await fetch('/profile/edit/', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                })
                
                if(response.ok) {
                    let data = await response.json();
                    if(data?.email){
                        const oldEmailInput = document.querySelector('#oldEmail input');
                        const newEmailInput = document.querySelector('#newEmail input');
                        oldEmailInput.placeholder = `Enter OTP sent to ${data.oldemail}`;
                        newEmailInput.placeholder = `Enter OTP sent to ${data.newemail}`;
                        new bootstrap.Modal(document.getElementById('modalOtp')).show();
                    }
                    if(data?.redirect){
                        window.location.href = data.redirect;
                    }  
                } else if (response.status === 409) {
                    const data = await response.json();
                    if (data?.emailText) emailText.innerHTML = data.emailText;
                    if (data?.phoneText) phoneText.innerHTML = data.phoneText;
                }else {
                    console.error('Server error:', response.status);
                } 
            }   
        }catch(error){
            console.log("error:",error)
        }
      });
    
    });
    

    addressForm?.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
    
            const fields = ['firstname', 'lastname', 'zipCode', 'address', 'city', 'landmark', 'state'];
    
            const validations = {
                firstname: { min_length: 2 },
                lastname: { min_length: 2 },
                city : { min_length: 3},
                address: { min_lenghth : 10},
                landmark:{ min_lenght : 5},
                //phone: { length: 10 },
                zipCode: { length: 6 },
                //email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                state: { invalid_value: 'Select State' }
            };
    
            fields.forEach(field => {
                const input = this.querySelector(`[name="${field}"]`);
                const message = this.querySelector(`.${field}-message`);
                message.textContent = '';
    
                let isValid = true;
    
                if (field === 'address') {
                    // Check textarea validation (non-empty)
                    isValid = input.value.trim() !== '';
                } else if (field in validations) {
                    // Handle other fields' validations as before
                    if ('min_length' in validations[field]) {
                        isValid = input.value.trim().length >= validations[field].min_length;
                    } else if ('length' in validations[field]) {
                        isValid = /^\d+$/.test(input.value.trim()) && input.value.trim().length === validations[field].length;
                    } else if ('pattern' in validations[field]) {
                        isValid = validations[field].pattern.test(input.value.trim());
                    } else if ('invalid_value' in validations[field]) {
                        isValid = input.value.trim() !== validations[field].invalid_value;
                    }
                }
                if (!isValid) {
                    input.classList.add('is-invalid');
                    message.textContent = `Invalid ${field.charAt(0).toUpperCase() + field.slice(1)}. Please provide a valid value.`;
                } else {
                    input.classList.remove('is-invalid');
                }
            });
    
            const isValid = fields.every(field => !this.querySelector(`.${field}-message`).textContent);
    
            if (isValid) {
                this.submit();
            }
        });
    });

    deleteAddress?.forEach(item => {
        item.addEventListener('click', async function(event) {
            event.preventDefault();
            const addressId = item.getAttribute('data-id');
    
            try {
                const response = await fetch(`/profile/delete-address/${addressId}`, {
                    method: 'DELETE'
                });
    
                const data = await response.json();
    
                if (data.success) {
                    window.location.reload();
                } else {
                    messageAddress.innerHTML = 'Failed to delete address!'
                }
            } catch (error) {
                console.error(error);
                messageAddress.textContent = 'Error occurred while deleting address';
            }
        });
    });

    defaultAddres?.forEach(button => {
        button.addEventListener('click', async function(event) {
            event.preventDefault();
            const addressId = this.getAttribute('data-id');
    
            try {
                const response = await fetch(`/profile/default-address/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ addressId: addressId })
                });
    
                if (response.ok) {
                    messageAddress.innerHTML = 'Default address updated successfully.';
                } else {
                    console.error('Error updating default address:', response.statusText);
                }
            } catch (error) {
                console.error('Error updating default address:', error);
            }
        });
    });

    buyagain?.forEach( function(buybtn){
        buybtn?.addEventListener('click', function (event){
            event.stopPropagation();
        });
    });

    orderFilter?.forEach( function(input){
        input?.addEventListener('change', function(item){
            document.getElementById('orderFilter')?.submit();
        }) 
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


    
});



function profileValidation(fieldName) {

    if(fieldName == 'firstname'){
        const value = document.getElementById(fieldName).value.trim().replace(/\s{2,}/g, '');
        const isValid = /^(\S\s*){3,}$/.test(value);
        if (!isValid) {
            showError(fieldName, 'First Name is required!');
        }
        return isValid;

    } else if(fieldName == 'lastname'){
        const value = document.getElementById(fieldName).value.trim().replace(/\s{2,}/g, '');
        const isValid = /^(\S\s*){1,}$/.test(value);
        if (!isValid) {
            showError(fieldName, 'Lastname is required!');
        };
        return isValid;
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(`${elementId}-text`);
        if(errorElement){
            errorElement.textContent = message;
        }
    }
    return true;
}
