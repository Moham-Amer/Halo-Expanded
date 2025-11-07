let timeoutId;

function debounce(cb, dely = 5_00) {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    cb();
  }, dely);
}


let productsResponse = [];
let recommendedProducts = [];
let popularProducts = [];

async function fetchProducts() {
    try {
        const response = await fetch("https://dummyjson.com/products?limit=30");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        productsResponse = data.products;
        recommendedProducts = productsResponse.filter(p => p.id % 2 === 0);
        popularProducts = productsResponse.filter(p => p.id % 3 === 0);
 
      } catch (error) {
        console.error("Could not fetch products:", error);
        list.innerHTML = `<p class="error-list">Failed to load products. Please check your network connection.</p>`;
        productsResponse = [];
        recommendedProducts = [];
        popularProducts = [];
    }
    
}


const input = document.querySelector("#search-input");
const popupContainer = document.querySelector("#products-details-popup");
const popup = document.querySelector('#products-details-content');
const popupTitle = document.querySelector('#popup-title');
const popupContent = document.querySelector('#popup-content');
const imgPopup = document.querySelector("#img-popup");
const cart = document.querySelector("#badge");
input.addEventListener("input", searchProducts);


const recommendedList = document.querySelector("#recommended-list");
const popularList = document.querySelector("#popular-list");
const recommendedToggle = document.querySelector("#recommended-toggle");
const popularToggle = document.querySelector("#popular-toggle");
const carouselTrack = document.querySelector("#carousel-track");
const carouselPages = document.querySelectorAll(".carousel-page");

let currentCarouselIndex = 0;
let autoSlideInterval;

let cartList = [];


function loadCartFromLocalStorage() {
  const storedCart = localStorage.getItem('cartItems');
  if (storedCart) {
    cartList = JSON.parse(storedCart);
  }
  updateCartDisplay();
}

function saveCartToLocalStorage() {
  localStorage.setItem('cartItems', JSON.stringify(cartList));
}

function getInputValue() {
  return input.value;
}

function updateCartDisplay() {
  const uniqueItemCount = new Set(cartList.map(item => item.id)).size;
  cart.innerHTML = uniqueItemCount;
  saveCartToLocalStorage();
  if (cartSideNav.style.width === "350px") {
    renderCartSidenav();
  }
}

function renderCartSidenav() {
  cartItemsContainer.innerHTML = "";

  if (cartList.length === 0) {
    cartItemsContainer.innerHTML = "<p style='color:white; text-align:center; padding-top:20px;  font-size: 1.6rem;'>Add some products to your cart first.</p>";
  } else {
    const cartTitle = document.createElement("h2");
    cartTitle.textContent = "Your Cart";
    cartTitle.style.color = "white";
    cartTitle.style.textAlign = "center";
    cartTitle.style.marginBottom = "20px";
    cartItemsContainer.appendChild(cartTitle);

    const groupedCartItems = cartList.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = { ...item, quantity: 0 };
      }
      acc[item.id].quantity++;
      return acc;
    }, {});

    Object.values(groupedCartItems).forEach((product) => {
      const productDiv = document.createElement("div");
      productDiv.classList.add("cart-item");
      productDiv.dataset.productId = product.id;

      const img = document.createElement("img");
       img.src = product.thumbnail || product.imageUrl; 
      img.alt = product.title;

      const detailsDiv = document.createElement("div");
      detailsDiv.classList.add("cart-item-details");

      const title = document.createElement("h4");
      title.textContent = product.title;

      const priceText = document.createElement("p");
      priceText.textContent = `$${product.price.toFixed(2)}`;
      priceText.style.color = "#ccc";

      detailsDiv.appendChild(title);
      detailsDiv.appendChild(priceText);

      const controlsDiv = document.createElement("div");
      controlsDiv.classList.add("cart-item-controls");

      const decreaseButton = document.createElement("button");
      decreaseButton.textContent = "-";
      decreaseButton.onclick = () => decreaseQuantity(product.id);

      const quantitySpan = document.createElement("span");
      quantitySpan.textContent = product.quantity;
      quantitySpan.id = `quantity-${product.id}`;

      const increaseButton = document.createElement("button");
      increaseButton.textContent = "+";
      increaseButton.onclick = () => increaseQuantity(product.id);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Remove";
      deleteButton.onclick = () => deleteItem(product.id);

      controlsDiv.appendChild(decreaseButton);
      controlsDiv.appendChild(quantitySpan);
      controlsDiv.appendChild(increaseButton);
      controlsDiv.appendChild(deleteButton);

      productDiv.appendChild(img);
      productDiv.appendChild(detailsDiv);
      productDiv.appendChild(controlsDiv);

      cartItemsContainer.appendChild(productDiv);
    });

    const clearAllButton = document.createElement("button");
    clearAllButton.textContent = "Clear Cart";
    clearAllButton.classList.add("cart-clear-button");
    clearAllButton.onclick = clearCart;
    cartItemsContainer.appendChild(clearAllButton);

    const totalPrice = cartList.reduce((total, item) => total + item.price, 0);
    const totalPriceElement = document.createElement("p");
    totalPriceElement.textContent = `Total: $${totalPrice.toFixed(2)}`;
    totalPriceElement.style.color = "white";
    totalPriceElement.style.textAlign = "right";
    totalPriceElement.style.padding = "20px";
    totalPriceElement.style.fontSize = "1.2em";
    cartItemsContainer.appendChild(totalPriceElement);
  }
}

function increaseQuantity(productId) {
  const productToAdd = productsResponse.find(p => p.id === productId);
  if (productToAdd) {
    cartList.push(productToAdd);
    updateCartDisplay();
    saveCartToLocalStorage();
  }
}

function decreaseQuantity(productId) {
  const index = cartList.findIndex(p => p.id === productId);
  if (index !== -1) {
    cartList.splice(index, 1);
    updateCartDisplay();
    saveCartToLocalStorage();
  }
}

function deleteItem(productId) {
  cartList = cartList.filter(p => p.id !== productId);
  updateCartDisplay();
  saveCartToLocalStorage();
}

function clearCart() {
  cartList = [];
  updateCartDisplay();
  saveCartToLocalStorage();
  renderAllSections();
}

function searchProducts(e) {
  debounce(() => {
    const inputValue = getInputValue().toLowerCase();
    const matchedProducts = productsResponse.filter((product) =>
      product.title.toLowerCase().includes(inputValue)
    );
    renderProducts(matchedProducts, list);
  });
}





const cartButton = document.querySelector(".cart-button");

cartButton.addEventListener("click", () => {
  if (cartSideNav.style.width === "0px" || cartSideNav.style.width === "") {
    openNav();
    renderCartSidenav();
  } else {
    closeNav();
  }
});


const cartSideNav = document.getElementById("mySidenav");
const overlay = document.getElementById("overlay");
const closeBtn = document.querySelector(".closebtn");
const cartItemsContainer = document.getElementById("cart-items-container");

function openNav() {
  cartSideNav.style.width = "350px";
  overlay.style.width = "100%";
}

function closeNav() {
  cartSideNav.style.width = "0";
  overlay.style.width = "0";
}

closeBtn.addEventListener("click", closeNav);
overlay.addEventListener("click", closeNav);

function createProductElement(product) {
  try {
    const productElementContainer = document.createElement("div");
    const productElementImage = document.createElement("img");
    productElementImage.alt = product.title;
    const productElementTitle = document.createElement("h3");
    const productElementDescription = document.createElement("p");
    const productElementPrice = document.createElement("p");
    const productElementId = document.createElement("span");
    const productElementCartButton = document.createElement("button");
    const productElementProductSum = document.createElement("p");
    const productElementCartButtonMinus = document.createElement("button");

    productElementContainer.classList.add("product-card");
    productElementTitle.textContent = product.title;
    productElementDescription.textContent = product.description; 
    productElementPrice.textContent = `$${product.price.toFixed(2)}`;
    productElementPrice.classList.add("product-price");
    productElementId.textContent = `ID: ${product.id}`;
    productElementId.classList.add("product-id");

    productElementImage.src = product.thumbnail; 
    productElementImage.classList.add('product-image');
    const quantityControls = document.createElement("div");
    quantityControls.classList.add("quantity-controls");
    productElementProductSum.classList.add("product-id");


    const initialQuantity = cartList.filter(item => item.id === product.id).length;
    productElementProductSum.textContent = initialQuantity;

    productElementCartButton.textContent = "+";
    productElementCartButton.className = "addToCart";
    productElementCartButtonMinus.textContent = "-";
    productElementCartButtonMinus.className = "addToCart";

    productElementCartButton.onclick = function (e) {
      e.stopPropagation();
      cartList.push(product);
      updateCartDisplay();
      let currentValue = parseInt(productElementProductSum.textContent);
      productElementProductSum.textContent = currentValue + 1;
    };
    productElementContainer.onclick = function () {

      const fetchedId =product.id;
      console.log(fetchedId);
       window.location.href = `features/products/details/product-details.html?id=${fetchedId}`;
    };

    // Only add the popup click listener if the container exists and we haven't added it already
    if (popupContainer) {
      if (!popupContainer.dataset.listenerAdded) {
        popupContainer.addEventListener('click', (e) => {
          if (e.target === popupContainer) {
            popupContainer.classList.remove('active');
          }
        });
        popupContainer.dataset.listenerAdded = '1';
      }
    }
    productElementCartButtonMinus.onclick = function (e) {
      e.stopPropagation();
      const index = cartList.findIndex(p => p.id === product.id);
      if (index !== -1) {
        cartList.splice(index, 1);
        updateCartDisplay();
        let currentValue = parseInt(productElementProductSum.textContent);
        if (currentValue > 0) {
          productElementProductSum.textContent = currentValue - 1;
        }
      }
    };

    quantityControls.appendChild(productElementCartButton);
    quantityControls.appendChild(productElementProductSum);
    quantityControls.appendChild(productElementCartButtonMinus);

    productElementContainer.appendChild(productElementImage);
    productElementContainer.appendChild(productElementTitle);
    productElementContainer.appendChild(productElementDescription);
    productElementContainer.appendChild(productElementPrice);
    productElementContainer.appendChild(productElementId);
    productElementContainer.appendChild(quantityControls);

    return productElementContainer;
  } catch (error) {
    // Log the error so we don't silently fail creating product nodes
    console.error('createProductElement error for product:', product && product.id, error);
    return null;
  }
}

function renderProducts(products, targetElement) {
  if (!targetElement) {
    console.error('renderProducts: targetElement is null or undefined', targetElement, products);
    return;
  }

  targetElement.innerHTML = "";
  console.log(`renderProducts: rendering ${products.length} products into #${targetElement.id || targetElement.className}`);

  if (!Array.isArray(products) || products.length === 0) {
    targetElement.innerHTML = '<p class="empty-list">No products found.</p>';
    return;
  }

  products.forEach((product, idx) => {
    try {
      const productEl = createProductElement(product);
      if (productEl) {
        console.log('renderProducts: appending product', product.id, 'index', idx);
        targetElement.appendChild(productEl);
      } else {
        console.warn('renderProducts: createProductElement returned null for product', product && product.id);
      }
    } catch (err) {
      console.error('renderProducts: error appending product', product && product.id, err);
    }
  });

}

function showCarouselPage(index) {
  // console.log('im here')
  carouselTrack.style.transform = `translateX(-${index * 100}%)`;
  currentCarouselIndex = index;

  recommendedToggle.classList.remove('active');
  popularToggle.classList.remove('active');
  if (index === 0) {
    recommendedToggle.classList.add('active');
  } else {
    popularToggle.classList.add('active');
  }
}

function startAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    const nextIndex = (currentCarouselIndex + 1) % carouselPages.length;
    showCarouselPage(nextIndex);
  }, 5000);
}

function showLoadingState() {
  const loadingHtml = `
    <div class="skeleton-loader"></div>
    <div class="skeleton-loader"></div>
    <div class="skeleton-loader"></div>
    <div class="skeleton-loader"></div>
  `;
  recommendedList.innerHTML = loadingHtml;
  popularList.innerHTML = loadingHtml;
}


async function renderAllSections() {
  showLoadingState();

await fetchProducts();
console.log('productsResponse:', productsResponse);
console.log('recommendedProducts:', recommendedProducts);
console.log('popularProducts:', popularProducts);
  setTimeout(() => {
    if (productsResponse.length > 0) {
        console.log('test',popularProducts)
      renderProducts(recommendedProducts, recommendedList);
      renderProducts(popularProducts, popularList);
      showCarouselPage(0);
      startAutoSlide();
    } else {
 
       if (!list.innerHTML.includes('error-list')) {
           recommendedList.innerHTML = '<p class="empty-list">No recommended products available.</p>';
           popularList.innerHTML = '<p class="empty-list">No popular products available.</p>';
       }
    }
  }, 1500);
}


recommendedToggle.addEventListener('click', () => {
  showCarouselPage(0);
  startAutoSlide();

});

popularToggle.addEventListener('click', () => {
  showCarouselPage(1);
  startAutoSlide();
});

const nav = document.querySelector("nav");
const headerTitle = document.querySelector(".header-title");


window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
    headerTitle.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
    headerTitle.classList.remove("scrolled");
  }
});

const darkModeButton = document.getElementById("dark-mode-button");
const darkModeIcon = document.getElementById("dark-mode-icon");
const body = document.body;

function updateDarkModeIcon(isDarkMode) {
  if (isDarkMode) {
    darkModeIcon.classList.remove("fa-sun");
    darkModeIcon.classList.add("fa-moon");
  } else {
    darkModeIcon.classList.remove("fa-moon");
    darkModeIcon.classList.add("fa-sun");
  }
}

function toggleDarkMode() {
  body.classList.toggle("dark-mode");
  const isDarkMode = body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);
  updateDarkModeIcon(isDarkMode);
}

function loadDarkModePreference() {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  if (isDarkMode) {
    body.classList.add("dark-mode");
  }
  updateDarkModeIcon(isDarkMode);
}

darkModeButton.addEventListener("click", toggleDarkMode);










loadDarkModePreference();
loadCartFromLocalStorage();
renderAllSections(); 
