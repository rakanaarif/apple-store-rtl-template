// JavaScript para página de detalle de producto

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidad de miniaturas
    initThumbnails();

    // Inicializar selección de variantes
    initVariantSelection();

    // Inicializar selector de cantidad
    initQuantitySelector();

    // Inicializar botones de acción
    initActionButtons();

    // Inicializar pestañas
    initTabs();
});

// Función para inicializar las miniaturas de la galería
function initThumbnails() {
    const thumbs = document.querySelectorAll('.thumb');
    const mainImage = document.getElementById('mainImage');

    if (!thumbs.length || !mainImage) return;

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Quitar la clase activa de todas las miniaturas
            thumbs.forEach(t => t.classList.remove('active'));

            // Añadir la clase activa a la miniatura clicada
            this.classList.add('active');

            // Actualizar la imagen principal
            const imgSrc = this.getAttribute('data-src');
            if (imgSrc) {
                mainImage.src = imgSrc;

                // Efecto de fade para el cambio de imagen
                mainImage.style.opacity = '0.5';
                setTimeout(() => {
                    mainImage.style.opacity = '1';
                }, 100);
            }
        });
    });
}

// Función para inicializar la selección de variantes (color, capacidad, etc.)
function initVariantSelection() {
    // Inicializar selección de color
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            // Actualizar precio o imágenes según el color seleccionado
            updateProductVariant();
        });
    });

    // Inicializar selección de capacidad
    const capacityOptions = document.querySelectorAll('.capacity-option');
    capacityOptions.forEach(option => {
        option.addEventListener('click', function() {
            capacityOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            // Actualizar precio según la capacidad seleccionada
            updateProductVariant();
        });
    });
}

// Función para actualizar variante de producto seleccionada
function updateProductVariant() {
    // Obtener variantes seleccionadas
    const selectedColor = document.querySelector('.color-option.active');
    const selectedCapacity = document.querySelector('.capacity-option.active');

    if (!selectedColor || !selectedCapacity) return;

    // Obtener valores
    const colorValue = selectedColor.getAttribute('data-color');
    const capacityValue = selectedCapacity.getAttribute('data-capacity');

    // Actualizar el código de producto
    const productIdElement = document.querySelector('.product-id span');
    if (productIdElement) {
        productIdElement.textContent = `رمز المنتج: IP15PRO-${capacityValue}-${colorValue}`;
    }

    // En una implementación real, aquí podríamos hacer una consulta a Firebase
    // para obtener el precio y disponibilidad de la variante específica

    // Simular un cambio de precio basado en la capacidad
    updatePriceBasedOnCapacity(capacityValue);
}

// Función para actualizar el precio basado en la capacidad
function updatePriceBasedOnCapacity(capacity) {
    const currentPriceElement = document.querySelector('.current-price');
    const oldPriceElement = document.querySelector('.old-price');

    if (!currentPriceElement || !oldPriceElement) return;

    // Precios base
    let basePrice = 4999;
    let oldBasePrice = 5499;

    // Ajustar precio según capacidad
    switch(capacity) {
        case '256':
            basePrice += 500;
            oldBasePrice += 500;
            break;
        case '512':
            basePrice += 1000;
            oldBasePrice += 1000;
            break;
        case '1TB':
            basePrice += 1500;
            oldBasePrice += 1500;
            break;
    }

    // Actualizar elementos de precio
    currentPriceElement.textContent = `${basePrice} ريال`;
    oldPriceElement.textContent = `${oldBasePrice} ريال`;
}

// Función para inicializar el selector de cantidad
function initQuantitySelector() {
    const decreaseBtn = document.querySelector('.quantity-btn.decrease');
    const increaseBtn = document.querySelector('.quantity-btn.increase');
    const quantityInput = document.getElementById('quantity');

    if (!decreaseBtn || !increaseBtn || !quantityInput) return;

    // Manejar botón de disminuir
    decreaseBtn.addEventListener('click', function() {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });

    // Manejar botón de aumentar
    increaseBtn.addEventListener('click', function() {
        let value = parseInt(quantityInput.value);
        const max = parseInt(quantityInput.getAttribute('max'));

        if (value < max) {
            quantityInput.value = value + 1;
        }
    });

    // Validar entrada manual
    quantityInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        const min = parseInt(this.getAttribute('min'));
        const max = parseInt(this.getAttribute('max'));

        if (isNaN(value) || value < min) {
            this.value = min;
        } else if (value > max) {
            this.value = max;
        }
    });
}

// Función para inicializar botones de acción (añadir al carrito, favoritos)
function initActionButtons() {
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const wishlistBtn = document.querySelector('.wishlist-btn');

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            addToCart();
        });
    }

    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function() {
            this.classList.toggle('active');

            // Si estuviéramos usando Firebase, aquí añadiríamos/eliminaríamos de la lista de deseos
            const isInWishlist = this.classList.contains('active');
            toggleWishlistItem(isInWishlist);
        });
    }
}

// Función para añadir al carrito
function addToCart() {
    // Obtener datos del producto
    const productId = document.querySelector('.product-id span').textContent.split(': ')[1];
    const colorValue = document.querySelector('.color-option.active').getAttribute('data-color');
    const capacityValue = document.querySelector('.capacity-option.active').getAttribute('data-capacity');
    const quantity = parseInt(document.getElementById('quantity').value);

    // En una implementación real, aquí llamaríamos a la función addToCart de Firebase
    // Pero para esta demo, mostraremos un mensaje de confirmación

    // Crear y mostrar notificación
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>تمت إضافة المنتج إلى سلة التسوق</span>
        <button class="close-notification"><i class="fas fa-times"></i></button>
    `;

    document.body.appendChild(notification);

    // Mostrar la notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Ocultar y eliminar la notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);

    // Añadir manejador de evento para cerrar la notificación
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });

    // Actualizar contador del carrito
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const currentCount = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = currentCount + quantity;
    }
}

// Función para añadir/eliminar de la lista de deseos
function toggleWishlistItem(isInWishlist) {
    // Aquí implementaríamos la lógica para Firebase

    // Crear y mostrar notificación
    const message = isInWishlist ?
        'تمت إضافة المنتج إلى المفضلة' :
        'تمت إزالة المنتج من المفضلة';

    const notification = document.createElement('div');
    notification.className = 'notification info';
    notification.innerHTML = `
        <i class="fas fa-${isInWishlist ? 'heart' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification"><i class="fas fa-times"></i></button>
    `;

    document.body.appendChild(notification);

    // Mostrar la notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Ocultar y eliminar la notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);

    // Añadir manejador de evento para cerrar la notificación
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
}

// Función para inicializar las pestañas de información del producto
function initTabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    if (!tabItems.length || !tabContents.length) return;

    tabItems.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            // Quitar clase activa de todas las pestañas y contenidos
            tabItems.forEach(item => item.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Añadir clase activa a la pestaña clicada y su contenido correspondiente
            this.classList.add('active');

            const tabId = this.getAttribute('data-tab');
            const activeContent = document.getElementById(tabId);

            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
}
