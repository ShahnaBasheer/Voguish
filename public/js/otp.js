
document.addEventListener("DOMContentLoaded", function() {

    const inputs = document.querySelectorAll('#otp > *[id]');
    const resendLink = document.getElementById('resend');
    const resendCodeMessage = document.getElementById('resendCode');
    const otpVerifyForm = document.getElementById('otpVerifyForm');
    const timer = document.getElementById('timer');
    const otpmessage = document.getElementById('message');
    const resendmessage = document.getElementById('resendmessage');
    let timerInterval; 
    
    for (let i = 0; i < inputs.length; i++) {
        
        inputs[i].addEventListener('keydown', function(event) {
            if (event.key === "Backspace") {
                if (this.value === '' && i !== 0) {
                    inputs[i - 1].focus();
                }
            } else if (event.key === "ArrowLeft") {
                if (i !== 0) {
                    inputs[i - 1].focus();
                }
            } else if (event.key === "ArrowRight") {
                if (i !== inputs.length - 1) {
                    inputs[i + 1].focus();
                }
            } else {
                if (i === inputs.length - 1 && this.value !== '') return true;
                else if ((event.keyCode > 47 && event.keyCode < 58)  || 
                   (event.keyCode > 64 && event.keyCode < 91) || 
                   (event.keyCode > 96 && event.keyCode < 123)) {
                    inputs[i].value = event.key;
                    if (i !== inputs.length - 1) inputs[i + 1].focus();
                    event.preventDefault();
                }
            }
        });
    }
    
    resendLink.addEventListener('click', async function(event) {
        event.preventDefault();
        otpmessage.textContent = '';
        clearInterval(timerInterval);
    
        const email = resendLink.getAttribute('data-email'); 
        try {
            const response = await fetch('/resend-otp', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email: email }) 
            });
            
            if (response.ok) {
                // OTP resent successfully
                const responseData = await response.json();
                resendmessage.textContent = responseData.message;
                setTimer();
            } else if (response.status === 404) {
                console.log(response)
                // OTP limit exceeded, handle this case
                clearInterval(timerInterval);
                window.location.href = '/signup';
            } else if (response.status === 429) {
                // Handle 429 status code (Too Many Requests)
                clearInterval(timerInterval);
                timer.textContent = '';
                resendmessage.textContent = 'Too many OTP requests. Try again later.';
            }
        } catch (error) {
            // Handle network errors, fetch API errors, etc.
            clearInterval(timerInterval);
            timer.textContent = '';
            console.error('Error:', error);
            resendmessage.textContent = 'Failed to resend code. Please check your internet connection.';
        }
    });


    function setTimer(){
        // Get the target date (10 minutes from now)
        const targetTime = new Date();
        targetTime.setMinutes(targetTime.getMinutes() + 2);
        
        // Update the countdown timer every second
        timerInterval = setInterval(function () {
            const currentTime = new Date();
            const timeDifference = targetTime - currentTime;
        
            // Calculate remaining minutes and seconds
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        
            // Display the remaining time
            const timerElement = document.getElementById('timer');
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
            if (timeDifference <= 0) {
                clearInterval(timerInterval);
                timerElement.textContent = '00:00';
            }
        }, 1000);
    }

    if(otpmessage.textContent == 'Expired OTP!'){//|| otpmessage.textContent == 'Invalid OTP!'
        clearInterval(timerInterval);
        timerElement.textContent = '';
    }else{
        setTimer();
    }

    otpVerifyForm?.addEventListener('submit', async function(event) {
        event.preventDefault();
    
        // Assuming you have the correct DOM manipulation to get OTP values
        const otpValues = Array.from(document.querySelectorAll('.inputs input')).map(input => input.value);
        console.log(document.getElementById('email').value)
    
        try {
            const response = await fetch('/otp-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    otp: otpValues.join(''),  // Combine individual OTP values into a single string
                    email: document.getElementById('email').value,
                }),
            });
            
            const data = await response.json();
            if (response.ok) {
                if(data?.redirect){
                    window.location.href = data.redirect;
                }
            } else {
                const message = document.getElementById('message');
                if(response.status == 422 || response.status == 401){
                     message.innerHTML = data.message;
                } else { console.log("error") } 
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
    /*inputs[i].addEventListener('input', function(event) {
        // Remove non-numeric characters and move focus to the next input
        this.value = this.value.replace(/\D/g, '');
        if (i !== inputs.length - 1 && this.value !== '') {
            inputs[i + 1].focus();
        }
    });*/