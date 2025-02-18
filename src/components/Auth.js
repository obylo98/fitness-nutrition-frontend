import { API_BASE_URL } from '../config.js';

export default class Auth {
  constructor(type = 'login') {
    this.type = type;
    this.render();
  }

  render() {
    const main = document.getElementById('main-content');
    
    if (this.type === 'signup') {
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

      this.attachSignupListeners();
    } else {
      main.innerHTML = `
        <div class="auth-container">
          <div class="auth-card">
            <h2>Login</h2>
            <form id="login-form" class="auth-form">
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
              </div>
              <button type="submit" class="btn btn-primary">Login</button>
            </form>
            <p class="auth-switch">
              Don't have an account? <a href="#signup">Sign up</a>
            </p>
            <div id="auth-message" class="auth-message"></div>
          </div>
        </div>
      `;

      this.addEventListeners();
    }
  }

  attachSignupListeners() {
    const form = document.getElementById('signup-form');
    form.addEventListener('submit', this.handleSignup.bind(this));
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

  async handleSignup(e) {
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
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
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

  addEventListeners() {
    const form = document.getElementById("login-form");
    form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    const messageDiv = document.getElementById("auth-message");
    const formData = new FormData(e.target);
    const data = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Authentication failed");
      }

      // Store token and user data
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      // Show success message
      messageDiv.innerHTML = `<div class="success">Successfully logged in!</div>`;

      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.hash = "home";
        window.location.reload(); // Reload to update navigation
      }, 1500);
    } catch (error) {
      messageDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async verifyToken() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }
}
