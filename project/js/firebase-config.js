// Firebase Configuration
// IMPORTANTE: Reemplazar estos valores con la configuración real de tu proyecto Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Verificar estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuario está autenticado
        console.log("Usuario autenticado:", user.uid);
        // Actualizar UI para usuario autenticado
        updateUIForAuthenticatedUser(user);
    } else {
        // Usuario no está autenticado
        console.log("Usuario no autenticado");
        // Actualizar UI para usuario no autenticado
        updateUIForUnauthenticatedUser();
    }
});

// Actualizar UI para usuario autenticado
function updateUIForAuthenticatedUser(user) {
    // Elementos de UI para actualizar
    const accountIcon = document.querySelector('.user-account');

    if (accountIcon) {
        // Cambiar ícono y añadir clase que indique que el usuario está autenticado
        accountIcon.innerHTML = '<i class="fas fa-user-check"></i>';
        accountIcon.classList.add('authenticated');

        // Añadir manejador de eventos para ir al perfil
        accountIcon.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }
}

// Actualizar UI para usuario no autenticado
function updateUIForUnauthenticatedUser() {
    // Elementos de UI para actualizar
    const accountIcon = document.querySelector('.user-account');

    if (accountIcon) {
        // Volver al ícono original
        accountIcon.innerHTML = '<i class="fas fa-user"></i>';
        accountIcon.classList.remove('authenticated');

        // Añadir manejador de eventos para ir a la página de login
        accountIcon.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
}

// Función para registrar un nuevo usuario
function registerUser(email, password, displayName) {
    return auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Actualizar el perfil del usuario
            return userCredential.user.updateProfile({
                displayName: displayName
            }).then(() => {
                // Crear documento de usuario en Firestore
                return db.collection('users').doc(userCredential.user.uid).set({
                    displayName: displayName,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'customer'
                });
            }).then(() => {
                return userCredential.user;
            });
        });
}

// Función para iniciar sesión
function loginUser(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

// Función para cerrar sesión
function logoutUser() {
    return auth.signOut();
}

// Función para recuperar contraseña
function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
}

// Función para cargar productos desde Firestore
function loadProducts(category = null, limit = 10) {
    let query = db.collection('products');

    if (category) {
        query = query.where('category', '==', category);
    }

    return query.limit(limit).get()
        .then(snapshot => {
            const products = [];
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return products;
        });
}

// Función para obtener un producto específico
function getProduct(productId) {
    return db.collection('products').doc(productId).get()
        .then(doc => {
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            } else {
                throw new Error('Producto no encontrado');
            }
        });
}

// Función para añadir producto al carrito
function addToCart(productId, quantity = 1) {
    const user = auth.currentUser;

    if (!user) {
        // Si el usuario no está autenticado, almacenar en localStorage
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item => item.productId === productId);

        if (existingItemIndex !== -1) {
            // Actualizar cantidad si el producto ya está en el carrito
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Agregar nuevo producto al carrito
            cart.push({
                productId,
                quantity
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        return Promise.resolve(cart);
    } else {
        // Si el usuario está autenticado, almacenar en Firestore
        const cartRef = db.collection('carts').doc(user.uid);

        return cartRef.get()
            .then(doc => {
                if (doc.exists) {
                    // El carrito ya existe
                    const cartData = doc.data();
                    const items = cartData.items || [];
                    const existingItemIndex = items.findIndex(item => item.productId === productId);

                    if (existingItemIndex !== -1) {
                        // Actualizar cantidad si el producto ya está en el carrito
                        items[existingItemIndex].quantity += quantity;
                    } else {
                        // Agregar nuevo producto al carrito
                        items.push({
                            productId,
                            quantity
                        });
                    }

                    return cartRef.update({
                        items,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    // Crear nuevo carrito
                    return cartRef.set({
                        items: [{
                            productId,
                            quantity
                        }],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            })
            .then(() => {
                updateCartUI();
                return cartRef.get();
            })
            .then(doc => doc.data().items);
    }
}

// Función para actualizar la UI del carrito
function updateCartUI() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;

    const user = auth.currentUser;

    if (!user) {
        // Si el usuario no está autenticado, obtener del localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = itemCount;
    } else {
        // Si el usuario está autenticado, obtener de Firestore
        db.collection('carts').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const cartData = doc.data();
                    const items = cartData.items || [];
                    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
                    cartCountElement.textContent = itemCount;
                } else {
                    cartCountElement.textContent = '0';
                }
            })
            .catch(error => {
                console.error("Error al obtener el carrito:", error);
                cartCountElement.textContent = '0';
            });
    }
}

// Función para crear una orden
function createOrder(orderData) {
    const user = auth.currentUser;

    if (!user) {
        return Promise.reject(new Error('Usuario no autenticado'));
    }

    // Agregar información del usuario y timestamp
    const order = {
        ...orderData,
        userId: user.uid,
        userEmail: user.email,
        status: 'pendiente',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    return db.collection('orders').add(order)
        .then(docRef => {
            // Vaciar el carrito después de crear la orden
            return db.collection('carts').doc(user.uid).update({
                items: [],
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                updateCartUI();
                return docRef.id; // Retornar el ID de la orden
            });
        });
}

// Función para subir una imagen a Firebase Storage
function uploadImage(file, path) {
    const storageRef = storage.ref();
    const imageRef = storageRef.child(path);

    return imageRef.put(file)
        .then(snapshot => {
            return snapshot.ref.getDownloadURL();
        });
}

// Inicializar la UI del carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    // Manejador para botones de añadir al carrito
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productItem = event.target.closest('.product-item');
            if (productItem) {
                const productId = productItem.dataset.productId;
                addToCart(productId, 1)
                    .then(() => {
                        // Mostrar mensaje de éxito
                        alert('¡Producto añadido al carrito!');
                    })
                    .catch(error => {
                        console.error("Error al añadir al carrito:", error);
                        alert('Error al añadir el producto al carrito');
                    });
            }
        });
    });
});
