

document.addEventListener("DOMContentLoaded", function() {
    
    const emailInput = document.getElementById('email');

    emailInput?.addEventListener('blur', async function(event) {
        const emailError = document.getElementById('email-message');
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

    
    document.getElementById('user-form').addEventListener('submit', function(event) {
        event.preventDefault();
        resetErrorMessages();
        
        if(signupFormValidation()){
            this.submit();
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
    });

    function signupFormValidation() {
        const firstname = validateFirstname('firstname', 'First Name is required!');
        const lastname = validateLastname('lastname', 'Lastname is required!')
        const password = validatePassword('password', 'Password is required!');
        const confrmPassword = validateCnfrmPassword('confirmpassword');
    
        function validateFirstname(id, errorMessage) {
            const value = document.getElementById(id).value.trim().replace(/\s{2,}/g, '');
            const isValid = /^(\S\s*){3,}$/.test(value);
            if (!isValid) {
                showError(id, errorMessage);;
            }else validMessage(id);
            return isValid;
        }

        function validateLastname(id, errorMessage) {
            const value = document.getElementById(id).value.trim().replace(/\s{2,}/g, '');
            const isValid = /^(\S\s*){1,}$/.test(value);
            if (!isValid) {
                showError(id, errorMessage);;
            }else validMessage(id);
            return isValid;
        }
    
        function validatePassword(id, errorMessage){
            const value = document.getElementById(id).value;
            if (value.includes(' ')) {
                showError(id, errorMessage);
                return false;
            }
            validMessage(id);
            return true;
        }
        
        function validateCnfrmPassword(id){
            if(document.getElementById('password').value === document.getElementById(id).value){
                validMessage(id, 'Passwords Confirmed!');
                return true;
            } else {showError(id, 'Passwords do not match!'); }

            return false;
        } 
    
        function showError(elementId, message) {
            const errorElement = document.getElementById(`${elementId}-message`);
            if(errorElement){
                errorElement.classList.remove('text-danger', 'text-success');
                errorElement.classList.add('text-danger');
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }
    
        function validMessage(elementId){
            const element = document.getElementById(`${elementId}-message`);
            if(element){
                element.classList.remove('text-danger', 'text-success');
                element.classList.add('text-success');
                element.textContent = "Input is Valid!";
                element.style.display = 'block';
            }
        }
        return firstname && lastname && password && confrmPassword;
    }

});