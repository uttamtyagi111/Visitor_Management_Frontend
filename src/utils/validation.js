// Validation utilities for form inputs
export const validationUtils = {
  // Email validation with comprehensive regex
  validateEmail: (email) => {
    if (!email) return { isValid: false, message: 'Email is required' };
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    // Check for common typos in domain
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain && domain.includes('..')) {
      return { isValid: false, message: 'Email contains invalid characters' };
    }
    
    return { isValid: true, message: '' };
  },

  // Phone number validation with formatting
  validatePhone: (phone) => {
    if (!phone) return { isValid: false, message: 'Phone number is required' };
    
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it's exactly 10 digits
    if (digitsOnly.length !== 10) {
      return { isValid: false, message: 'Phone number must be exactly 10 digits' };
    }
    
    // Check if it starts with valid digits (not 0 or 1)
    if (digitsOnly[0] === '0' || digitsOnly[0] === '1') {
      return { isValid: false, message: 'Phone number cannot start with 0 or 1' };
    }
    
    return { isValid: true, message: '', formatted: digitsOnly };
  },

  // Name validation
  validateName: (name) => {
    if (!name) return { isValid: false, message: 'Name is required' };
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long' };
    }
    
    if (trimmedName.length > 50) {
      return { isValid: false, message: 'Name must be less than 50 characters' };
    }
    
    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(trimmedName)) {
      return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    // Check for consecutive spaces or special characters
    if (/\s{2,}/.test(trimmedName) || /[-'\.]{2,}/.test(trimmedName)) {
      return { isValid: false, message: 'Name contains invalid character combinations' };
    }
    
    // Ensure name has at least one letter
    if (!/[a-zA-Z]/.test(trimmedName)) {
      return { isValid: false, message: 'Name must contain at least one letter' };
    }
    
    return { isValid: true, message: '', formatted: trimmedName };
  },

  // Purpose validation
  validatePurpose: (purpose) => {
    if (!purpose) return { isValid: false, message: 'Purpose of visit is required' };
    
    const validPurposes = [
      'business_meeting',
      'interview', 
      'delivery',
      'maintenance',
      'personal',
      'other'
    ];
    
    if (!validPurposes.includes(purpose)) {
      return { isValid: false, message: 'Please select a valid purpose' };
    }
    
    return { isValid: true, message: '' };
  },

  // Format phone number for display
  formatPhoneNumber: (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }
    return phone;
  },

  // Real-time input sanitization
  sanitizeInput: {
    name: (value) => {
      // Remove leading/trailing spaces and limit consecutive spaces
      return value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
    },
    
    phone: (value) => {
      // Keep only digits and limit to 10
      const digitsOnly = value.replace(/\D/g, '');
      return digitsOnly.slice(0, 10);
    },
    
    email: (value) => {
      // Remove spaces and convert to lowercase
      return value.replace(/\s/g, '').toLowerCase();
    }
  },

  // Validate entire form
  validateForm: (formData) => {
    const errors = {};
    
    // Validate name
    const nameValidation = validationUtils.validateName(formData.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.message;
    }
    
    // Validate email
    const emailValidation = validationUtils.validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message;
    }
    
    // Validate phone
    const phoneValidation = validationUtils.validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
    }
    
    // Validate purpose
    const purposeValidation = validationUtils.validatePurpose(formData.purpose);
    if (!purposeValidation.isValid) {
      errors.purpose = purposeValidation.message;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Debounce utility for real-time validation
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default validationUtils;
