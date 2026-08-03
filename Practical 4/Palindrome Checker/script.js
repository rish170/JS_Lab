document.addEventListener('DOMContentLoaded', () => {
    const palindromeForm = document.getElementById('palindromeForm');
    const wordInput = document.getElementById('wordInput');
    const wordError = document.getElementById('wordError');
    const resultMsg = document.getElementById('resultMsg');

    /**
     * 1. Function Types & Closures & Scope
     * Here we define an arrow function that creates a closure.
     * The `regex` variable is kept in the outer lexical scope, 
     * while the returned function will have access to it whenever it's called.
     */
    const createPalindromeChecker = () => {
        // Scoped variable that persists within the closure
        const regex = /[^A-Za-z0-9]/g; 
        
        // Return an anonymous function (closure)
        return function(str) {
            if (typeof str !== 'string') {
                throw new Error("Input must be a valid text string");
            }
            if (str.trim() === '') {
                throw new Error("Input cannot be empty");
            }

            // Remove non-alphanumeric characters and convert to lower case
            const cleanStr = str.toLowerCase().replace(regex, '');
            const reversedStr = cleanStr.split('').reverse().join('');
            
            return cleanStr === reversedStr;
        };
    };

    // Instantiate the closure function
    const checkPalindrome = createPalindromeChecker();

    // Event listener for form submission
    palindromeForm.addEventListener('submit', (e) => {
        // Prevent default form behavior (page reload)
        e.preventDefault();
        
        // Reset classes and errors before checking
        wordInput.className = '';
        wordError.textContent = '';
        resultMsg.className = 'success-msg hidden';
        
        const inputValue = wordInput.value;

        // 2. Apply try-catch for error handling
        try {
            // Check if input is a valid palindrome using the closure function
            const isPalindrome = checkPalindrome(inputValue);
            
            if (isPalindrome) {
                wordInput.className = 'success-border';
                resultMsg.textContent = `Yes, "${inputValue}" is a palindrome!`;
                resultMsg.style.color = '#2ecc71'; // Green for success
                resultMsg.classList.remove('hidden');
            } else {
                wordInput.className = 'error-border';
                resultMsg.textContent = `No, "${inputValue}" is not a palindrome.`;
                resultMsg.style.color = '#e74c3c'; // Red for error
                resultMsg.classList.remove('hidden');
            }
        } catch (error) {
            // Catching any errors thrown by our checker (e.g., empty string)
            wordInput.className = 'error-border';
            wordError.textContent = error.message;
        }
    });
});
