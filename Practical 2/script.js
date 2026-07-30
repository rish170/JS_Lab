// Demonstrating 'const' for unchangeable data array
const productsList = [
    { id: 1, name: 'Smartphone', price: 45000, icon: '📱' },
    { id: 2, name: 'Smart TV', price: 65000, icon: '📺' },
    { id: 3, name: 'Laptop', price: 85000, icon: '💻' },
    { id: 4, name: 'Headphones', price: 12000, icon: '🎧' },
    { id: 5, name: 'Smartwatch', price: 25000, icon: '⌚' },
    { id: 6, name: 'Wireless Mouse', price: 1500, icon: '🖱️' }
];

// Demonstrating 'let' for variable that changes
let cart = {};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Demonstrating 'var' (function-scoped, hoisting). We use it here just for the practical requirement.
    var gridContainer = document.getElementById('productsGrid');

    // Render products dynamically using Template Literals
    productsList.forEach(product => {
        // Demonstrating destructuring
        const { id, name, price, icon } = product;
        
        // Initialize cart quantity for this product
        cart[id] = 0;

        const card = document.createElement('div');
        card.className = 'flashcard';
        // Template literals for HTML generation
        card.innerHTML = `
            <div class="product-icon">${icon}</div>
            <h3 class="product-title">${name}</h3>
            <p class="product-price">₹${price.toLocaleString()}</p>
            <div class="cart-controls">
                <button type="button" class="btn-qty" onclick="updateCart(${id}, -1)">-</button>
                <span class="qty-display" id="qty-${id}">0</span>
                <button type="button" class="btn-qty" onclick="updateCart(${id}, 1)">+</button>
            </div>
        `;
        gridContainer.appendChild(card);
    });

    // Gift checkbox toggle
    const giftCheckbox = document.getElementById('giftCheckbox');
    const giftMessageContainer = document.getElementById('giftMessageContainer');
    const giftMessage = document.getElementById('giftMessage');
    const wordCount = document.getElementById('wordCount');

    giftCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            giftMessageContainer.classList.remove('hidden');
        } else {
            giftMessageContainer.classList.add('hidden');
            giftMessage.value = '';
            wordCount.textContent = '0 / 50 words';
        }
    });

    // Word limit validation
    giftMessage.addEventListener('input', (e) => {
        const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length > 50) {
            // Trim to 50 words
            e.target.value = words.slice(0, 50).join(' ');
            wordCount.textContent = '50 / 50 words (Limit Reached)';
            wordCount.style.color = 'red';
        } else {
            wordCount.textContent = `${words.length} / 50 words`;
            wordCount.style.color = '#6b7280';
        }
    });

    // Checkout form submission
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
});

// Global function to update cart quantity
window.updateCart = function(productId, change) {
    let currentQty = cart[productId];
    let newQty = currentQty + change;
    
    if (newQty < 0) newQty = 0; // Prevent negative quantities
    
    cart[productId] = newQty;
    document.getElementById(`qty-${productId}`).textContent = newQty;
};

// Handle checkout logic
function handleCheckout(e) {
    e.preventDefault();

    // Check if cart is empty
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    if (totalItems === 0) {
        alert("Your cart is empty! Please add some items.");
        return;
    }

    const address = document.getElementById('address').value.trim();
    const paymentMode = document.getElementById('paymentMode').value;
    
    // Validate inputs
    if (!address) {
        alert("Please enter a delivery address.");
        return;
    }
    if (!paymentMode) {
        alert("Please select a mode of payment.");
        return;
    }

    // Process Cart and calculate totals
    let subtotal = 0;
    let receiptItems = '';

    productsList.forEach(product => {
        // Destructuring inside loop
        const { id, name, price } = product;
        const qty = cart[id];
        
        if (qty > 0) {
            const itemTotal = price * qty;
            subtotal += itemTotal;
            // Template literals
            receiptItems += `${name.padEnd(20)} x${qty}    ₹${itemTotal.toLocaleString()}\n`;
        }
    });

    // Calculate taxes and delivery
    const GST_RATE = 0.18;
    const gstAmount = subtotal * GST_RATE;
    
    let deliveryCharge = 0;
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
    if (deliveryType === 'express') {
        deliveryCharge = 149;
    }

    const grandTotal = subtotal + gstAmount + deliveryCharge;

    // Destructuring object properties for form values
    const formValues = {
        giftMode: document.getElementById('giftCheckbox').checked,
        msg: document.getElementById('giftMessage').value,
        addr: address,
        payMode: paymentMode
    };
    
    const { giftMode, msg, addr, payMode } = formValues;

    // Generate Receipt using Template Literals
    const receiptString = `
=========================================
            TECHSTORE RECEIPT            
=========================================
DELIVERY ADDRESS:
${addr}

PAYMENT MODE: ${payMode}
DELIVERY TYPE: ${deliveryType === 'express' ? 'Express (24h)' : 'Standard (4-5 days)'}
${giftMode ? `GIFT MESSAGE:\n"${msg}"\n` : ''}
-----------------------------------------
ITEMS:
${receiptItems}
-----------------------------------------
Subtotal:                 ₹${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
GST (18%):                ₹${gstAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Delivery Charge:          ₹${deliveryCharge.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}

GRAND TOTAL:              ₹${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
=========================================
Thank you for shopping with us!
`;

    // Display receipt UI
    document.getElementById('receiptContent').innerHTML = `<pre>${receiptString}</pre>`;
    document.getElementById('receiptSection').classList.remove('hidden');
    
    // Show browser alert
    alert(`Order placed successfully!\n\nGrand Total: ₹${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n\nCheck the receipt at the bottom of the page.`);
}
