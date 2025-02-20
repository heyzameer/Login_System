const express = require("express");
const router = express.Router();
const session = require("express-session");
const nocache = require("nocache");

// Disable browser caching to prevent accessing protected routes after logout
router.use(nocache());

// Configure session middleware
router.use(
  session({
    secret: "secret", // Secret key for session encryption
    resave: false, // Prevents saving session if not modified
    saveUninitialized: true, // Creates a session for new users
  })
);

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuth) {
    return next(); // If authenticated, proceed to the next middleware/route
  } else {
    return res.redirect("/"); // Redirect to login page if not authenticated
  }
};

// Regular expression to validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Password validation regex (currently commented out for flexibility)
// const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

// Hardcoded user credentials (Ideally, should be stored securely in a database)
const credential = [
  { email: "admin@gmail.com", password: "Admin@123" },
  { email: "zameer@gmail.com", password: "Zameer@123" },
];

// Route to handle user login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate email format
  if (!emailRegex.test(email)) {
    return res.render("base", {
      title: "Express",
      logout_err: "Invalid email format",
    });
  }

  // Uncomment below to enforce password validation rules
  /*
  if (!passwordRegex.test(password)) {
    return res.render("base", {
      title: "Express",
      logout_err:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit",
    });
  }
  */

  // Check if provided credentials match any user
  const user = credential.find(
    (user) => user.email === email && user.password === password
  );

  if (user) {
    // Store user session details upon successful login
    req.session.user = user.email;
    req.session.isAuth = true;
    return res.redirect("/dashboard"); // Redirect to dashboard after login
  } else {
    // Invalid credentials, show error message
    return res.render("base", {
      title: "Express",
      logout_err: "Invalid username or password",
    });
  }
});

// Protected route: Dashboard (Accessible only if authenticated)
router.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.session.user, logout: "" });
});

// Default route: Redirects to login or dashboard based on session
router.get("/", (req, res) => {
  if (req.session.isAuth) {
    return res.render("dashboard", { user: req.session.user, logout: "" });
  } else {
    return res.render("base", { title: "Express", logout: "" });
  }
});

// Route to serve login page (Redirects to dashboard if already logged in)
router.get("/login", (req, res) => {
  if (req.session.isAuth) {
    return res.render("dashboard", { user: req.session.user, logout: "" });
  } else {
    return res.render("base", { title: "Express", logout: "" });
  }
});

// Route to handle user logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    // Clear session and show logout success message
    return res.render("base", { title: "Express", logout: "Logout successfully" });
  });
});

// Export router to be used in main server file
module.exports = router;