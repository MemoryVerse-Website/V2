// Advanced Form Validation for MemoryVerse

// Email validation with domain checking
function validateEmailAdvanced(email) {
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailRegex.test(email)) return false;
    
    // Check for common typos in domains
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    const domain = email.split('@')[1].toLowerCase();
    
    // Suggest corrections for common typos
    const suggestions = {
        'gmail.co': 'gmail.com',
        'gmial.com': 'gmail.com',
        'gmai.com': 'gmail.com',
        'yahoo.co': 'yahoo.com',
        'yaho.com': 'yahoo.com',
        'outlook.co': 'outlook.com',
        'hotmai.com': 'hotmail.com'
    };
    
    if (suggestions[domain]) {
        const correctedEmail = email.replace(domain, suggestions[domain]);
        showEmailSuggestion(correctedEmail);
        return false;
    }
    
    return true;
}

function showEmailSuggestion(suggestedEmail) {
    const emailInput = document.getElementById('email');
    const errorElement = document.getElementById('email-error');
    
    if (errorElement) {
        errorElement.innerHTML = `
            Did you mean <button type="button" class="email-suggestion" onclick="acceptEmailSuggestion('${suggestedEmail}')">${suggestedEmail}</button>?
        `;
        errorElement.classList.add('show');
    }
}

function acceptEmailSuggestion(email) {
    const emailInput = document.getElementById('email');
    const errorElement = document.getElementById('email-error');
    
    if (emailInput) {
        emailInput.value = email;
        emailInput.focus();
    }
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

// Password strength checker with detailed feedback
function checkPasswordStrengthAdvanced(password) {
    const strengthElement = document.getElementById('password-strength');
    if (!strengthElement) return;
    
    const checks = {
        length: password.length >= 8,
        longLength: password.length >= 12,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /[0-9]/.test(password),
        symbols: /[^A-Za-z0-9]/.test(password),
        noCommon: !isCommonPassword(password),
        noSequential: !hasSequentialChars(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const maxScore = Object.keys(checks).length;
    
    let strength, className, feedback;
    
    if (password.length === 0) {
        strength = '';
        className = 'password-strength';
        feedback = '';
    } else if (score < 4) {
        strength = 'Weak';
        className = 'password-strength weak';
        feedback = getPasswordFeedback(checks, 'weak');
    } else if (score < 6) {
        strength = 'Medium';
        className = 'password-strength medium';
        feedback = getPasswordFeedback(checks, 'medium');
    } else if (score < 8) {
        strength = 'Strong';
        className = 'password-strength strong';
        feedback = getPasswordFeedback(checks, 'strong');
    } else {
        strength = 'Very Strong';
        className = 'password-strength strong';
        feedback = '🔒 Excellent password!';
    }
    
    strengthElement.className = className;
    strengthElement.innerHTML = strength ? `${getStrengthIcon(className)} ${strength} - ${feedback}` : '';
}

function getStrengthIcon(className) {
    const icons = {
        'password-strength weak': '❌',
        'password-strength medium': '⚠️',
        'password-strength strong': '✅'
    };
    return icons[className] || '';
}

function getPasswordFeedback(checks, level) {
    const suggestions = [];
    
    if (!checks.length) suggestions.push('at least 8 characters');
    if (!checks.uppercase) suggestions.push('uppercase letters');
    if (!checks.lowercase) suggestions.push('lowercase letters');
    if (!checks.numbers) suggestions.push('numbers');
    if (!checks.symbols) suggestions.push('symbols');
    if (!checks.noCommon) suggestions.push('avoid common passwords');
    if (!checks.noSequential) suggestions.push('avoid sequential characters');
    
    if (suggestions.length === 0) {
        return level === 'strong' ? 'Consider making it longer' : 'Great password!';
    }
    
    return 'Add ' + suggestions.slice(0, 2).join(' and ');
}

function isCommonPassword(password) {
    const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123', 
        'password123', 'admin', 'welcome', 'login', 'letmein',
        'monkey', 'dragon', 'master', 'password1', '123123'
    ];
    return commonPasswords.includes(password.toLowerCase());
}

function hasSequentialChars(password) {
    const sequences = ['123', '234', '345', '456', '567', '678', '789', 
                      'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi'];
    return sequences.some(seq => password.toLowerCase().includes(seq));
}

// Real-time form validation
function setupRealTimeValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input');
    
    inputs.forEach(input => {
        // Debounced validation for better performance
        let validationTimeout;
        
        input.addEventListener('input', () => {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(() => {
                if (input.value.trim() !== '') {
                    validateFieldAdvanced(input);
                }
            }, 300);
        });
        
        input.addEventListener('blur', () => {
            validateFieldAdvanced(input);
        });
        
        input.addEventListener('focus', () => {
            clearFieldError(input);
        });
    });
}

function validateFieldAdvanced(input) {
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
    
    // Skip validation for empty optional fields
    if (!input.hasAttribute('required') && !value) {
        return true;
    }
    
    // Required field check
    if (input.hasAttribute('required') && !value) {
        errorMessage = `${getFieldLabel(fieldName)} is required`;
        isValid = false;
    } else if (value) {
        // Field-specific validation
        switch (fieldName) {
            case 'firstName':
                if (value.length < 2) {
                    errorMessage = 'First name must be at least 2 characters';
                    isValid = false;
                } else if (value.length > 50) {
                    errorMessage = 'First name must be less than 50 characters';
                    isValid = false;
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    errorMessage = 'First name can only contain letters, spaces, hyphens, and apostrophes';
                    isValid = false;
                }
                break;
                
            case 'email':
                if (!validateEmailAdvanced(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;
                
            case 'password':
                if (value.length < 8) {
                    errorMessage = 'Password must be at least 8 characters long';
                    isValid = false;
                } else if (value.length > 128) {
                    errorMessage = 'Password must be less than 128 characters';
                    isValid = false;
                }
                
                // Update password strength
                if (input.id === 'password') {
                    checkPasswordStrengthAdvanced(value);
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
        
        // Add shake animation for better UX
        input.style.animation = 'shake 0.3s ease-in-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 300);
    }
    
    // Update input styling
    input.classList.toggle('invalid', !isValid);
    input.classList.toggle('valid', isValid && value);
    
    return isValid;
}

// Form submission handler with enhanced validation
function handleFormSubmission(formId, submitHandler) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        const inputs = form.querySelectorAll('input');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateFieldAdvanced(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            // Focus on first invalid field
            const firstInvalid = form.querySelector('.invalid');
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        // Call the submit handler
        if (submitHandler) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            await submitHandler(data, form);
        }
    });
}

// Add CSS animations
function addValidationStyles() {
    if (document.getElementById('validation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'validation-styles';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        input.valid {
            border-color: rgba(76, 175, 80, 0.6) !important;
        }
        
        input.invalid {
            border-color: rgba(244, 67, 54, 0.6) !important;
        }
        
        .email-suggestion {
            background: none;
            border: none;
            color: #ffd700;
            text-decoration: underline;
            cursor: pointer;
            font-weight: 600;
            padding: 0;
            font-size: inherit;
        }
        
        .email-suggestion:hover {
            color: white;
        }
        
        .form-group {
            position: relative;
        }
        
        .success-icon {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #4CAF50;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .form-group:has(.valid) .success-icon {
            opacity: 1;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize validation system
document.addEventListener('DOMContentLoaded', function() {
    addValidationStyles();
    
    // Setup validation for auth forms
    setupRealTimeValidation('signup-form');
    setupRealTimeValidation('login-form');
    setupRealTimeValidation('forgot-password-form');
});

// Export functions
if (typeof window !== 'undefined') {
    window.FormValidation = {
        validateEmailAdvanced,
        checkPasswordStrengthAdvanced,
        setupRealTimeValidation,
        validateFieldAdvanced,
        handleFormSubmission,
        acceptEmailSuggestion
    };
}
