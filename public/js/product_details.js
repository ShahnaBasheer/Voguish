document.addEventListener('DOMContentLoaded', function() {
    
    const navCarouselCells = document.querySelectorAll('.carousel .carousel-cell');
    const carousel = new bootstrap.Carousel(document.getElementById('imgCarousel'));      
    const zoomerBoxes = document.querySelectorAll('#imgCarousel .carousel-item');
    const carouselContainer = document.getElementById('carouselVertical');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const carouselItems = document.querySelectorAll('#carouselVertical .carousel-item img');
    const carouselItemHeight = document.querySelector('.carousel-item').clientHeight;
    let currentIndex = 0;
    const sizeSelect = document.querySelectorAll('.size');
    const colorSelect = document.querySelectorAll('.color-wrap');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const goToCartBtn = document.getElementById('goToCartBtn');
    goToCartBtn.style.display = 'none';
    let selectedColor = document.querySelector('input[name="color"]:checked');
    const sizeAlert = document.getElementById('size-alert');
    const cartDelete = document.querySelectorAll('.cart-remove');
    const quantityInput = document.getElementById('quantityInput');
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');


    navCarouselCells.forEach((cell, index) => {
        cell.addEventListener('click', () => {
            carousel.to(index); // Move the carousel to the clicked thumbnail index
        });
    }); 

    carouselItems.forEach(function(item, index){
        item.addEventListener('click', function(){
            currentIndex = index;
            updateCarousel();
        });
    });

    prevBtn.addEventListener('click', function(){
        if (currentIndex > 0) {
            currentIndex--;
            //carousel.prev();
            updateCarousel();
        }
    });
    nextBtn.addEventListener('click', function(){
        if (currentIndex < carouselItems.length - 2) {
            currentIndex++;
            //carousel.next();
            updateCarousel();
        }
    });

    function updateCarousel() {
        const translateYValue = -currentIndex * carouselItemHeight;
        carouselContainer.style.transform = `translateY(${translateYValue}px)`;
        // enlargedImage.src = carouselItems[currentIndex].src;
    }

    zoomerBoxes.forEach(function(item,index){
        const original = item.querySelector('#imgCarousel .carousel-item img');
        const magnifiedImage = item.querySelector('.img-2');
     
        item.addEventListener('mousemove', function(e){     
            const boundingRect = this.getBoundingClientRect();
            const x = e.clientX - boundingRect.left;
            const y = e.clientY - boundingRect.top;
            const imgWidth = original.offsetWidth;
            const imgHeight = original.offsetHeight;
            let xperc = (x / imgWidth) * 100;
            let yperc = (y / imgHeight) * 100;
    
            // Allows user to scroll past right edge of the image
            if (x > 0.01 * imgWidth) { xperc += 0.15 * xperc;}
            // Allows user to scroll past bottom edge of the image
            if (y >= 0.01 * imgHeight) { yperc += 0.15 * yperc;}
    
            magnifiedImage.style.backgroundPositionX = `${xperc - 9}%`;
            magnifiedImage.style.backgroundPositionY = `${yperc - 9}%`;
            magnifiedImage.style.left = `${x - 180}px`;
            magnifiedImage.style.top = `${y - 180}px`;
        });
    
        item.addEventListener('mouseout', function() {
            magnifiedImage.style.backgroundImage = '';
            magnifiedImage.style.display = 'none';
        });
    
        item.addEventListener('mouseover', function() {
            const imageUrl = original.src; // Replace this with your actual image URL
            magnifiedImage.style.backgroundImage = `url(${imageUrl})`;
            magnifiedImage.style.display = 'block';
        });
    });
    

    if(selectedColor) {
        const colorQueryParam = `color=${selectedColor.value}`;
        addToCartBtn?.setAttribute('href', addQueryParam(addToCartBtn.getAttribute('href'),colorQueryParam));
    }

    colorSelect?.forEach(function(color){
        color.addEventListener('change',function(){
            const currentUrl = addToCartBtn.getAttribute('href'); 
            const hasColorParam = currentUrl.includes('color=');
            const colorQueryParam = `color=${this.value}`;
            const size = document.querySelector('.sizeselected');

            if(hasColorParam){
                addToCartBtn.setAttribute('href', currentUrl.replace(/color=[^&]*/, colorQueryParam ));
            }else{
                addToCartBtn.setAttribute('href', addQueryParam(currentUrl,colorQueryParam));  
            }
            if(size){
                const sizeUrl = size?.getAttribute('href');
                if(sizeUrl?.includes('color=')){
                    size.setAttribute('href',sizeUrl.replace(/color=[^&]*/, colorQueryParam ) )
                }else{
                    size.setAttribute('href',addQueryParam(sizeUrl,colorQueryParam)) 
                }
                addToCart(size.getAttribute('href'));
            }
            
        });
    });


    sizeSelect?.forEach(function(size){
        size.addEventListener('click', function(e){
            e.preventDefault();
            sizeAlert.innerHTML = ''; 
            selectedColor = document.querySelector('input[name="color"]:checked');
            sizeSelect.forEach(size => size.classList.remove('sizeselected'));
            size.classList.add('sizeselected');
            const currentUrl = addToCartBtn.getAttribute('href'); 
            const sizeUrl = this.getAttribute('href'); 
            const hasSizeParam = currentUrl.includes('size=');
            const sizeQueryParam = `size=${size.textContent}`;
            const colorQueryParam = `color=${selectedColor.value}`;

            if(hasSizeParam){
                addToCartBtn.setAttribute('href', currentUrl.replace(/size=[^&]*/, sizeQueryParam ));
            }else{
                addToCartBtn.setAttribute('href', addQueryParam(currentUrl,sizeQueryParam));  
            }

            if(sizeUrl.includes('color=')){
                this.setAttribute('href',sizeUrl.replace(/color=[^&]*/, colorQueryParam ) )
            }else{
                this.setAttribute('href',addQueryParam(sizeUrl,colorQueryParam)) 
            }
            addToCart(this.getAttribute('href'));     
        });  
    });

    addToCartBtn.addEventListener('click',function(e){
        const url = addToCartBtn.getAttribute('href');
        if(!addToCartBtn.getAttribute('href').includes('size=')){
            e.preventDefault();
            sizeAlert.innerHTML = 'select an available size'; 
        }
        addToCartBtn.setAttribute('href',addQueryParam(url,`qty=${quantityInput.value}`));        
    });

    minusBtn.addEventListener('click', function() {
        if (quantityInput.value > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
        }
    });
    
    plusBtn.addEventListener('click', function() {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    });
    
    quantityInput.addEventListener('input', function(event) {
        const cleanedValue = event.target.value.replace(/[^\d]/g, '');
        event.target.value = cleanedValue || 1;
    });

    function addToCart(url){
        fetch(url, {
            method: 'GET',
            }).then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            }).then(data => { 
                if(data.cartExist){
                    goToCartBtn.style.display = 'inline';
                    addToCartBtn.style.display = 'none'; 
                }else{
                    goToCartBtn.style.display = 'none';
                    addToCartBtn.style.display = 'inline'; 
                };  
    
            }).catch(error => { console.error('Error:', error); });
    }

    function addQueryParam(url,param) {
        return url.includes('?') ? `${url}&${param}` : `${url}?${param}`;
    }
});



