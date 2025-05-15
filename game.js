document.addEventListener('DOMContentLoaded', () => {
  const cartIcon = document.getElementById('cart-icon');
  const cart = document.querySelector('.cart');
  const closeCart = document.getElementById('close-cart');
  const addCartButtons = document.querySelectorAll('.add-cart');
  const cartContent = document.querySelector('.cart-content');
  const totalPriceElement = document.querySelector('.total-price');

  // Initialize the cart as an empty object
  let addedProducts = {};

  function renderCart() {
    cartContent.innerHTML = ''; // Clear the cart content
    for (const title in addedProducts) {
      const product = addedProducts[title];
      const cartBox = createCartBox(product.title, product.price, product.imgSrc, product.quantity);
      cartContent.appendChild(cartBox);
    }
    updateTotal();
  }

  cartIcon.onclick = () => {
    cart.classList.add('active');
  };

  closeCart.onclick = () => {
    cart.classList.remove('active');
  };

  addCartButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const productBox = event.target.closest('.product-box');
      const title = productBox?.querySelector('.product-title')?.innerText || "Unknown Product";
      const price = productBox?.querySelector('.price')?.innerText || "₦0";
      const imgSrc = productBox?.querySelector('.product-img')?.src || "";

      // Add product only if it's not already added
      if (addedProducts[title]) {
        alert('Already added to cart');
        return;
      }

      addProductToCart(title, price, imgSrc);
      updateTotal();
      saveCartToLocalStorage();
    });
  });

  function addProductToCart(title, price, imgSrc) {
    const cartBox = createCartBox(title, price, imgSrc, 1);
    cartContent.appendChild(cartBox);
    addedProducts[title] = { title, price, imgSrc, quantity: 1 };
  }

  function createCartBox(title, price, imgSrc, quantity) {
    const cartBox = document.createElement('div');
    cartBox.classList.add('cart-box');
    cartBox.innerHTML = `
      <img src="${imgSrc}" alt="" class="cart-img">
      <div class="detail-box">
        <div class="cart-product-title">${title}</div>
        <div class="cart-price">${price}</div>
        <input type="number" value="${quantity}" class="cart-quantity" min="1">
      </div>
      <i class='bx bx-trash-alt cart-remove'></i>
    `;

    cartBox.querySelector('.cart-remove').addEventListener('click', () => {
      cartBox.remove();
      delete addedProducts[title];
      updateTotal();
      saveCartToLocalStorage();
    });

    cartBox.querySelector('.cart-quantity').addEventListener('change', (e) => {
      const input = e.target;
      const newQuantity = input.value < 1 ? 1 : input.value;
      addedProducts[title].quantity = newQuantity;
      updateTotal();
      saveCartToLocalStorage();
    });

    return cartBox;
  }

  function updateTotal() {
    const cartBoxes = document.querySelectorAll('.cart-box');
    let total = 0;

    cartBoxes.forEach(cartBox => {
      const priceElement = cartBox.querySelector('.cart-price');
      const quantityElement = cartBox.querySelector('.cart-quantity');
      const price = parseFloat(priceElement.innerText.replace('₦', '').replace(/,/g, '')) || 0;
      const quantity = parseInt(quantityElement.value) || 1;
      total += price * quantity;
    });

    totalPriceElement.innerText = total === 0 ? '₦0' : '₦' + total.toLocaleString();
  }

  function saveCartToLocalStorage() {
    // Save the added products to localStorage (only when explicitly added)
    localStorage.setItem('cart', JSON.stringify(addedProducts));
  }

  // Load cart from localStorage if present
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    addedProducts = JSON.parse(savedCart);
    renderCart();
  }

  // LIVE PRODUCT SEARCH
  const searchInput = document.getElementById("searchInput");
  const products = document.querySelectorAll(".product-box");
  const resultText = document.getElementById("searchResult");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      let found = false;

      products.forEach(product => {
        const title = product.querySelector(".product-title")?.textContent.toLowerCase() || "";
        if (title.includes(query)) {
          product.style.display = "flex";
          found = true;
        } else {
          product.style.display = "none";
        }
      });

      resultText.textContent = query && !found ? "Product not available" : "";
    });
  }
});

// VOICE SEARCH
function startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Your browser does not support voice search.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("searchInput").value = transcript;

    // Trigger input event for live search
    const inputEvent = new Event("input", { bubbles: true });
    document.getElementById("searchInput").dispatchEvent(inputEvent);
  };

  recognition.onerror = function (event) {
    alert("Voice recognition error: " + event.error);
  };
}

// CHAT STORAGE HANDLING
const chatInput = document.getElementById('chat-input'); // input element for typing chat
const chatContainer = document.getElementById('chat-container'); // container where chat messages are shown

// Load saved chat on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedChat = localStorage.getItem('chatHistory');
  if (savedChat && chatContainer) {
    chatContainer.innerHTML = savedChat;
  }
});

// Save chat to localStorage on every keyup (when user types and sends message)
if (chatInput && chatContainer) {
  chatInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && chatInput.value.trim() !== '') {
      // Append typed message as a new chat message
      chatContainer.innerHTML += `<div class="chat-message">${chatInput.value.trim()}</div>`;
      // Save updated chat content
      localStorage.setItem('chatHistory', chatContainer.innerHTML);
      chatInput.value = ''; // Clear input after sending
      // Optionally scroll chat container down
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
}

// Clear chat button functionality
const clearChatBtn = document.getElementById('clear-chat');
if (clearChatBtn && chatContainer) {
  clearChatBtn.addEventListener('click', () => {
    localStorage.removeItem('chatHistory');
    chatContainer.innerHTML = '';
  });
}
