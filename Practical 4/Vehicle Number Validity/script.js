document.addEventListener('DOMContentLoaded', () => {
    const vehicleForm = document.getElementById('vehicleForm');
    const ownerNameInput = document.getElementById('ownerName');
    const vehicleNumberInput = document.getElementById('vehicleNumber');
    const ownerNameError = document.getElementById('ownerNameError');
    const vehicleNumberError = document.getElementById('vehicleNumberError');
    const vehicleRules = document.getElementById('vehicleRules');
    const successMsg = document.getElementById('successMsg');

    // Rule items
    const ruleNotEmpty = document.getElementById('rule-not-empty');
    const ruleLength = document.getElementById('rule-length');
    const ruleStateCode = document.getElementById('rule-state-code');
    const ruleDistrictCode = document.getElementById('rule-district-code');
    const ruleSeries = document.getElementById('rule-series');
    const ruleNumber = document.getElementById('rule-number');

    // Owner Name validation function
    function validateOwnerName() {
        const name = ownerNameInput.value.trim();
        if (name === '') {
            ownerNameError.textContent = 'Owner name is required';
            ownerNameInput.className = 'error-border';
            return false;
        } else {
            ownerNameError.textContent = '';
            ownerNameInput.className = 'success-border';
            return true;
        }
    }

    ownerNameInput.addEventListener('input', validateOwnerName);

    // Show rules checklist when focusing vehicle number field
    vehicleNumberInput.addEventListener('focus', () => {
        vehicleRules.style.display = 'block';
    });

    // Vehicle Number validation logic
    function validateVehicleNumber() {
        const num = vehicleNumberInput.value;
        let isValid = true;

        // 1. Not empty
        if (num.length > 0) {
            ruleNotEmpty.className = 'valid';
        } else {
            ruleNotEmpty.className = 'invalid';
            isValid = false;
        }

        // 2. Exact 10 characters
        if (num.length === 10) {
            ruleLength.className = 'valid';
        } else {
            ruleLength.className = 'invalid';
            isValid = false;
        }

        // 3. First two characters uppercase alphabets
        if (num.length >= 2 && /^[A-Z]{2}$/.test(num.substring(0, 2))) {
            ruleStateCode.className = 'valid';
        } else {
            ruleStateCode.className = 'invalid';
            isValid = false;
        }

        // 4. Next two characters digits
        if (num.length >= 4 && /^\d{2}$/.test(num.substring(2, 4))) {
            ruleDistrictCode.className = 'valid';
        } else {
            ruleDistrictCode.className = 'invalid';
            isValid = false;
        }

        // 5. Next two uppercase alphabets
        if (num.length >= 6 && /^[A-Z]{2}$/.test(num.substring(4, 6))) {
            ruleSeries.className = 'valid';
        } else {
            ruleSeries.className = 'invalid';
            isValid = false;
        }

        // 6. Last four characters digits
        if (num.length >= 10 && /^\d{4}$/.test(num.substring(6, 10))) {
            ruleNumber.className = 'valid';
        } else {
            ruleNumber.className = 'invalid';
            isValid = false;
        }

        if (num === '') {
            vehicleNumberError.textContent = 'Vehicle Number is required';
            vehicleNumberInput.className = 'error-border';
            return false;
        } else if (!isValid) {
            vehicleNumberError.textContent = 'Please meet all vehicle number requirements';
            vehicleNumberInput.className = 'error-border';
            return false;
        } else {
            vehicleNumberError.textContent = '';
            vehicleNumberInput.className = 'success-border';
            return true;
        }
    }

    vehicleNumberInput.addEventListener('input', validateVehicleNumber);

    // Form submission
    vehicleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isOwnerNameValid = validateOwnerName();
        const isVehicleNumberValid = validateVehicleNumber();
        vehicleRules.style.display = 'block';

        if (isOwnerNameValid && isVehicleNumberValid) {
            successMsg.classList.remove('hidden');
        } else {
            successMsg.classList.add('hidden');
        }
    });
});
