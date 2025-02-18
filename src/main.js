import HomePage from "./components/HomePage.js";
import Auth from "./components/Auth.js";
import WorkoutTracker from "./components/WorkoutTracker.js";
import Profile from "./components/Profile.js";
import ReminderManager from "./services/ReminderManager.js";
import ProgressTracker from "./components/ProgressTracker.js";
import NutritionPage from "./components/NutritionPage.js";
import Navigation from "./components/Navigation.js";
import Workout from "./components/Workout.js";

// Main application entry point
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  console.log("Application initialized");
  
  // Initialize navigation if user is authenticated
  if (localStorage.getItem("token")) {
    new Navigation();
  }

  setupRouting();

  // Initialize reminder system if user is authenticated
  if (localStorage.getItem("token")) {
    try {
      new ReminderManager();
    } catch (error) {
      console.warn('Failed to initialize reminders:', error);
      // Continue app initialization even if reminders fail
    }
  }

  // Check for existing route or load homepage
  const hash = window.location.hash.slice(1) || "home";
  handleNavigation(hash);

  // Listen for navigation events from the Navigation component
  window.addEventListener('navigationchange', (e) => {
    const page = e.detail.page;
    window.location.hash = page === 'dashboard' ? 'home' : page;
  });
}

function setupRouting() {
  // Handle hash changes
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1) || "home";
    handleNavigation(hash);
  });
}

function handleNavigation(page) {
  const isAuthenticated = !!localStorage.getItem("token");
  const protectedRoutes = ["nutrition", "workouts", "profile", "progress"];

  // Redirect to login if trying to access protected route while not authenticated
  if (protectedRoutes.includes(page) && !isAuthenticated) {
    window.location.hash = "login";
    return;
  }

  const mainContent = document.getElementById("main-content");

  // Clear existing content
  mainContent.innerHTML = "";

  // If user logs in, initialize navigation
  if (page === "login" && isAuthenticated) {
    new Navigation();
  }

  switch (page) {
    case "home":
      new HomePage();
      break;
    case "login":
      new Auth("login");
      break;
    case "signup":
      new Auth("signup");
      break;
    case "nutrition":
      new NutritionPage();
      break;
    case "workout/new":
      new Workout();
      break;
    case "workout/tracker":
      new WorkoutTracker();
      break;
    case "workout/history":
      new WorkoutTracker('history');
      break;
    case "profile":
      new Profile();
      break;
    case "progress":
      new ProgressTracker();
      break;
    default:
      new HomePage();
  }

  // Update active navigation link if nav exists
  const nav = document.querySelector('.main-nav');
  if (nav) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const linkPage = link.dataset.page === 'dashboard' ? 'home' : link.dataset.page;
      if (linkPage === page) {
        link.classList.add('active');
      }
    });
  }
}

function handleLogout() {
  // Clear authentication data
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Remove navigation
  const nav = document.querySelector('.main-nav');
  if (nav) {
    nav.remove();
  }

  // Redirect to home
  window.location.hash = "home";
}

// Export handleLogout for use in other components
export { handleLogout };
