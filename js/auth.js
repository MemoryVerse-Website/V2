// Authentication System for MemoryVerse

// Session management
function getCurrentSession() {
    const sessionData = localStorage.getItem('memoryverse_session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // Check if session is expired (24 hours for regular, 30 days for "remember me")
    const now = Date.now();
    const sessionAge = now - session.loginTime;
    const maxAge = session.remember ? (30 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
    
    if (sessionAge > maxAge) {
        localStorage.removeItem('memoryverse_session');
        return null;
    }
    
    return session;
}

function logout() {
    localStorage.removeItem('memoryverse_session');
    showNotification('You have been logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function updateUIBasedOnAuthState() {
    const session = getCurrentSession();
    const isLoggedIn = !!session;
    
    // Update navigation
    const loggedOutElements = document.querySelectorAll('.logged-out');
    const loggedInElements = document.querySelectorAll('.logged-in');
    
    loggedOutElements.forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'flex';
    });
    
    loggedInElements.forEach(el => {
        el.style.display = isLoggedIn ? 'flex' : 'none';
    });
    
    // Update welcome text
    if (isLoggedIn && session.firstName) {
        const welcomeElements = document.querySelectorAll('#welcome-text, .user-greeting');
        welcomeElements.forEach(el => {
            el.textContent = `Welcome, ${session.firstName}`;
        });
    }
}

// Password utilities
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    const eyeIcon = toggle.querySelector('.eye-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.textContent = '👁️‍🗨️';
    } else {
        input.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

function checkPasswordStrength(password) {
    const strengthElement = document.getElementById('password-strength');
    if (!strengthElement) return;
    
    let strength = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Determine strength level
    if (password.length === 0) {
        feedback = '';
        strengthElement.className = 'password-strength';
    } else if (strength < 3) {
        feedback = '❌ Weak - Add uppercase, numbers, and symbols';
        strengthElement.className = 'password-strength weak';
    } else if (strength < 5) {
        feedback = '⚠️ Medium - Consider adding more variety';
        strengthElement.className = 'password-strength medium';
    } else {
        feedback = '✅ Strong password';
        strengthElement.className = 'password-strength strong';
    }
    
    strengthElement.textContent = feedback;
}

// Form validation
function validateField(input) {
    const value = input.value.trim();
    const fieldName = input.name;
    const errorElement = document.getElementById(`${fieldName}-error`);
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous error
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    
    // Required field check
    if (input.hasAttribute('required') && !value) {
        errorMessage = `${getFieldLabel(fieldName)} is required`;
        isValid = false;
    } else {
        // Field-specific validation
        switch (fieldName) {
            case 'firstName':
                if (value.length < 2) {
                    errorMessage = 'First name must be at least 2 characters';
                    isValid = false;
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    errorMessage = 'First name can only contain letters, spaces, hyphens, and apostrophes';
                    isValid = false;
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;
                
            case 'password':
                if (value.length < 8) {
                    errorMessage = 'Password must be at least 8 characters long';
                    isValid = false;
                }
                break;
                
            case 'confirmPassword':
                const passwordField = document.getElementById('password');
                if (passwordField && value !== passwordField.value) {
                    errorMessage = 'Passwords do not match';
                    isValid = false;
                }
                break;
                
            case 'terms':
                if (input.type === 'checkbox' && !input.checked) {
                    errorMessage = 'You must agree to the terms and conditions';
                    isValid = false;
                }
                break;
        }
    }
    
    // Show error if invalid
    if (!isValid && errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
    }
    
    // Update input styling
    input.classList.toggle('invalid', !isValid);
    
    return isValid;
}

function clearFieldError(input) {
    const fieldName = input.name;
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    
    input.classList.remove('invalid');
}

function getFieldLabel(fieldName) {
    const labels = {
        firstName: 'First name',
        email: 'Email address',
        password: 'Password',
        confirmPassword: 'Confirm password',
        terms: 'Terms agreement'
    };
    return labels[fieldName] || fieldName;
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], input[name="confirmPassword"]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Button loading states
function setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const textSpan = button.querySelector('.btn-text');
    const loaderSpan = button.querySelector('.btn-loader');
    
    if (loading) {
        button.disabled = true;
        if (textSpan) textSpan.style.display = 'none';
        if (loaderSpan) loaderSpan.style.display = 'flex';
    } else {
        button.disabled = false;
        if (textSpan) textSpan.style.display = 'inline';
        if (loaderSpan) loaderSpan.style.display = 'none';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const colors = {
        success: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
        error: 'linear-gradient(45deg, #f44336, #FF5722)',
        info: 'linear-gradient(45deg, #2196F3, #03A9F4)',
        warning: 'linear-gradient(45deg, #FF9800, #FFC107)'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    notification.innerHTML = `
        <span>${icons[type] || icons.info}</span>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: auto;
            padding: 0;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Initialize authentication state on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a protected page
    const protectedPages = ['create-memory.html', 'my-memories.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const session = getCurrentSession();
        if (!session) {
            showNotification('Please sign in to access this page', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
    }
    
    // Update UI based on auth state
    updateUIBasedOnAuthState();
});

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.MemoryVerseAuth = {
        getCurrentSession,
        logout,
        updateUIBasedOnAuthState,
        togglePassword,
        checkPasswordStrength,
        validateField,
        clearFieldError,
        validateForm,
        setButtonLoading,
        showNotification
    };
}
