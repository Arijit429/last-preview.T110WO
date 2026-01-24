lucide.createIcons();

const testEntryForm = document.getElementById('testEntryForm');
const testIdInput = document.getElementById('testId');
const studentNameInput = document.getElementById('studentName');
const emailInput = document.getElementById('email');
const loadingOverlay = document.getElementById('loadingOverlay');

testIdInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    if (value.length > 12) {
        value = value.substring(0, 12);
    }
    
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += '-';
        }
        formatted += value[i];
    }
    
    e.target.value = formatted;
});

function validateTestId(testId) {
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return pattern.test(testId);
}

function validateName(name) {
    const trimmedName = name.trim();
    const words = trimmedName.split(/\s+/);
    return words.length >= 2 && trimmedName.length >= 3;
}

studentNameInput.addEventListener('blur', (e) => {
    const name = e.target.value;
    if (name && !validateName(name)) {
        e.target.setCustomValidity('Please enter your full name (first and last name)');
        e.target.reportValidity();
    } else {
        e.target.setCustomValidity('');
    }
});

studentNameInput.addEventListener('input', (e) => {
    e.target.setCustomValidity('');
});

testEntryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const studentName = studentNameInput.value.trim();
    const testId = testIdInput.value.trim();
    const email = emailInput.value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const confirmReady = document.getElementById('confirmReady').checked;
    
    if (!validateName(studentName)) {
        studentNameInput.setCustomValidity('Please enter your full name (first and last name)');
        studentNameInput.reportValidity();
        return;
    }
    
    if (!validateTestId(testId)) {
        testIdInput.setCustomValidity('Please enter a valid test ID in format XXXX-XXXX-XXXX');
        testIdInput.reportValidity();
        return;
    }
    
    if (!agreeTerms || !confirmReady) {
        alert('Please agree to all terms and conditions before starting the test.');
        return;
    }
    
    const testData = {
        studentName: studentName,
        testId: testId,
        email: email,
        startTime: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    sessionStorage.setItem('testData', JSON.stringify(testData));
    
    loadingOverlay.classList.add('active');
    
    setTimeout(() => {
        window.location.href = 'exam.html';
    }, 2000);
});

window.addEventListener('load', () => {
    studentNameInput.focus();
});

window.addEventListener('beforeunload', (e) => {
    if (testEntryForm.querySelector('input:not(:placeholder-shown)')) {
        e.preventDefault();
        e.returnValue = '';
    }
});

const infoCards = document.querySelectorAll('.info-card');
infoCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 300 + (index * 100));
});

testIdInput.addEventListener('blur', (e) => {
    const value = e.target.value;
    if (value && !validateTestId(value)) {
        e.target.style.borderColor = 'var(--red-accent)';
    } else if (value) {
        e.target.style.borderColor = 'var(--green-accent)';
    }
});

testIdInput.addEventListener('focus', (e) => {
    e.target.style.borderColor = 'var(--blue-accent)';
});

emailInput.addEventListener('blur', (e) => {
    const value = e.target.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value && !emailPattern.test(value)) {
        e.target.style.borderColor = 'var(--red-accent)';
    } else if (value) {
        e.target.style.borderColor = 'var(--green-accent)';
    }
});

emailInput.addEventListener('focus', (e) => {
    e.target.style.borderColor = 'var(--blue-accent)';
});

