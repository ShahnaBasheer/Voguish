const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const emailError = document.getElementById('email-error');
const phoneError = document.getElementById('phone-error');


emailInput?.addEventListener('blur', async function(event) {
    const email = emailInput.value;
    if (email) {
        const response = await fetch(`/check-email?email=${email}`);
        const data = await response.json();

        if (data.exists == "Email available!") {
            emailError.style.color = 'green';
        } else {
            emailError.style.color = 'red';
        }
        emailError.textContent = data.exists;
    }
});

phoneInput?.addEventListener('blur', async function(event) {
    const phone = phoneInput.value;
    if (phone) {
        const response = await fetch(`/check-phone?phone=${phone}`);
        const data = await response.json();
   
        if (data.exists == "Phone number available!") {
            phoneError.style.color = 'green';
        } else {
            phoneError.style.color = 'red';
        }
        phoneError.textContent = data.exists;
    }

    
    document.getElementById('user-form').addEventListener('submit', function(event) {
        event.preventDefault();

        // Clear previous error messages
        clearErrorMessages();

        // Validation for First Name
        const firstName = document.getElementById('firstname').value.trim();
        if (firstName === '') {
            displayErrorMessage('firstname', 'First Name is required.');
            return;
        }

        // Validation for Last Name
        const lastName = document.getElementById('lastname').value.trim();
        if (lastName === '') {
            displayErrorMessage('lastname', 'Last Name is required.');
            return;
        }

        // Validation for Password
        const password = document.getElementById('password').value;
        if (password.includes(' ')) {
            displayErrorMessage('password', 'spaces not allowed');
            return;
        }
         // Validation for Password
         const confirmpassword = document.getElementById('confirmpassword').value;
         if (confirmpassword.includes(' ')) {
             displayErrorMessage('confirmpassword', 'spaces not allowed');
             return;
         }

        if (password !== confirmpassword) {
            displayErrorMessage('confirmpassword', 'Passwords do not match.');
            return;
        }
        this.submit();
    });

    function displayErrorMessage(elementId, message) {
        const errorElement = document.getElementById(`${elementId}-error`);
        errorElement.textContent = message;
        errorElement.classList.add('text-danger'); // You can style this class as needed
    }

    function clearErrorMessages() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.classList.remove('text-danger');
        });
    }

});
