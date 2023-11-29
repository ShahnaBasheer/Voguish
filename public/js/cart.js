document.addEventListener('DOMContentLoaded', function() {
    const quantityInput = document.getElementById('quantityInput');
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');

    
    minusBtn?.addEventListener('click', function(e) {
        if (quantityInput.value > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
        }else {
            minusBtn.disabled = true;
            e.preventDefault();
        }
    });
  

    plusBtn?.addEventListener('click', function() {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    });
  
    
    quantityInput?.addEventListener('input', function(event) {
        const cleanedValue = event.target.value.replace(/[^\d]/g, '');
        event.target.value = cleanedValue || 1;
    });

});