document.addEventListener('DOMContentLoaded', () => {
    const numSubjectsSelect = document.getElementById('numSubjects');
    const subjectsContainer = document.getElementById('subjectsContainer');
    const calculateBtn = document.getElementById('calculateBtn');
    const gradingForm = document.getElementById('gradingForm');
    const resultContainer = document.getElementById('result');
    const percentageText = document.getElementById('percentageText');
    const gradeText = document.getElementById('gradeText');

    // Event listener for dropdown change to dynamically create textboxes
    numSubjectsSelect.addEventListener('change', function() {
        const num = parseInt(this.value);
        subjectsContainer.innerHTML = ''; // Clear previous inputs
        
        if (this.value === '') {
            resultContainer.classList.add('hidden');
            return;
        }

        // Loop (Control Structure) to generate input fields
        for (let i = 1; i <= num; i++) {
            const div = document.createElement('div');
            div.className = 'subject-input';
            
            const label = document.createElement('label');
            label.setAttribute('for', `subject${i}`);
            label.textContent = `Subject ${i} Marks (out of 100)`;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `subject${i}`;
            input.name = `subject${i}`;
            input.min = '0';
            input.max = '100';
            input.required = true;
            input.placeholder = `Enter marks for Subject ${i}`;

            div.appendChild(label);
            div.appendChild(input);
            subjectsContainer.appendChild(div);
        }

        resultContainer.classList.add('hidden');
    });

    // Handle form submission and calculations
    gradingForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent page reload

        const studentName = document.getElementById('studentName').value.trim();
        const semester = document.getElementById('semester').value;
        const section = document.getElementById('section').value;
        const numSubjects = numSubjectsSelect.value;

        if (!studentName) {
            alert("Please enter the student's name.");
            resultContainer.classList.add('hidden');
            return;
        }

        // Check if all dropdowns are selected
        if (!semester || !section || !numSubjects) {
            alert("Please select all dropdown options (Semester, Section, and Number of Subjects).");
            resultContainer.classList.add('hidden');
            return;
        }

        let totalMarks = 0;
        let isValid = true;

        // Form Validation and processing using a loop (Control Structure)
        for (let i = 1; i <= parseInt(numSubjects); i++) {
            const input = document.getElementById(`subject${i}`);
            
            if (input.value === '') {
                alert("Please fill in all the marks.");
                resultContainer.classList.add('hidden');
                return;
            }

            const marks = parseFloat(input.value);
            
            // Validation (Control Structure)
            if (isNaN(marks) || marks < 0 || marks > 100) {
                alert(`Please enter valid marks between 0 and 100 for Subject ${i}.`);
                input.focus();
                isValid = false;
                break;
            }
            
            totalMarks += marks;
        }

        if (isValid) {
            const maxTotal = parseInt(numSubjects) * 100;
            const percentage = (totalMarks / maxTotal) * 100;
            
            // Determine grade using if-else statements (Control Structures)
            let grade = '';
            let gradeColor = '';

            if (percentage > 90) {
                grade = 'A+';
                gradeColor = '#27ae60'; // Green
            } else if (percentage > 80) {
                grade = 'A';
                gradeColor = '#2ecc71'; // Lighter Green
            } else if (percentage > 65) {
                grade = 'B';
                gradeColor = '#f39c12'; // Orange
            } else if (percentage >= 50) {
                grade = 'C';
                gradeColor = '#f39c12'; // Orange
            } else {
                grade = 'F';
                gradeColor = '#e74c3c'; // Red
            }

            // Display the results
            percentageText.innerHTML = `Student: ${studentName} <br> Percentage: ${percentage.toFixed(2)}%`;
            gradeText.innerHTML = `Grade: <span class="grade-highlight" style="color: ${gradeColor}">${grade}</span>`;
            
            resultContainer.classList.remove('hidden');
            resultContainer.style.borderLeftColor = gradeColor;
        }
    });
});
