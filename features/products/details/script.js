
let productData;
const cart = document.querySelector("#badge");
let cartList = [];

function loadCartFromLocalStorage() {
  const storedCart = localStorage.getItem('cartItems');
  if (storedCart) {
    cartList = JSON.parse(storedCart);
  }
  updateCartDisplay();
}


function updateCartDisplay() {
  const uniqueItemCount = new Set(cartList.map(item => item.id)).size;
  cart.innerHTML = uniqueItemCount;
  saveCartToLocalStorage();
  if (cartSideNav.style.width === "350px") {
    renderCartSidenav();
  }
}

function saveCartToLocalStorage() {
  localStorage.setItem('cartItems', JSON.stringify(cartList));
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

function clearCart() {
  cartList = [];
  updateCartDisplay();
  saveCartToLocalStorage();
  renderAllSections();
}

function deleteItem(productId) {
  cartList = cartList.filter(p => p.id !== productId);
  updateCartDisplay();
  saveCartToLocalStorage();
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


productDetails = document.querySelector("#product-details")

async function fetchProduct() {

  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
  }

  const params = getQueryParams();
  productId = params.id;
  try {
    const response = await fetch(
      `https://dummyjson.com/products/${productId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    productData = data;

  } catch (error) {
    console.error("Could not fetch products:", error);
    list.innerHTML = `<p class="error-list">Failed to load products. Please check your network connection.</p>`;
  }


}

async function showProduct() {
  await fetchProduct();
  if (productData) {
    renderProduct(productData);
  } else {
    console.error("No product data to render");
  }
}

showProduct();



function createProductElement(product) {
  console.log("Creating product element for:", product);
  try {
    const productElementContainer = document.createElement("div");
    const productElementImage = document.createElement("img");
    productElementImage.alt = product.title;
    const productElementTitle = document.createElement("h3");
    const productElementDescription = document.createElement("p");
    const productElementPrice = document.createElement("p");
    const productElementDiscount = document.createElement("p");
    const productElementId = document.createElement("span");
    const productElementRating = document.createElement("span");
    const productElementCartButton = document.createElement("button");
    const productElementProductSum = document.createElement("p");
    const productElementCartButtonMinus = document.createElement("button");

    productElementContainer.classList.add("product-card");
    productElementTitle.textContent = product.title;

    productElementDescription.textContent = product.description;
    priceAfterDiscount =Math.ceil (product.price * product.discountPercentage / 100);
    productElementPrice.textContent = `$${priceAfterDiscount}`;
    productElementPrice.classList.add("product-price");
    productElementDiscount.textContent = `${product.discountPercentage.toFixed(2)} %`;
    productElementId.textContent = `ID: ${product.id}`;
    productElementId.classList.add("product-id");
    productElementRating.textContent = `Rating: ${product.rating}`;
    productElementRating.classList.add("product-rating");

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
      window.location.href = `product-details.html?id=${fetchedId}`;
    };


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
    productElementContainer.appendChild(productElementDiscount);
  productElementContainer.appendChild(productElementRating);

    
    productElementContainer.appendChild(quantityControls);

    return productElementContainer;
  } catch (error) {
    console.error("Error in createProductElement:", error);
    return null;
  }


}


function renderProduct(productData) {
  const productElement = createProductElement(productData);
  if (productElement) {
    productDetails.innerHTML = "";
    productDetails.appendChild(productElement);
  } else {
    console.error("createProductElement returned null or invalid node");
  }
}

loadCartFromLocalStorage();
loadDarkModePreference();
// console.log(productDetails)
// renderProduct(productData);

