const validationRules = {
  name: [
    (value) => !value ? 'Name is required' : '',
    (value) => value && value.length < 2 ? 'Name must be at least 2 characters' : ''
  ],
  email: [
    (value) => !value ? 'Email is required' : '',
    (value) => value && !/\S+@\S+\.\S+/.test(value) ? 'Email is invalid' : ''
  ],
  mobile: [
    (value) => !value ? 'Mobile number is required' : '',
    (value) => value && !/^[6-9]\d{9}$/.test(value) ? 'Enter a valid 10-digit mobile number' : ''
  ],
  password: [
    (value) => !value ? 'Password is required' : '',
    (value) => value && value.length < 8 ? 'Password must be at least 8 characters' : '',
    (value) => value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value) ? 'Password must contain uppercase, lowercase, and number' : ''
  ],
  confirmPassword: [
    (value) => !value ? 'Confirm password is required' : ''
  ],
  otp: [
    (value) => !value ? 'OTP is required' : '',
    (value) => value && !/^\d{6}$/.test(value) ? 'OTP must be 6 digits' : ''
  ],
  agreeToTerms: [
    (value) => !value ? 'You must agree to the Terms and Conditions' : ''
  ]
};

export default validationRules;