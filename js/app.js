
// GameVault Application

let appState = JSON.parse(sessionStorage.getItem("appState")) || {
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

// Get the currently logged-in user
let currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;

appState.currentUser = currentUser;

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const gameForm = document.getElementById("gameForm");
const gameToast = document.getElementById("gameToast");
const gamesSection = document.getElementById("gamesSection");
const gameCount = document.getElementById("gameCount");
const loadingMessage = document.getElementById("loadingMessage");

console.log("GameVault is starting...");

// Save the application state
function saveAppState() {
  appState.currentUser = currentUser;
  appState.session.loggedIn = currentUser !== null;

  sessionStorage.setItem("appState", JSON.stringify(appState));

  console.log("GameVault App State:", appState);
}

// Show a notification
function showToast(message) {
  gameToast.querySelector(".toast-body").textContent = message;

  const toast = new bootstrap.Toast(gameToast);
  toast.show();
}

// Update the user information
function updateUserPanel() {
  document.getElementById("currentUsername").textContent =
    currentUser ? currentUser.username : "Guest";

  document.getElementById("currentRole").textContent =
    currentUser ? currentUser.role : "Not signed in";

  document.getElementById("logoutButton").hidden = !currentUser;

  document.getElementById("adminControls").hidden =
    !currentUser || currentUser.role !== "admin";

  gameForm.closest("section").hidden = !currentUser;
}

// Load games from JSON or sessionStorage
async function loadGames() {
  try {
    if (!appState.dataLoaded) {
      const response = await fetch("data/games.json");

      if (!response.ok) {
        throw new Error("Could not load game data.");
      }

      appState.data = await response.json();
      appState.dataLoaded = true;

      saveAppState();
    }

    renderGames();
    console.log("Games loaded successfully:", appState.data);
  } catch (error) {
    loadingMessage.textContent =
      "Error loading games. Please check the JSON file.";

    console.error("Game loading error:", error);
  }
}

// Display games on the page
function renderGames() {
  gamesSection.querySelectorAll(".game-card").forEach(function (card) {
    card.remove();
  });

  loadingMessage.textContent = "";

  const searchText = searchInput.value.toLowerCase();
  const selectedStatus = statusFilter.value;

  appState.data.forEach(function (game) {
    const matchesSearch = game.name.toLowerCase().includes(searchText);

    const matchesStatus =
      selectedStatus === "all" || game.status === selectedStatus;

    if (!matchesSearch || !matchesStatus) {
      return;
    }

    const card = document.createElement("div");
    card.className = "game-card";
    card.setAttribute("data-status", game.status);

    const name = document.createElement("h3");
    name.textContent = game.name;

    const platform = document.createElement("p");
    platform.textContent = "Platform: " + game.platform;

    const genre = document.createElement("p");
    genre.textContent = "Genre: " + game.genre;

    const status = document.createElement("p");
    status.textContent = "Status: " + game.status;

    const rating = document.createElement("p");
    rating.textContent = "Rating: " + game.rating;

    const tags = document.createElement("p");
    tags.textContent = "Tags: " + game.tags;

    card.append(name, platform, genre, status, rating, tags);

    // Admin-only edit and delete buttons
    if (currentUser && currentUser.role === "admin") {
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", function () {
        editGame(game.id);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deleteGame(game.id);
      });

      card.append(editButton, deleteButton);
    }

    gamesSection.appendChild(card);
  });

  gameCount.textContent = appState.data.length;
}

// Add a new game (Create)
gameForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!currentUser) {
    alert("Please sign in before adding a game.");
    return;
  }

  const newGame = {
    id: Date.now(),
    name: document.getElementById("gameName").value,
    platform: document.getElementById("platform").value,
    genre: document.getElementById("genre").value,
    status: document.getElementById("status").value,
    rating: "Not Rated",
    tags: "#new-game"
  };

  appState.data.push(newGame);

  saveAppState();
  renderGames();
  gameForm.reset();

  showToast("Game added successfully!");
});

// Edit a game (Update) - Admin only
function editGame(gameId) {
  if (!currentUser || currentUser.role !== "admin") {
    alert("Administrator access required.");
    return;
  }

  const game = appState.data.find(function (item) {
    return item.id === gameId;
  });

  if (!game) {
    return;
  }

  const newName = prompt("Enter the game name:", game.name);

  if (newName === null || newName.trim() === "") {
    return;
  }

  const newStatus = prompt(
    "Enter status (Want to Play, Playing, Completed):",
    game.status
  );

  const validStatuses = ["Want to Play", "Playing", "Completed"];

  if (!validStatuses.includes(newStatus)) {
    alert("Please enter a valid game status.");
    return;
  }

  game.name = newName.trim();
  game.status = newStatus;

  saveAppState();
  renderGames();
  showToast("Game updated successfully!");
}

// Delete a game (Delete) - Admin only
function deleteGame(gameId) {
  if (!currentUser || currentUser.role !== "admin") {
    alert("Administrator access required.");
    return;
  }

  const confirmed = confirm("Are you sure you want to delete this game?");

  if (!confirmed) {
    return;
  }

  appState.data = appState.data.filter(function (game) {
    return game.id !== gameId;
  });

  saveAppState();
  renderGames();
  showToast("Game deleted successfully!");
}

// Search games
searchInput.addEventListener("input", renderGames);

// Filter games
statusFilter.addEventListener("change", renderGames);

// Clear backlog - Admin only
document.getElementById("clearButton").addEventListener("click", function () {
  if (!currentUser || currentUser.role !== "admin") {
    alert("Administrator access required.");
    return;
  }

  const confirmed = confirm("Are you sure you want to clear the backlog?");

  if (!confirmed) {
    return;
  }

  appState.data = [];

  saveAppState();
  renderGames();
  showToast("Backlog cleared!");
});

// Sign out
document.getElementById("logoutButton").addEventListener("click", function () {
  sessionStorage.removeItem("currentUser");

  currentUser = null;
  appState.currentUser = null;
  appState.session.loggedIn = false;

  saveAppState();

  window.location.href = "pages/signin.html";
});

// Start GameVault
updateUserPanel();
saveAppState();
loadGames();
