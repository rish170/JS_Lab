/**
 * Practical 10 - Case Study 2: Employee Details Management
 * Aim: Load and display JSON data using fetch() and jQuery $.getJSON();
 *      render dynamically in a table, calculate payroll statistics,
 *      and dynamically add new employees while persisting the dataset.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loadEmployeesBtn = document.getElementById('loadEmployeesBtn');
    const clearTableBtn = document.getElementById('clearTableBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const addEmployeeForm = document.getElementById('addEmployeeForm');

    // Input Elements
    const empIdInput = document.getElementById('empIdInput');
    const empNameInput = document.getElementById('empNameInput');
    const empDeptInput = document.getElementById('empDeptInput');
    const empSalaryInput = document.getElementById('empSalaryInput');

    // Error Spans
    const empIdError = document.getElementById('empIdError');
    const empNameError = document.getElementById('empNameError');
    const empDeptError = document.getElementById('empDeptError');
    const empSalaryError = document.getElementById('empSalaryError');

    // Display Elements
    const employeesTableBody = document.getElementById('employeesTableBody');
    const totalEmpDisplay = document.getElementById('totalEmpDisplay');
    const totalPayrollDisplay = document.getElementById('totalPayrollDisplay');
    const avgSalaryDisplay = document.getElementById('avgSalaryDisplay');
    const empCountBadge = document.getElementById('empCountBadge');
    const statusBanner = document.getElementById('statusBanner');

    // Method Toggles
    const btnUseFetch = document.getElementById('btnUseFetch');
    const btnUseJQuery = document.getElementById('btnUseJQuery');
    const loadBtnIcon = document.getElementById('loadBtnIcon');
    const loadBtnText = document.getElementById('loadBtnText');

    let selectedMethod = 'fetch'; // 'fetch' or 'jquery'
    let currentEmployees = [];    // Active in-memory employee list
    const STORAGE_KEY = 'practical10_employees_json';

    // Baseline fallback data if running directly via file:// origin
    const defaultEmployees = [
        { empId: "EMP-101", name: "Sarah Connor", department: "Engineering", salary: 85000 },
        { empId: "EMP-102", name: "Alex Murphy", department: "Cybersecurity", salary: 78000 },
        { empId: "EMP-103", name: "Bruce Wayne", department: "Management", salary: 145000 },
        { empId: "EMP-104", name: "Diana Prince", department: "Human Resources", salary: 72000 },
        { empId: "EMP-105", name: "Peter Parker", department: "Marketing", salary: 62000 },
        { empId: "EMP-106", name: "Tony Stark", department: "Research & Development", salary: 160000 }
    ];

    // Method Selection Handlers
    btnUseFetch.addEventListener('click', () => {
        selectedMethod = 'fetch';
        btnUseFetch.classList.add('active');
        btnUseJQuery.classList.remove('active');
    });

    btnUseJQuery.addEventListener('click', () => {
        selectedMethod = 'jquery';
        btnUseJQuery.classList.add('active');
        btnUseFetch.classList.remove('active');
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
     * Return custom badge CSS class based on department
     */
    function getDeptClass(dept) {
        const d = (dept || '').toLowerCase();
        if (d.includes('engineering')) return 'dept-engineering';
        if (d.includes('cyber') || d.includes('security')) return 'dept-cybersecurity';
        if (d.includes('manage')) return 'dept-management';
        if (d.includes('human') || d.includes('hr')) return 'dept-hr';
        if (d.includes('market')) return 'dept-marketing';
        if (d.includes('research') || d.includes('r&d') || d.includes('development')) return 'dept-rd';
        return '';
    }

    /**
     * Display a temporary feedback status banner
     */
    function showStatusBanner(message, typeClass) {
        statusBanner.className = `status-banner ${typeClass}`;
        statusBanner.innerHTML = `<span>ℹ️</span> <span>${message}</span>`;
        statusBanner.classList.remove('hidden');
    }

    /**
     * Render the active employees into the table and calculate metrics
     */
    function renderTable() {
        if (!currentEmployees || currentEmployees.length === 0) {
            employeesTableBody.innerHTML = `
                <tr id="emptyRow">
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="empty-icon">👥</div>
                            <h3>No Employees in Records</h3>
                            <p>Click <strong>"Load Employees"</strong> to load from <code>employees.json</code> or use the form above to add an employee.</p>
                        </div>
                    </td>
                </tr>
            `;
            totalEmpDisplay.textContent = '0';
            totalPayrollDisplay.textContent = '₹0.00';
            avgSalaryDisplay.textContent = '₹0.00';
            empCountBadge.textContent = '0 Records';
            return;
        }

        // Calculate totals
        const totalEmp = currentEmployees.length;
        const totalPayroll = currentEmployees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0);
        const avgSalary = totalPayroll / totalEmp;

        // Update KPI displays
        totalEmpDisplay.textContent = totalEmp;
        totalPayrollDisplay.textContent = formatCurrency(totalPayroll);
        avgSalaryDisplay.textContent = formatCurrency(avgSalary);
        empCountBadge.textContent = `${totalEmp} Records`;

        // Generate rows
        let rowsHtml = '';
        currentEmployees.forEach((emp, index) => {
            const deptClass = getDeptClass(emp.department);
            rowsHtml += `
                <tr class="row-fade-in" style="animation-delay: ${index * 0.04}s">
                    <td><span class="emp-id-badge">${emp.empId}</span></td>
                    <td><span class="emp-name">${emp.name}</span></td>
                    <td><span class="dept-badge ${deptClass}">${emp.department}</span></td>
                    <td><span class="salary-val">${formatCurrency(emp.salary)}</span></td>
                    <td>
                        <button type="button" class="btn-delete" data-index="${index}" title="Remove Employee">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        });

        employeesTableBody.innerHTML = rowsHtml;

        // Attach delete event listeners
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                deleteEmployee(idx);
            });
        });
    }

    /**
     * Delete an employee record
     */
    function deleteEmployee(index) {
        if (index >= 0 && index < currentEmployees.length) {
            const removed = currentEmployees.splice(index, 1)[0];
            saveEmployeesToStorage();
            renderTable();
            showStatusBanner(`Removed employee ${removed.name} (${removed.empId}) from records.`, 'status-warning');
        }
    }

    /**
     * Save the current employee array to localStorage
     */
    function saveEmployeesToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentEmployees));
        } catch (err) {
            console.error('Failed to save to localStorage:', err);
        }
    }

    /**
     * Set loading state on the button
     */
    function setLoading(isLoading) {
        if (isLoading) {
            loadEmployeesBtn.disabled = true;
            loadBtnIcon.innerHTML = `<span class="spinner"></span>`;
            loadBtnText.textContent = 'Loading...';
        } else {
            loadEmployeesBtn.disabled = false;
            loadBtnIcon.innerHTML = '📥';
            loadBtnText.textContent = 'Load Employees';
        }
    }

    /**
     * Load employees via Fetch API
     */
    function loadUsingFetch() {
        setLoading(true);

        fetch('employees.json')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setLoading(false);
                handleDataLoaded(data, 'Native fetch() API');
            })
            .catch(err => {
                console.warn('Fetch failed or restricted by CORS, applying stored/fallback data:', err);
                setLoading(false);
                const stored = localStorage.getItem(STORAGE_KEY);
                const data = stored ? JSON.parse(stored) : defaultEmployees;
                handleDataLoaded(data, 'fetch() [Local / Storage Fallback]');
            });
    }

    /**
     * Load employees via jQuery $.getJSON()
     */
    function loadUsingJQuery() {
        setLoading(true);

        if (typeof $ === 'undefined') {
            setLoading(false);
            showStatusBanner('jQuery is not loaded.', 'status-error');
            return;
        }

        $.getJSON('employees.json', function (data) {
            setLoading(false);
            handleDataLoaded(data, 'jQuery $.getJSON()');
        }).fail(function (jqXHR, textStatus, err) {
            console.warn('jQuery $.getJSON failed or restricted by CORS, applying stored/fallback data:', textStatus, err);
            setLoading(false);
            const stored = localStorage.getItem(STORAGE_KEY);
            const data = stored ? JSON.parse(stored) : defaultEmployees;
            handleDataLoaded(data, 'jQuery $.getJSON() [Local / Storage Fallback]');
        });
    }

    /**
     * Process loaded data and synchronize with storage
     */
    function handleDataLoaded(data, methodUsed) {
        // If there are already custom stored employees in localStorage, merge or use latest
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                currentEmployees = JSON.parse(stored);
            } catch (e) {
                currentEmployees = data;
            }
        } else {
            currentEmployees = data;
            saveEmployeesToStorage();
        }

        renderTable();
        showStatusBanner(`Successfully loaded ${currentEmployees.length} employees using ${methodUsed}!`, 'status-info');
    }

    // "Load Employees" Button Click
    loadEmployeesBtn.addEventListener('click', () => {
        if (selectedMethod === 'fetch') {
            loadUsingFetch();
        } else {
            loadUsingJQuery();
        }
    });

    /**
     * Add Employee Form Submission
     */
    addEmployeeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Clear previous error messages and styling
        [empIdInput, empNameInput, empDeptInput, empSalaryInput].forEach(inp => inp.classList.remove('error-border'));
        [empIdError, empNameError, empDeptError, empSalaryError].forEach(sp => sp.textContent = '');

        const empId = empIdInput.value.trim();
        const name = empNameInput.value.trim();
        const department = empDeptInput.value.trim();
        const salaryVal = empSalaryInput.value.trim();
        const salary = parseFloat(salaryVal);

        let isValid = true;

        if (!empId) {
            empIdError.textContent = 'Employee ID is required';
            empIdInput.classList.add('error-border');
            isValid = false;
        }

        if (!name) {
            empNameError.textContent = 'Employee name is required';
            empNameInput.classList.add('error-border');
            isValid = false;
        }

        if (!department) {
            empDeptError.textContent = 'Please select a department';
            empDeptInput.classList.add('error-border');
            isValid = false;
        }

        if (!salaryVal || isNaN(salary) || salary <= 0) {
            empSalaryError.textContent = 'Please enter a valid positive salary';
            empSalaryInput.classList.add('error-border');
            isValid = false;
        }

        if (!isValid) return;

        // Check for duplicate ID in active records
        const isDuplicate = currentEmployees.some(emp => emp.empId.toLowerCase() === empId.toLowerCase());
        if (isDuplicate) {
            empIdError.textContent = 'An employee with this ID already exists';
            empIdInput.classList.add('error-border');
            return;
        }

        // Create new employee record
        const newEmployee = {
            empId: empId,
            name: name,
            department: department,
            salary: salary
        };

        // Add to array
        currentEmployees.push(newEmployee);

        // Save to persistent storage
        saveEmployeesToStorage();

        // Update table and statistics
        renderTable();

        // Reset form
        addEmployeeForm.reset();

        // Success notification
        showStatusBanner(`Added "${name}" (${empId})! Details saved to JSON data store. Total Employees: ${currentEmployees.length}`, 'status-info');
    });

    /**
     * Save/Export updated JSON file (trigger download of employees.json)
     */
    exportJsonBtn.addEventListener('click', () => {
        if (!currentEmployees || currentEmployees.length === 0) {
            showStatusBanner('No employee data available to export.', 'status-warning');
            return;
        }

        const jsonString = JSON.stringify(currentEmployees, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showStatusBanner('Downloaded updated "employees.json" file with all current records!', 'status-info');
    });

    /**
     * Clear Table Handler
     */
    clearTableBtn.addEventListener('click', () => {
        employeesTableBody.innerHTML = `
            <tr id="emptyRow">
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-icon">👥</div>
                        <h3>Table Cleared</h3>
                        <p>Click the <strong>"Load Employees"</strong> button above to load records again.</p>
                    </div>
                </td>
            </tr>
        `;
        totalEmpDisplay.textContent = '0';
        totalPayrollDisplay.textContent = '₹0.00';
        avgSalaryDisplay.textContent = '₹0.00';
        empCountBadge.textContent = '0 Records';
        statusBanner.classList.add('hidden');
    });
});
