// Funciones principales del sitio

// Activar/desactivar menú móvil
function toggleMobileMenu() {
    const mainNav = document.querySelector('.main-nav');
    mainNav.classList.toggle('active');
}

// Inicializar elementos dinámicos de la página
function initSite() {
    // Agregar toggle de menú móvil si estamos en móvil
    const mobileMenuToggle = document.createElement('div');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    // Solo agregar el toggle si estamos en viewport móvil
    if (window.innerWidth <= 768) {
        const headerWrapper = document.querySelector('.header-wrapper');
        if (headerWrapper) {
            headerWrapper.insertBefore(mobileMenuToggle, headerWrapper.firstChild);
        }
    }

    // Inicializar búsqueda
    initSearch();

    // Inicializar carrito
    initCart();

    // Inicializar carrusel si existe
    initCarousel();

    // Añadir desplazamiento suave para enlaces internos
    initSmoothScroll();

    // Inicializar formularios con validación
    initForms();
}

// Inicializar funcionalidad de búsqueda
function initSearch() {
    const searchIcon = document.querySelector('.search-icon');
    if (!searchIcon) return;

    searchIcon.addEventListener('click', () => {
        // Crear y mostrar overlay de búsqueda
        const searchOverlay = document.createElement('div');
        searchOverlay.className = 'search-overlay';

        searchOverlay.innerHTML = `
            <div class="search-modal">
                <form class="search-form">
                    <input type="text" placeholder="ابحث عن المنتجات..." autofocus>
                    <button type="submit"><i class="fas fa-search"></i></button>
                </form>
                <button class="close-search"><i class="fas fa-times"></i></button>
            </div>
        `;

        document.body.appendChild(searchOverlay);
        document.body.classList.add('no-scroll');

        // Enfocar el input de búsqueda
        setTimeout(() => {
            const searchInput = document.querySelector('.search-form input');
            if (searchInput) searchInput.focus();
        }, 100);

        // Manejar cierre de búsqueda
        const closeButton = searchOverlay.querySelector('.close-search');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(searchOverlay);
            document.body.classList.remove('no-scroll');
        });

        // Manejar submit del formulario
        const searchForm = searchOverlay.querySelector('.search-form');
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchForm.querySelector('input').value.trim();

            if (searchTerm.length > 0) {
                // Redirigir a la página de resultados de búsqueda
                window.location.href = `search-results.html?q=${encodeURIComponent(searchTerm)}`;
            }
        });
    });
}

// Inicializar funcionalidad del carrito
function initCart() {
    const cartIcon = document.querySelector('.shopping-cart');
    if (!cartIcon) return;

    cartIcon.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

    // Actualizar contador de carrito
    updateCartCount();
}

// Actualizar contador de elementos en el carrito
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;

    // Si estamos usando Firebase, la actualización viene del script firebase-config.js
    // Pero podemos tener lógica adicional aquí si es necesario
}

// Inicializar carrusel
function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 0;

    // Configurar carrusel
    function setupCarousel() {
        // Mostrar el primer slide
        slides[0].classList.add('active');

        // Añadir navegación
        const navDots = document.createElement('div');
        navDots.className = 'carousel-dots';

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = i === 0 ? 'dot active' : 'dot';
            dot.setAttribute('data-slide', i);
            dot.addEventListener('click', () => {
                goToSlide(i);
            });
            navDots.appendChild(dot);
        }

        carousel.appendChild(navDots);

        // Añadir botones de navegación
        const prevButton = document.createElement('button');
        prevButton.className = 'carousel-nav prev';
        prevButton.innerHTML = '<i class="fas fa-chevron-right"></i>'; // Derecha para RTL
        prevButton.addEventListener('click', prevSlide);

        const nextButton = document.createElement('button');
        nextButton.className = 'carousel-nav next';
        nextButton.innerHTML = '<i class="fas fa-chevron-left"></i>'; // Izquierda para RTL
        nextButton.addEventListener('click', nextSlide);

        carousel.appendChild(prevButton);
        carousel.appendChild(nextButton);
    }

    // Ir a slide específico
    function goToSlide(slideIndex) {
        slides[currentSlide].classList.remove('active');
        const dots = carousel.querySelectorAll('.dot');
        dots[currentSlide].classList.remove('active');

        currentSlide = slideIndex;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    // Ir al slide anterior
    function prevSlide() {
        let newIndex = currentSlide - 1;
        if (newIndex < 0) {
            newIndex = totalSlides - 1;
        }
        goToSlide(newIndex);
    }

    // Ir al siguiente slide
    function nextSlide() {
        let newIndex = currentSlide + 1;
        if (newIndex >= totalSlides) {
            newIndex = 0;
        }
        goToSlide(newIndex);
    }

    // Auto-rotación del carrusel
    let carouselInterval;

    function startCarouselInterval() {
        carouselInterval = setInterval(nextSlide, 5000);
    }

    function stopCarouselInterval() {
        clearInterval(carouselInterval);
    }

    // Configurar interacciones
    carousel.addEventListener('mouseenter', stopCarouselInterval);
    carousel.addEventListener('mouseleave', startCarouselInterval);

    // Iniciar carrusel
    setupCarousel();
    startCarouselInterval();
}

// Inicializar scroll suave para enlaces internos
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Inicializar validación de formularios
function initForms() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        // Evitar envío si hay campos inválidos
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();

                // Resaltar los campos inválidos
                highlightInvalidFields(form);
            }
        });

        // Validación en tiempo real
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    });
}

// Validar un campo individual
function validateField(field) {
    // Eliminar mensajes de error previos
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        field.parentNode.removeChild(existingError);
    }

    // Validar y mostrar errores si es necesario
    if (!field.checkValidity()) {
        field.classList.add('invalid');

        // Crear mensaje de error
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = getValidationMessage(field);

        // Insertar después del campo
        field.parentNode.insertBefore(errorMessage, field.nextSibling);

        return false;
    } else {
        field.classList.remove('invalid');
        return true;
    }
}

// Obtener mensaje personalizado según el tipo de error de validación
function getValidationMessage(field) {
    if (field.validity.valueMissing) {
        return 'هذا الحقل مطلوب';
    } else if (field.validity.typeMismatch) {
        if (field.type === 'email') {
            return 'يرجى إدخال عنوان بريد إلكتروني صالح';
        }
        return 'القيمة المدخلة غير صالحة';
    } else if (field.validity.tooShort) {
        return `يجب أن يحتوي هذا الحقل على ${field.minLength} أحرف على الأقل`;
    } else if (field.validity.tooLong) {
        return `يجب أن يحتوي هذا الحقل على ${field.maxLength} حرف كحد أقصى`;
    } else if (field.validity.patternMismatch) {
        return 'القيمة المدخلة لا تتطابق مع النمط المطلوب';
    }

    return 'هذا الحقل غير صالح';
}

// Resaltar todos los campos inválidos de un formulario
function highlightInvalidFields(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        validateField(input);
    });
}

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    initSite();

    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener('resize', () => {
        // Actualizar estado del menú móvil
        const headerWrapper = document.querySelector('.header-wrapper');
        const existingToggle = document.querySelector('.mobile-menu-toggle');

        if (window.innerWidth <= 768) {
            if (!existingToggle && headerWrapper) {
                const mobileMenuToggle = document.createElement('div');
                mobileMenuToggle.className = 'mobile-menu-toggle';
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                mobileMenuToggle.addEventListener('click', toggleMobileMenu);
                headerWrapper.insertBefore(mobileMenuToggle, headerWrapper.firstChild);
            }
        } else {
            if (existingToggle) {
                existingToggle.remove();
            }

            // Asegurar que el menú principal sea visible en desktop
            const mainNav = document.querySelector('.main-nav');
            if (mainNav) {
                mainNav.classList.remove('active');
            }
        }
    });
});
