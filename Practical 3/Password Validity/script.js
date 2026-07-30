document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const passwordRules = document.getElementById('passwordRules');
    const successMsg = document.getElementById('successMsg');

    // Rule items
    const ruleLower = document.getElementById('rule-lower');
    const ruleUpper = document.getElementById('rule-upper');
    const ruleNumber = document.getElementById('rule-number');
    const ruleSpecial = document.getElementById('rule-special');
    const ruleSpace = document.getElementById('rule-space');
    const ruleLength = document.getElementById('rule-length');

    // Email validation standard regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email validation function
    function validateEmail() {
        const email = emailInput.value.trim();
        if (email === '') {
            emailError.textContent = 'Email is required';
            emailInput.className = 'error-border';
            return false;
        } else if (!emailRegex.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.className = 'error-border';
            return false;
        } else {
            emailError.textContent = '';
            emailInput.className = 'success-border';
            return true;
        }
    }

    emailInput.addEventListener('input', validateEmail);

    // Show password rules checklist when focusing password field
    passwordInput.addEventListener('focus', () => {
        passwordRules.style.display = 'block';
    });

    // Password validation logic
    function validatePassword() {
        const pass = passwordInput.value;
        let isValid = true;

        // 1. Lowercase letter
        if (/[a-z]/.test(pass)) {
            ruleLower.className = 'valid';
        } else {
            ruleLower.className = 'invalid';
            isValid = false;
        }

        // 2. Uppercase letter
        if (/[A-Z]/.test(pass)) {
            ruleUpper.className = 'valid';
        } else {
            ruleUpper.className = 'invalid';
            isValid = false;
        }

        // 3. Number
        if (/\d/.test(pass)) {
            ruleNumber.className = 'valid';
        } else {
            ruleNumber.className = 'invalid';
            isValid = false;
        }

        // 4. Special character
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
            ruleSpecial.className = 'valid';
        } else {
            ruleSpecial.className = 'invalid';
            isValid = false;
        }

        // 5. No spaces
        if (pass.length > 0 && !/\s/.test(pass)) {
            ruleSpace.className = 'valid';
        } else if (pass.length === 0) {
            ruleSpace.className = 'valid'; // Keep valid state initially when empty
            isValid = false;
        } else {
            ruleSpace.className = 'invalid';
            isValid = false;
        }

        // 6. Realistic real-life requirement (Min 8 Characters)
        if (pass.length >= 8) {
            ruleLength.className = 'valid';
        } else {
            ruleLength.className = 'invalid';
            isValid = false;
        }

        if (pass === '') {
            passwordError.textContent = 'Password is required';
            passwordInput.className = 'error-border';
            return false;
        } else if (!isValid) {
            passwordError.textContent = 'Please meet all password requirements';
            passwordInput.className = 'error-border';
            return false;
        } else {
            passwordError.textContent = '';
            passwordInput.className = 'success-border';
            return true;
        }
    }

    passwordInput.addEventListener('input', validatePassword);

    // Form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        passwordRules.style.display = 'block'; // Make sure rules are visible if user just clicked login

        if (isEmailValid && isPasswordValid) {
            successMsg.classList.remove('hidden');
        } else {
            successMsg.classList.add('hidden');
        }
    });
});
