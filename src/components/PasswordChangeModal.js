import { API_BASE_URL } from '../config.js';

export default class PasswordChangeModal {
  constructor(onSuccess) {
    this.onSuccess = onSuccess;
    this.render();
  }

  render() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content password-modal">
        <div class="modal-header">
          <h3>Change Password</h3>
          <button class="close-modal">&times;</button>
        </div>
        
        <form id="password-form" class="password-form">
          <div class="form-group">
            <label for="current-password">Current Password</label>
            <input 
              type="password" 
              id="current-password" 
              name="currentPassword" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="new-password">New Password</label>
            <input 
              type="password" 
              id="new-password" 
              name="newPassword" 
              required
              minlength="8"
            >
            <span class="password-hint">
              Password must be at least 8 characters long
            </span>
          </div>
          
          <div class="form-group">
            <label for="confirm-password">Confirm New Password</label>
            <input 
              type="password" 
              id="confirm-password" 
              name="confirmPassword" 
              required
            >
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary cancel-btn">Cancel</button>
            <button type="submit" class="btn-primary">Change Password</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.addEventListeners(modal);
  }

  addEventListeners(modal) {
    const form = modal.querySelector("#password-form");
    const closeBtn = modal.querySelector(".close-modal");
    const cancelBtn = modal.querySelector(".cancel-btn");

    form.addEventListener("submit", (e) => this.handleSubmit(e, modal));
    closeBtn.addEventListener("click", () => this.closeModal(modal));
    cancelBtn.addEventListener("click", () => this.closeModal(modal));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal(modal);
    });
  }

  async handleSubmit(e, modal) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (formData.get("newPassword") !== formData.get("confirmPassword")) {
      this.showError("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          newPassword: formData.get("newPassword"),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to change password");
      }

      this.onSuccess?.();
      this.closeModal(modal);
    } catch (error) {
      console.error("Error changing password:", error);
      this.showError(error.message);
    }
  }

  showError(message) {
    const form = document.getElementById("password-form");
    const existingError = form.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.querySelector(".form-actions"));
  }

  closeModal(modal) {
    modal.remove();
  }
} 