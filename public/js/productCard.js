document.addEventListener('DOMContentLoaded', function() {
    const addToWishlistBtn = document.querySelectorAll('.addToWishlist');
    
    addToWishlistBtn.forEach( addTo => {
        addTo.addEventListener('click', async (event) => {
            event.preventDefault()
            try {
                const response = await fetch(addTo.getAttribute('href'), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
               
                if (response.ok) {
                    console.log(response)
                } else {
                    console.error('Failed to add to wishlist');
                }
            } catch (error) {
                console.error('Error: ' + error);
            }
        });
    }); 
});