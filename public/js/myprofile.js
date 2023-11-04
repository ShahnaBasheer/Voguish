
document.addEventListener('DOMContentLoaded', function() {
    const editLinks = document.querySelectorAll('.edit-link');
    const saveBtn = document.querySelectorAll('.save-button');
    const emailText = document.getElementById('email-text');
    const phoneText = document.getElementById('phone-text');
    const addressForm = document.querySelectorAll('.addressForm');
    const deleteAddress = document.querySelectorAll('.delete-address');
    const messageAddress = document.getElementById('addressMessage');
    const defaultAddres =  document.querySelectorAll('.default-address');

    
    editLinks.forEach(editLink => {
        editLink.addEventListener('click', function(event) {
          const fieldName = this.getAttribute('data-field');
          const saveButton = document.querySelector(`.save-button[data-field="${fieldName}"]`);
          const formField = document.querySelectorAll(`input[data-field="${fieldName}"]`);
    
          if(formField.length > 1){
               formField.forEach(item => {
                console.log(item)
                item.removeAttribute('disabled')
        })
          }else formField[0].removeAttribute('disabled');
          saveButton.style.display = 'inline';
          this.style.display = 'none';
        });
    });
    
    saveBtn.forEach(saveButton => {
      saveButton.addEventListener('click', async function(event) {
        event.preventDefault();
        emailText.innerHTML = '';
        phoneText.innerHTML = '';
        
        try{
            const fieldName = this.getAttribute('data-field');
            const inputElement = document.querySelector(`input[name="${fieldName}"]`);
            let inputValue = inputElement.value;
            if(fieldName == 'gender'){
                inputValue = document.querySelector(`input[name="${fieldName}"]:checked`).value;
            }
            let response = await fetch('/profile/edit/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ [fieldName]: inputValue }),
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
        }catch(error){
            console.log("error:",error)
        }
      });
    
    });
    

    addressForm.forEach(form => {
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

    deleteAddress.forEach(item => {
        item.addEventListener('click', async function(event) {
            event.preventDefault();
            const addressId = item.getAttribute('data-id');
            console.log(addressId,"djd")
    
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

    defaultAddres.forEach(button => {
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
});
 




