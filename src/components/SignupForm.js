import { API_BASE_URL } from '../config.js';

export default class SignupForm {
  constructor() {
    this.render();
  }

  render() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="auth-container">
        <div class="auth-header">
          <h1>Sign Up</h1>
          <p>Create your account to start tracking your fitness journey</p>
        </div>

        <form id="signup-form" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required 
              minlength="3"
              maxlength="50"
              placeholder="Choose a username"
              autocomplete="username"
            >
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required
              placeholder="your.email@example.com"
              autocomplete="email"
            >
            <small class="form-hint">We'll never share your email with anyone else.</small>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required
              minlength="6"
              placeholder="Create a strong password"
              autocomplete="new-password"
            >
            <small class="form-hint">Must be at least 6 characters long</small>
          </div>

          <div id="form-error" class="form-error hidden"></div>

          <button type="submit" class="btn-primary btn-block">
            <i class="fas fa-user-plus"></i> Create Account
          </button>

          <p class="auth-switch">
            Already have an account? <a href="#login">Log in</a>
          </p>
        </form>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = document.getElementById('signup-form');
    form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  showError(message) {
    const errorDiv = document.getElementById('form-error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }

  hideError() {
    const errorDiv = document.getElementById('form-error');
    errorDiv.classList.add('hidden');
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.hideError();
    
    const form = e.target;
    const formData = new FormData(form);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    // Basic validation
    if (!username || !email || !password) {
      this.showError('All fields are required');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showError('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      window.location.hash = 'dashboard';
      
    } catch (error) {
      console.error('Signup error:', error);
      this.showError(error.message || 'Failed to create account');
    }
  }
} 