
// GameVault Admin Dashboard

let appState = JSON.parse(sessionStorage.getItem("appState")) || null;

let currentUser = JSON.parse(
  sessionStorage.getItem("currentUser")
);

// Check administrator permissions
if (!currentUser || currentUser.role !== "admin") {
  alert("Administrator access required.");
  window.location.href = "signin.html";
} else {
  startAdminDashboard();
}

async function startAdminDashboard() {
  console.log("GameVault Admin Dashboard Started");

  // Load game data if it has not been loaded
  if (!appState || !appState.dataLoaded) {
    try {
      const response = await fetch("../data/games.json");

      if (!response.ok) {
        throw new Error("Unable to load game data.");
      }

      const games = await response.json();

      if (!appState) {
        appState = {
          app: {
            name: "GameVault",
            version: "1.0"
          },
          currentUser: currentUser,
          data: [],
          session: {
            loggedIn: true,
            loginTime: new Date().toISOString()
          }
        };
      }

      appState.data = games;
      appState.dataLoaded = true;
      saveState();
    } catch (error) {
      console.error("Game loading error:", error);
      document.getElementById("adminGames").textContent =
        "Error loading games.";
      return;
    }
  }

  displayAdminInfo();
  displayGames();
  displayStorage();
  displayState();
  displayDebugInfo();
}

// Save application data
function saveState() {
  appState.currentUser = currentUser;
  appState.session.loggedIn = true;

  sessionStorage.setItem("appState", JSON.stringify(appState));

  console.log("Application state saved:", appState);
}

// Display administrator information
function displayAdminInfo() {
  document.getElementById("adminUsername").textContent =
    currentUser.username;

  document.getElementById("adminRole").textContent =
    currentUser.role;

  document.getElementById("loginTime").textContent =
    appState.session.loginTime || "Not available";

  document.getElementById("sessionStatus").textContent =
    "Active";
}

// Display all games
function displayGames() {
  const gamesContainer = document.getElementById("adminGames");

  gamesContainer.innerHTML = "";

  appState.data.forEach(function (game) {
    const card = document.createElement("div");
    card.className = "game-card";

    const title = document.createElement("h3");
    title.textContent = game.name;

    const details = document.createElement("p");
    details.textContent =
      game.platform + " | " + game.genre + " | " + game.status;

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

    card.append(title, details, editButton, deleteButton);
    gamesContainer.appendChild(card);
  });
}

// Create a game
document.getElementById("adminGameForm").addEventListener(
  "submit",
  function (event) {
    event.preventDefault();

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

    saveState();
    refreshDashboard();

    document.getElementById("adminGameForm").reset();

    console.log("Game created:", newGame);
  }
);

// Update a game
function editGame(gameId) {
  const game = appState.data.find(function (item) {
    return item.id === gameId;
  });

  if (!game) {
    return;
  }

  const newName = prompt("Enter game name:", game.name);

  if (newName === null || newName.trim() === "") {
    return;
  }

  const newStatus = prompt(
    "Enter status (Want to Play, Playing, Completed):",
    game.status
  );

  const validStatuses = ["Want to Play", "Playing", "Completed"];

  if (!validStatuses.includes(newStatus)) {
    alert("Invalid game status.");
    return;
  }

  game.name = newName.trim();
  game.status = newStatus;

  saveState();
  refreshDashboard();

  console.log("Game updated:", game);
}

// Delete a game
function deleteGame(gameId) {
  const confirmed = confirm("Delete this game?");

  if (!confirmed) {
    return;
  }

  appState.data = appState.data.filter(function (game) {
    return game.id !== gameId;
  });

  saveState();
  refreshDashboard();

  console.log("Game deleted:", gameId);
}

// Update dashboard information
function refreshDashboard() {
  displayGames();
  displayStorage();
  displayState();
  displayDebugInfo();
}

// Display sessionStorage
function displayStorage() {
  document.getElementById("storageOutput").textContent =
    JSON.stringify(
      {
        currentUser: sessionStorage.getItem("currentUser"),
        appState: sessionStorage.getItem("appState")
      },
      null,
      2
    );
}

// Display application state
function displayState() {
  document.getElementById("stateOutput").textContent =
    JSON.stringify(appState, null, 2);
}

// Display debugging information
function displayDebugInfo() {
  document.getElementById("debugOutput").textContent =
    "Total games: " + appState.data.length +
    " | Current user: " + currentUser.username +
    " | Role: " + currentUser.role +
    " | Storage available: " + (typeof Storage !== "undefined");
}

// Sign out
document.getElementById("adminLogout").addEventListener(
  "click",
  function () {
    sessionStorage.removeItem("currentUser");

    appState.currentUser = null;
    appState.session.loggedIn = false;

    saveState();

    window.location.href = "signin.html";
  }
);