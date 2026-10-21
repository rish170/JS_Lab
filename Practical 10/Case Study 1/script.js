/**
 * Practical 10 - Case Study 1: Restaurant Orders
 * Aim: Load and display JSON data using fetch() and jQuery $.getJSON(); 
 *      render results dynamically in a table and compute totals.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const viewOrdersBtn = document.getElementById('viewOrdersBtn');
    const clearOrdersBtn = document.getElementById('clearOrdersBtn');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const totalOrdersDisplay = document.getElementById('totalOrdersDisplay');
    const totalSalesDisplay = document.getElementById('totalSalesDisplay');
    const orderCountBadge = document.getElementById('orderCountBadge');
    const activeMethodBadge = document.getElementById('activeMethodBadge');
    const methodDescription = document.getElementById('methodDescription');
    const statusBanner = document.getElementById('statusBanner');
    const btnUseFetch = document.getElementById('btnUseFetch');
    const btnUseJQuery = document.getElementById('btnUseJQuery');
    const btnIcon = document.getElementById('btnIcon');
    const btnText = document.getElementById('btnText');

    // Selected fetching technique ('fetch' or 'jquery')
    let selectedMethod = 'fetch';

    // Fallback dataset in case local file:// origin CORS restriction occurs
    const localFallbackData = [
        {
            orderId: "ORD-101",
            customerName: "Aarav Sharma",
            food: "Paneer Butter Masala & Naan",
            quantity: 2,
            totalAmount: 480.00,
            orderStatus: "Delivered"
        },
        {
            orderId: "ORD-102",
            customerName: "Sophia Martinez",
            food: "Truffle Mushroom Risotto",
            quantity: 1,
            totalAmount: 650.00,
            orderStatus: "Preparing"
        },
        {
            orderId: "ORD-103",
            customerName: "Rohan Verma",
            food: "Crispy Chicken Burger & Fries",
            quantity: 3,
            totalAmount: 720.00,
            orderStatus: "Delivered"
        },
        {
            orderId: "ORD-104",
            customerName: "Ananya Patel",
            food: "Margherita Wood-Fired Pizza",
            quantity: 2,
            totalAmount: 580.00,
            orderStatus: "In Transit"
        },
        {
            orderId: "ORD-105",
            customerName: "Liam Johnson",
            food: "Pasta Alfredo with Garlic Bread",
            quantity: 1,
            totalAmount: 390.00,
            orderStatus: "Delivered"
        },
        {
            orderId: "ORD-106",
            customerName: "Isha Kapoor",
            food: "Classic Caesar Salad & Smoothie",
            quantity: 2,
            totalAmount: 420.00,
            orderStatus: "Pending"
        },
        {
            orderId: "ORD-107",
            customerName: "David Miller",
            food: "Grilled Salmon with Asparagus",
            quantity: 1,
            totalAmount: 890.00,
            orderStatus: "Delivered"
        },
        {
            orderId: "ORD-108",
            customerName: "Pooja Hegde",
            food: "Veg Hakka Noodles & Manchurian",
            quantity: 2,
            totalAmount: 460.00,
            orderStatus: "Preparing"
        }
    ];

    // Method toggle handlers
    btnUseFetch.addEventListener('click', () => {
        selectedMethod = 'fetch';
        btnUseFetch.classList.add('active');
        btnUseJQuery.classList.remove('active');
        activeMethodBadge.textContent = 'Fetch API';
        methodDescription.textContent = 'Native JavaScript Promise';
    });

    btnUseJQuery.addEventListener('click', () => {
        selectedMethod = 'jquery';
        btnUseJQuery.classList.add('active');
        btnUseFetch.classList.remove('active');
        activeMethodBadge.textContent = 'jQuery $.getJSON()';
        methodDescription.textContent = 'jQuery Asynchronous AJAX';
    });

    /**
     * Format a number as Indian Rupee (INR) currency
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Map order status string to CSS badge styling
     */
    function getStatusBadgeHtml(status) {
        const normalized = (status || '').toLowerCase().trim();
        let statusClass = 'status-pending';

        if (normalized === 'delivered') {
            statusClass = 'status-delivered';
        } else if (normalized === 'preparing') {
            statusClass = 'status-preparing';
        } else if (normalized === 'in transit' || normalized === 'transit') {
            statusClass = 'status-in-transit';
        }

        return `
            <span class="status-pill ${statusClass}">
                <span class="status-dot"></span>
                ${status}
            </span>
        `;
    }

    /**
     * Render the order records dynamically into the table
     * and calculate totals.
     */
    function renderOrders(orders, methodUsed) {
        if (!orders || orders.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <div class="empty-icon">⚠️</div>
                            <h3>No Orders Found</h3>
                            <p>The JSON file was loaded, but contains no records.</p>
                        </div>
                    </td>
                </tr>
            `;
            totalOrdersDisplay.textContent = '0';
            totalSalesDisplay.textContent = '₹0.00';
            orderCountBadge.textContent = '0 Records';
            return;
        }

        // Calculate total sales amount using Array.prototype.reduce()
        const totalSales = orders.reduce((sum, order) => {
            const amount = parseFloat(order.totalAmount) || 0;
            return sum + amount;
        }, 0);

        // Update Summary KPI Cards
        totalOrdersDisplay.textContent = orders.length;
        totalSalesDisplay.textContent = formatCurrency(totalSales);
        orderCountBadge.textContent = `${orders.length} Records`;

        // Render Table Rows
        let tableRowsHtml = '';
        orders.forEach((order, index) => {
            tableRowsHtml += `
                <tr class="row-fade-in" style="animation-delay: ${index * 0.05}s">
                    <td><span class="order-id-badge">${order.orderId}</span></td>
                    <td><span class="customer-name">${order.customerName}</span></td>
                    <td>
                        <div class="food-item">
                            <span>🍴</span>
                            <span>${order.food}</span>
                        </div>
                    </td>
                    <td><span class="quantity-badge">${order.quantity} pcs</span></td>
                    <td><span class="total-amount">${formatCurrency(order.totalAmount)}</span></td>
                    <td>${getStatusBadgeHtml(order.orderStatus)}</td>
                </tr>
            `;
        });

        ordersTableBody.innerHTML = tableRowsHtml;

        // Display Success Banner
        showStatusBanner(`Successfully loaded ${orders.length} orders via ${methodUsed}! Total Sales: ${formatCurrency(totalSales)}`, 'status-info');
    }

    /**
     * Display a temporary banner for feedback
     */
    function showStatusBanner(message, typeClass) {
        statusBanner.className = `status-banner ${typeClass}`;
        statusBanner.innerHTML = `<span>ℹ️</span> <span>${message}</span>`;
        statusBanner.classList.remove('hidden');
    }

    /**
     * Set loading state on the View Orders button
     */
    function setLoadingState(isLoading) {
        if (isLoading) {
            viewOrdersBtn.disabled = true;
            btnIcon.innerHTML = `<span class="spinner"></span>`;
            btnText.textContent = 'Loading...';
        } else {
            viewOrdersBtn.disabled = false;
            btnIcon.innerHTML = '📋';
            btnText.textContent = 'View Orders';
        }
    }

    /**
     * Load orders using the native JavaScript fetch() API
     */
    function loadWithFetch() {
        setLoadingState(true);

        fetch('orders.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setLoadingState(false);
                renderOrders(data, 'Native fetch() API');
            })
            .catch(error => {
                console.warn('Fetch failed or restricted by local browser CORS, applying fallback:', error);
                setLoadingState(false);
                // Graceful fallback if opened via file:// protocol
                renderOrders(localFallbackData, 'fetch() [Local Fallback]');
                showStatusBanner(
                    `Loaded ${localFallbackData.length} records. Note: Direct file:// access blocked HTTP fetch, fallback used. Run with a live server for network requests.`,
                    'status-warning'
                );
            });
    }

    /**
     * Load orders using jQuery $.getJSON()
     */
    function loadWithJQuery() {
        setLoadingState(true);

        if (typeof $ === 'undefined') {
            console.error('jQuery is not loaded');
            setLoadingState(false);
            showStatusBanner('jQuery library is not available. Please check internet connection.', 'status-error');
            return;
        }

        $.getJSON('orders.json', function (data) {
            setLoadingState(false);
            renderOrders(data, 'jQuery $.getJSON()');
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.warn('jQuery $.getJSON failed or restricted by local browser CORS, applying fallback:', textStatus, errorThrown);
            setLoadingState(false);
            // Graceful fallback if opened via file:// protocol
            renderOrders(localFallbackData, 'jQuery $.getJSON() [Local Fallback]');
            showStatusBanner(
                `Loaded ${localFallbackData.length} records. Note: Direct file:// access blocked $.getJSON, fallback used. Run with a live server for network requests.`,
                'status-warning'
            );
        });
    }

    /**
     * Main "View Orders" button click handler
     */
    viewOrdersBtn.addEventListener('click', () => {
        if (selectedMethod === 'fetch') {
            loadWithFetch();
        } else {
            loadWithJQuery();
        }
    });

    /**
     * "Clear Table" button click handler
     */
    clearOrdersBtn.addEventListener('click', () => {
        ordersTableBody.innerHTML = `
            <tr id="emptyRow">
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-icon">🍳</div>
                        <h3>Table Cleared</h3>
                        <p>Click the <strong>"View Orders"</strong> button above to load order records again.</p>
                    </div>
                </td>
            </tr>
        `;
        totalOrdersDisplay.textContent = '0';
        totalSalesDisplay.textContent = '₹0.00';
        orderCountBadge.textContent = '0 Records';
        statusBanner.classList.add('hidden');
    });
});
