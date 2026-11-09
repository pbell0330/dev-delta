
// GameVault test accounts
const users = [
  {
    username: "admin",
    password: "admin123",
    role: "admin"
  },
  {
    username: "gamer",
    password: "gamer123",
    role: "user"
  }
];

// Display test login information in the console
console.log("GameVault Test Accounts:");
console.log("Admin: admin / admin123");
console.log("Regular User: gamer / gamer123");

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const loginError = document.getElementById("loginError");

    const user = users.find(function (account) {
      return account.username === username &&
        account.password === password;
    });

    if (user) {
      const currentUser = {
        username: user.username,
        role: user.role
      };

      // Save the current user
      sessionStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
      );

      // Load existing application state
      let appState = JSON.parse(
        sessionStorage.getItem("appState")
      ) || {
        app: {
          name: "GameVault",
          version: "1.0"
        },
        currentUser: null,
        data: [],
        dataLoaded: false,
        session: {
          loggedIn: false,
          loginTime: null
        }
      };

      // Update login information without deleting game records
      appState.currentUser = currentUser;
      appState.session.loggedIn = true;
      appState.session.loginTime = new Date().toISOString();

      // Save application state
      sessionStorage.setItem(
        "appState",
        JSON.stringify(appState)
      );

      console.log("Login successful:", currentUser);
      console.log("Application State:", appState);

      // Redirect based on role
      if (user.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "../index.html";
      }

    } else {
      loginError.textContent = "Incorrect username or password.";
      console.error("Login failed.");
    }
  });
}