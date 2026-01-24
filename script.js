lucide.createIcons();


const signupModal = document.getElementById('signupModal');
const closeModal = document.getElementById('closeModal');
const signupButtons = document.querySelectorAll('.btn-signup, .btn-primary');


signupButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        setTimeout(() => lucide.createIcons(), 100);
    });
});

closeModal.addEventListener('click', () => {
    signupModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});


signupModal.addEventListener('click', (e) => {
    if (e.target === signupModal) {
        signupModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});


document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && signupModal.classList.contains('active')) {
        signupModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});


const passwordInput = document.getElementById('password');
const strengthBar = document.querySelector('.strength-bar');

passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    const strength = calculatePasswordStrength(password);
    
    strengthBar.className = 'strength-bar';
    
    if (strength === 0) {
        strengthBar.style.width = '0%';
    } else if (strength < 3) {
        strengthBar.classList.add('weak');
    } else if (strength < 5) {
        strengthBar.classList.add('medium');
    } else {
        strengthBar.classList.add('strong');
    }
});

function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return strength;
}


const signupForm = document.getElementById('signupForm');
const confirmPasswordInput = document.getElementById('confirmPassword');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    

    if (password !== confirmPassword) {
        confirmPasswordInput.setCustomValidity('Passwords do not match');
        confirmPasswordInput.reportValidity();
        return;
    } else {
        confirmPasswordInput.setCustomValidity('');
    }
    

    const strength = calculatePasswordStrength(password);
    if (password.length < 6) {
        passwordInput.setCustomValidity('Password must be at least 6 characters long.');
        passwordInput.reportValidity();
        return;
    } else {
        passwordInput.setCustomValidity('');
    }
    

    const formData = new FormData(signupForm);
    const data = Object.fromEntries(formData);
    

    alert('Account created successfully! Welcome to Plattinum.net');
    

    signupModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    signupForm.reset();
    strengthBar.style.width = '0%';
    

    setTimeout(() => {
        window.location.href = 'test-entry.html';
    }, 1000);
});


confirmPasswordInput.addEventListener('input', () => {
    confirmPasswordInput.setCustomValidity('');
});


const mobileToggle = document.getElementById('mobile-toggle');
if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        alert('Mobile menu functionality - add your mobile menu implementation here');
    });
}


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});


let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
    
    lastScroll = currentScroll;
});


window.addEventListener('load', () => {
    const mainWindow = document.querySelector('.main-window');
    const sideWindow = document.querySelector('.side-window');
    const floatingIndicator = document.querySelector('.floating-indicator');
    
    if (mainWindow) {
        mainWindow.style.opacity = '0';
        mainWindow.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            mainWindow.style.transition = 'all 0.8s ease-out';
            mainWindow.style.opacity = '1';
            mainWindow.style.transform = 'translateY(0)';
        }, 200);
    }
    
    if (sideWindow) {
        sideWindow.style.opacity = '0';
        sideWindow.style.transform = 'translateY(-50%) translateX(30px)';
        
        setTimeout(() => {
            sideWindow.style.transition = 'all 0.8s ease-out';
            sideWindow.style.opacity = '1';
            sideWindow.style.transform = 'translateY(-50%) translateX(0)';
        }, 400);
    }
    
    if (floatingIndicator) {
        floatingIndicator.style.opacity = '0';
        floatingIndicator.style.transform = 'scale(0)';
        
        setTimeout(() => {
            floatingIndicator.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            floatingIndicator.style.opacity = '1';
            floatingIndicator.style.transform = 'scale(1)';
        }, 800);
    }
});


document.querySelectorAll('.exam-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(5px)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});


const cursor = document.querySelector('.cursor');
const answerLine = document.querySelector('.answer-line');

if (cursor && answerLine) {
    let width = 0;
    const maxWidth = 70;
    let growing = true;
    
    setInterval(() => {
        if (growing) {
            width += 0.5;
            if (width >= maxWidth) {
                growing = false;
            }
        } else {
            width -= 0.5;
            if (width <= 0) {
                growing = true;
            }
        }
        answerLine.style.width = width + '%';
    }, 100);
}

