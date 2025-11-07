let timeoutId;

function debounce(cb, dely = 5_00) {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    cb();
  }, dely);
}

const categories = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "motorcycle",
  "skin-care",
  "smartphones",
  "sports-accessories",
  "sunglasses",
  "tablets",
  "tops",
  "vehicle",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches"
];

let productsResponse = [];
let productsResponsePagination = [];
let popularProducts = [];
let numProducts;
let numPages;

async function fetchProducts() {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=30");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    productsResponse = data.products;
    numProducts = data.total;

  } catch (error) {
    console.error("Could not fetch products:", error);
    list.innerHTML = `<p class="error-list">Failed to load products. Please check your network connection.</p>`;
    productsResponse = [];

  }
}

async function fetchProductsPagination(skipNum, limitNum) {
  console.log('im here')
  try {
    const response = await fetch(`https://dummyjson.com/products?limit=${limitNum}&skip=${skipNum}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    productsResponsePagination = data.products;
    console.log('fetchin....')
    console.log(productsResponsePagination.length);


  } catch (error) {
    console.error("Could not fetch products:", error);
    list.innerHTML = `<p class="error-list">Failed to load products. Please check your network connection.</p>`;
    productsResponsePagination = [];

  }
}





const list = document.querySelector("#main-list");
const input = document.querySelector("#search-input");
const popupContainer = document.querySelector("#products-details-popup");
const popup = document.querySelector('#products-details-content');
const popupTitle = document.querySelector('#popup-title');
const popupContent = document.querySelector('#popup-content');
const imgPopup = document.querySelector("#img-popup");
const cart = document.querySelector("#badge");
input.addEventListener("input", searchProducts);



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
    renderProductsPagination(matchedProducts, list);
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

      const fetchedId = product.id;
      console.log(fetchedId);
      window.location.href = `details/product-details.html?id=${fetchedId}`;
    };

    popupContainer.addEventListener('click', (e) => {
      if (e.target === popupContainer) {
        popupContainer.classList.remove('active');
      }
    });
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
    return null;
  }
}

function renderProductsPagination(products, targetElement) {
  targetElement.innerHTML = "";

  if (products.length === 0) {
    targetElement.innerHTML = '<p class="empty-list">No products found.</p>';
    return;
  }

  products.forEach((p, index) => {
    const productElement = createProductElement(p);
    productElement.style.animationDelay = `${index * 0.1}s`;
    targetElement.appendChild(productElement);
    setTimeout(() => {
      productElement.classList.add('product-fade-in');
    }, 10);
  });
}

function renderProductsPagination(products, targetElement) {
  targetElement.innerHTML = "";

  if (products.length === 0) {
    targetElement.innerHTML = '<p class="empty-list">No products found.</p>';
    return;
  }

  products.forEach((p, index) => {
    const productElement = createProductElement(p);
    productElement.style.animationDelay = `${index * 0.1}s`;
    targetElement.appendChild(productElement);
    setTimeout(() => {
      productElement.classList.add('product-fade-in');
    }, 10);
  });
}




function showLoadingState() {
  const loadingHtml = `
    <div class="skeleton-loader"></div>
    <div class="skeleton-loader"></div>
    <div class="skeleton-loader"></div>
    <div class="skeleton-loader"></div>
  `;
  list.innerHTML = loadingHtml;
}


async function renderAllSections() {
  showLoadingState();

  await fetchProducts();
  renderPages()


  await fetchProductsPagination(0, 30)
  await paginationFunctionality();

  console.log(productsResponsePagination);
  setTimeout(() => {
    if (productsResponsePagination.length > 0) {
      renderProductsPagination(productsResponsePagination, list);
    } else {

      if (!list.innerHTML.includes('error-list')) {
        list.innerHTML = "empty";
      }
    }
  }, 1500);
}




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



const categorySelect = document.querySelector("#categories");
categories.forEach(category => {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  categorySelect.appendChild(option);
});


async function renderPages() {


  const pageSelect = document.querySelector("#pages");
 
  await fetchProducts();
  if (!numProducts || numProducts <= 0) return;

  numPages = Math.ceil(numProducts / 30);

  pageSelect.innerHTML = '';

  for (let i = 1; i <= numPages; i++) {
    const page = document.createElement("button");
    page.classList.add("pagenum");
    page.innerText = i;
    page.dataset.page = String(i);
    pageSelect.appendChild(page);
  }


}

async function paginationFunctionality() {
  await renderPages();


  const pageButtons = document.querySelectorAll('.pagenum');
  if (!pageButtons || pageButtons.length === 0) {
    console.warn('paginationFunctionality: no .pagenum buttons found');
    return;
  }

  pageButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const pageStr = e.currentTarget.dataset.page || e.currentTarget.innerText;
      const pageNum = parseInt(pageStr, 10);
      if (Number.isNaN(pageNum)) return;
      console.log('pagination: clicked page', pageNum);

      const limit = 30; 
      const skip = (pageNum - 1) * limit;
      await fetchProductsPagination(skip, limit);
    
      renderProductsPagination(productsResponsePagination, list);
     
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

}





categorySelect.addEventListener("change", categorizeProducts);
function categorizeProducts(e) {

  const inputValue = categorySelect.value.toLowerCase();
  const matchedProducts = productsResponsePagination.filter((product) =>
    product.category.toLowerCase().includes(inputValue)
  );
  renderProductsPagination(matchedProducts, list);

}

const priceMinSelect = document.querySelector(".min-input");
const priceMaxSelect = document.querySelector(".max-input");


priceMaxSelect.addEventListener("change", filterByPrice);
priceMinSelect.addEventListener("change", filterByPrice);
function filterByPrice(e) {
  const matchedProducts = productsResponsePagination.filter((product) =>
    product.price > priceMinSelect.value && product.price<priceMaxSelect.value);
  renderProductsPagination(matchedProducts, list);
}

loadDarkModePreference();
loadCartFromLocalStorage();
renderAllSections(); 
