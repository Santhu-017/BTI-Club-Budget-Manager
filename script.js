// --- Settings User List Rendering ---
function renderSettingsUserList() {
  if (!currentUser || currentUser.role !== "admin") {
    settingsUserList.innerHTML =
      '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Admin privileges required.</td></tr>';
    return;
  }
  settingsUserList.innerHTML = "";
  // Build a set of all member names (name/role) who are not yet users
  const pendingMembers = [];
  clubs.forEach((club) => {
    club.members.forEach((member) => {
      if (member.name) {
        // Check if this member name is not already a user (by fullName or username)
        const alreadyUser = users.some(
          (u) =>
            u.fullName && u.fullName.toLowerCase() === member.name.toLowerCase()
        );
        if (!alreadyUser && !pendingMembers.some((m) => m.name === member.name)) {
          pendingMembers.push({ name: member.name, role: member.role, club: club.name });
        }
      }
    });
  });

  if (users.length === 0 && pendingMembers.length === 0) {
    settingsUserList.innerHTML =
      '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No users found.</td></tr>';
    return;
  }

  users.forEach((user) => {
    const row = document.createElement("tr");
    const disableActions = user.id === currentUser.id;
    const actionsHtml = disableActions
      ? '<span class="text-xs text-gray-400 italic">(Current User)</span>'
      : `<button class="btn btn-primary btn-sm edit-user-button" data-id="${user.id}" title="Edit"><i class="fas fa-edit"></i></button> <button class="btn btn-danger btn-sm delete-user-button" data-id="${user.id}" title="Delete"><i class="fas fa-trash"></i></button>`;
    row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
      user.fullName || user.username
    }</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
      user.username
    }</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${
      user.role
    }</td><td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">${actionsHtml}</td>`;
    settingsUserList.appendChild(row);
  });

  // Show pending members (not yet users) as 'Pending User' rows
  pendingMembers.forEach((member) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${member.name} <span class="ml-2 text-xs text-yellow-600 font-semibold">(Pending)</span></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${member.role}</td><td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"><button class="btn btn-success btn-sm create-user-from-member" data-member-name="${member.name}" data-member-role="${member.role}" title="Create User">Create User</button></td>`;
    settingsUserList.appendChild(row);
  });
}
// --- Configuration ---
let currentCurrencySymbol = "₹";

// --- Data Storage (In-Memory - Data lost on refresh) ---
// !!! DATA WARNING !!! In-memory storage. Requires backend database for persistence.
// !!! SECURITY WARNING !!! Plain text passwords. Requires backend hashing.
let clubs = [
  {
    name: "Designing Club",
    image: "images/d1.png",
    defaultImage: "images/default-club.png",
    members: [],
    clubAdmin: null,
  },
  {
    name: "Photography Club",
    image: "images/p1.jpg",
    defaultImage: "images/default-club.png",
    members: [],
    clubAdmin: null,
  },
  {
    name: "Coding Club",
    image: "images/c1.jpg",
    defaultImage: "images/default-club.png",
    members: [],
    clubAdmin: null,
  },
  {
    name: "Social Media Club",
    image: "images/s1.jpg",
    defaultImage: "images/default-club.png",
    members: [],
    clubAdmin: null,
  },
  {
    name: "Cultural Club",
    image: "images/cc1.jpg",
    defaultImage: "images/default-club.png",
    members: [],
    clubAdmin: null,
  },
  {
    name: "Video-Editing Club",
    image: "images/v1.jpg",
    defaultImage: "images/default-club.png",
    members: [],
    clubAdmin: null,
  },
  {
    name: "Innovation Club",
    image: "images/in1.jpg",
    defaultImage: "images/default-club.png",
    members: [],
    clubAdmin: null,
  },
  {
    name: "Sports Club",
    image: "images/sc1.jpg",
    defaultImage: "images/default-club.png",
    members: [],
    clubAdmin: null,
  },
  {
    name: "E-Sports Club",
    image: "images/es1.jpg",
    defaultImage: "images/default-club.png",
    members: [],
    clubAdmin: null,
  },
];
let transactions = [];
let users = [
  {
    id: 1,
    fullName: "Admin User",
    username: "admin",
    password: "password",
    role: "admin",
  },
  {
    id: 2,
    fullName: "Regular Member",
    username: "member1",
    password: "password",
    role: "member",
  },
];
let clubBalances = {};

// --- State ---
let currentUser = null;
let editingClubName = null;
let editingTransactionId = null;
let editingUserId = null;
let budgetChart;
let yearlyBudgetChart;
// ENHANCEMENT: State for transaction sorting
let transactionSortColumn = "date"; // Default sort column
let transactionSortDirection = "desc"; // Default sort direction (newest first)
let debounceTimer; // For text search debounce

// --- DOM Elements ---
// Search Elements
// const searchTransactionButton = document.getElementById('search-transaction-button'); // Removed explicit button
const transactionSearch = document.getElementById("transaction-search");
const transactionSearchClub = document.getElementById(
  "transaction-search-club"
);
const transactionSearchDateStart = document.getElementById(
  "transaction-search-date-start"
);
const transactionSearchDateEnd = document.getElementById(
  "transaction-search-date-end"
);
const transactionSearchAmountMin = document.getElementById(
  "transaction-search-amount-min"
);
const transactionSearchAmountMax = document.getElementById(
  "transaction-search-amount-max"
);
const resetTransactionSearchButton = document.getElementById(
  "reset-transaction-search"
);
// Login
const loginScreen = document.getElementById("login-screen");
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const loginButton = document.getElementById("login-button");
const loginError = document.getElementById("login-error");
// App Container
const appContainer = document.getElementById("app-container");
// Sidebar & Navigation
const sidebarItems = document.querySelectorAll(".sidebar-item");
const pages = document.querySelectorAll(".page");
const currentUserDisplay = document.getElementById("current-user-display");
const currentRoleDisplay = document.getElementById("current-role-display");
const logoutButton = document.getElementById("logout-button");
// Dashboard
const dashboardTotalBudgetElement = document.getElementById(
  "dashboard-total-budget"
);
const dashboardTotalSpentElement = document.getElementById(
  "dashboard-total-spent"
);
const dashboardRemainingBudgetElement = document.getElementById(
  "dashboard-remaining-budget"
);
const budgetChartCtx = document.getElementById("budgetChart")?.getContext("2d"); // Add null check
const recentTransactionsTable = document.getElementById("recent-transactions");
// Clubs Page
const addClubButton = document.getElementById("add-club-button");
const clubList = document.getElementById("club-list");
// Transactions Page
const addTransactionButton = document.getElementById("add-transaction-button");
const transactionList = document.getElementById("transaction-list");
const transactionTableHead = document.querySelector(
  "#transactions table thead"
); // For sort listeners
// Reports Page
const reportTypeSelect = document.getElementById("report-type");
const reportClubSelect = document.getElementById("report-club");
const generateReportButton = document.getElementById("generate-report-button");
const reportContent = document.getElementById("report-content");
const yearlyBudgetChartCtx = document
  .getElementById("yearlyBudgetChart")
  ?.getContext("2d"); // Add null check
const customDateRangeDiv = document.getElementById("custom-date-range");
const reportStartDateInput = document.getElementById("report-start-date");
const reportEndDateInput = document.getElementById("report-end-date");
const exportExcelButton = document.getElementById("export-excel");
// Settings Page
const userManagementSection = document.getElementById(
  "user-management-section"
);
const settingsUserList = document.getElementById("settings-user-list");
const addUserButton = document.getElementById("add-user-button");
const settingCurrencySelect = document.getElementById("setting-currency");
const saveSettingsButton = document.getElementById("save-settings-button");
const settingsSavedMessage = document.getElementById("settings-saved-message");
const exportDataButton = document.getElementById("export-data-button");
const importDataButton = document.getElementById("import-data-button");
const importFileInput = document.getElementById("import-file-input");
// Modals & Common Elements
const modals = document.querySelectorAll(".modal");
const closeButtons = document.querySelectorAll(".close-button");
const currencySymbolElements = document.querySelectorAll(".currency-symbol");
// Club Modal
const addClubModal = document.getElementById("add-club-modal");
const saveClubButton = document.getElementById("save-club-button");
const cancelClubButton = document.getElementById("cancel-club-button");
const clubNameInput = document.getElementById("club-name");
const clubModalTitle = document.getElementById("club-modal-title");
// Transaction Modal
const addTransactionModal = document.getElementById("add-transaction-modal");
const saveTransactionButton = document.getElementById(
  "save-transaction-button"
);
const cancelTransactionButton = document.getElementById(
  "cancel-transaction-button"
);
const transactionClubSelect = document.getElementById("transaction-club");
const transactionTypeSelect = document.getElementById("transaction-type");
const transactionAmountInput = document.getElementById("transaction-amount");
const transactionDescriptionInput = document.getElementById(
  "transaction-description"
);
const transactionDateInput = document.getElementById("transaction-date");
const transactionModalTitle = document.getElementById(
  "transaction-modal-title"
);
const transactionIdInput = document.getElementById("transaction-id");
// User Modal
const addUserModal = document.getElementById("add-user-modal");
const userModalTitle = document.getElementById("user-modal-title");
const userIdInput = document.getElementById("user-id");
const userFullnameInput = document.getElementById("user-fullname");
const usernameInput = document.getElementById("user-username");
const userRoleSelect = document.getElementById("user-role");
const userPasswordInput = document.getElementById("user-password");
const saveUserButton = document.getElementById("save-user-button");
const cancelUserButton = document.getElementById("cancel-user-button");
// Club Members Modal
const clubMembersModal = document.getElementById("club-members-modal");
const clubMembersModalTitle = document.getElementById(
  "club-members-modal-title"
);
const addMemberNameInput = document.getElementById("add-member-name");
const addMemberRoleSelect = document.getElementById("add-member-role");
const addMemberButton = document.getElementById("add-member-button");
const clubMembersList = document.getElementById("club-members-list");
const closeMembersModalButtons = document.querySelectorAll(
  ".close-members-modal-button"
);

// --- Utility Functions ---

// ENHANCEMENT: Debounce function
function debounce(func, delay) {
  return function (...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function formatCurrency(amount) {
  return `${currentCurrencySymbol}${amount.toFixed(2)}`;
}
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "block";
}
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
  resetModalForms(modalId);
}
function resetModalForms(modalId) {
  /* ... (reset logic unchanged) ... */
  if (modalId === "add-club-modal") {
    clubNameInput.value = "";
    editingClubName = null;
    clubModalTitle.textContent = "Add Club";
  } else if (modalId === "add-transaction-modal") {
    transactionIdInput.value = "";
    transactionClubSelect.value = "";
    transactionTypeSelect.value = "expense";
    transactionAmountInput.value = "";
    transactionDescriptionInput.value = "";
    transactionDateInput.valueAsDate = new Date();
    editingTransactionId = null;
    transactionModalTitle.textContent = "Add Transaction";
  } else if (modalId === "add-user-modal") {
    userIdInput.value = "";
    userFullnameInput.value = "";
    usernameInput.value = "";
    usernameInput.disabled = false;
    userRoleSelect.value = "member";
    userPasswordInput.value = "";
    userPasswordInput.placeholder = "Enter password";
    editingUserId = null;
    userModalTitle.textContent = "Add User";
  } else if (modalId === "club-members-modal") {
    addClubMemberSelect.value = "";
  }
}
function showAlert(message, type = "info", duration = 3000) {
  /* ... (alert logic unchanged) ... */
  console.log(`ALERT (${type}): ${message}`);
  if (type === "error") {
    if (loginScreen.style.display === "flex") {
      loginError.textContent = message;
      loginError.classList.remove("hidden");
      setTimeout(() => loginError.classList.add("hidden"), duration);
    } else {
      alert(`Error: ${message}`);
    }
  } else {
    alert(message);
  }
  if (
    type === "success" &&
    settingsSavedMessage &&
    message.includes("Settings saved")
  ) {
    settingsSavedMessage.classList.remove("hidden");
    setTimeout(() => settingsSavedMessage.classList.add("hidden"), duration);
  }
}

// --- Data Export/Import (Unchanged - Still insecure & non-persistent) ---
function exportData() {
  /* ... (export logic unchanged) ... */
  if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only administrators can export data.", "error");
    return;
  }
  const dataToExport = {
    clubs: clubs,
    transactions: transactions,
    users: users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      role: u.role,
    })),
    settings: { currencySymbol: currentCurrencySymbol },
    exportDate: new Date().toISOString(),
    version: "1.1",
  };
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `club_budget_backup_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showAlert("Data exported successfully.", "success");
}
function importData(file) {
  /* ... (import logic unchanged) ... */
  if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only administrators can import data.", "error");
    return;
  }
  if (!file) {
    showAlert("Please select a file to import.", "error");
    return;
  }
  if (!file.name.endsWith(".json")) {
    showAlert("Invalid file type. Please select a .json backup file.", "error");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (
        !importedData.clubs ||
        !importedData.transactions ||
        !importedData.users ||
        !importedData.settings
      ) {
        throw new Error("Invalid or incomplete data format in backup file.");
      }
      if (
        confirm(
          "WARNING: This will replace ALL existing data in browser memory with the backup file data. Data will be lost on refresh. Continue?"
        )
      ) {
        clubs = importedData.clubs || [];
        transactions = importedData.transactions || [];
        users = (importedData.users || []).map((u) => ({
          ...u,
          password: "password",
        }));
        currentCurrencySymbol = importedData.settings.currencySymbol || "₹";
        let updatedCurrentUser = users.find(
          (u) => u.username === currentUser.username
        );
        if (!updatedCurrentUser) {
          updatedCurrentUser =
            users.find((u) => u.role === "admin") || users[0] || null;
          if (!updatedCurrentUser) {
            handleLogout();
            showAlert(
              "Import successful, but no users found. Logging out.",
              "info"
            );
            return;
          }
          currentUser = updatedCurrentUser;
          showAlert(
            "Your user account was not in the backup. Assigned default role.",
            "info"
          );
        } else {
          currentUser = updatedCurrentUser;
        }
        initializeAppUI();
        showAlert(
          "Data imported successfully! Remember: Data is not saved permanently.",
          "success"
        );
      }
    } catch (error) {
      showAlert(`Error importing data: ${error.message}`, "error");
      console.error("Import error:", error);
    }
  };
  reader.onerror = function () {
    showAlert("Error reading the selected file.", "error");
  };
  reader.readAsText(file);
}

// --- Login/Logout Logic (Unchanged - Still insecure) ---
loginButton.addEventListener("click", () => {
  /* ... (login logic unchanged) ... */
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value;
  loginError.classList.add("hidden");
  const foundUser = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (foundUser && foundUser.password === password) {
    currentUser = foundUser;
    loginScreen.style.display = "none";
    appContainer.style.display = "flex";
    appContainer.classList.add("visible");
    initializeAppUI();
    loginUsernameInput.value = "";
    loginPasswordInput.value = "";
  } else {
    showAlert("Invalid username or password.", "error");
    currentUser = null;
  }
});
function handleLogout() {
  /* ... (logout logic unchanged) ... */
  currentUser = null;
  appContainer.style.display = "none";
  appContainer.classList.remove("visible");
  loginScreen.style.display = "flex";
  if (budgetChart) budgetChart.destroy();
  if (yearlyBudgetChart) yearlyBudgetChart.destroy();
  budgetChart = null;
  yearlyBudgetChart = null;
  currentUserDisplay.textContent = "";
  currentRoleDisplay.textContent = "";
  clubList.innerHTML = "";
  transactionList.innerHTML = "";
  settingsUserList.innerHTML = "";
}
logoutButton.addEventListener("click", handleLogout);

// --- Initialization (Called AFTER successful login) ---
function initializeAppUI() {
  /* ... (initializeAppUI logic largely unchanged) ... */
  if (!currentUser) return;
  settingCurrencySelect.value = currentCurrencySymbol;
  updateCurrencySymbols();
  currentUserDisplay.textContent = currentUser.fullName || currentUser.username;
  currentRoleDisplay.textContent = currentUser.role;
  applyPermissions(); // Apply client-side permissions
  recalculateAllClubBalances();
  renderClubList();
  resetTransactionSearch(); // Reset filters/sort AND render initial transactions
  renderRecentTransactions();
  renderDashboardCharts();
renderSettingsUserList();
updateClubDropdowns();
switchPage("dashboard");
setReportDefaults();
addCommonEventListeners();
console.log(
  "App Initialized for user:",
  currentUser.username,
  "Role:",
  currentUser.role
);
addSearchEventListeners(); // Ensure search listeners are added *after* elements exist

// --- Settings: Create User from Pending Member ---
settingsUserList.addEventListener("click", function (e) {
  const btn = e.target.closest(".create-user-from-member");
  if (!btn) return;
  const memberName = btn.getAttribute("data-member-name");
  const memberRole = btn.getAttribute("data-member-role") || "member";
  openAddUserModal();
  userFullnameInput.value = memberName;
  userRoleSelect.value = memberRole;
  usernameInput.value = "";
  userPasswordInput.value = "";
  setTimeout(() => usernameInput.focus(), 100);
});
}

// --- Apply Permissions Based on Role (CLIENT-SIDE ONLY - INSECURE) ---
function applyPermissions() {
  /* ... (applyPermissions logic unchanged) ... */
  if (!currentUser) return;
  const isAdmin = currentUser.role === "admin";
  userManagementSection.style.display = isAdmin ? "block" : "none";
  const adminOnlyButtons = [
    addClubButton,
    saveClubButton,
    addTransactionButton,
    saveTransactionButton,
    addUserButton,
    saveUserButton,
    exportDataButton,
    importDataButton,
    exportExcelButton,
    saveSettingsButton,
    addMemberButton,
  ];
  adminOnlyButtons.forEach((button) => {
    if (button) button.disabled = !isAdmin;
  });
}

// --- Rendering Functions ---
function initializeClubBalances() {
  /* ... (unchanged) ... */ clubs.forEach((club) => {
    clubBalances[club.name] = { income: 0, expenses: 0, budget: 0 };
  });
}
function recalculateAllClubBalances() {
  /* ... (unchanged) ... */ initializeClubBalances();
  transactions.forEach((t) => {
    if (clubBalances[t.club]) {
      if (t.type === "income") {
        clubBalances[t.club].income += t.amount;
      } else if (t.type === "expense") {
        clubBalances[t.club].expenses += t.amount;
      }
    } else {
      console.warn(`Transaction references non-existent club: ${t.club}`);
    }
  });
  Object.keys(clubBalances).forEach((clubName) => {
    clubBalances[clubName].budget =
      clubBalances[clubName].income - clubBalances[clubName].expenses;
  });
}
function renderClubList() {
  /* ... (renderClubList logic unchanged) ... */
  clubList.innerHTML = "";
  const isAdmin = currentUser && currentUser.role === "admin";
  if (clubs.length === 0) {
    clubList.innerHTML =
      '<tr><td colspan="2" class="px-6 py-4 text-center text-gray-500">No clubs added yet.</td></tr>';
    return;
  }
  clubs.forEach((club) => {
    const row = document.createElement("tr");
    const actionsHtml = isAdmin
      ? `<button class="btn btn-primary btn-sm edit-club-button" data-club="${club.name}" title="Edit Club"><i class="fas fa-edit"></i></button> <button class="btn btn-secondary btn-sm manage-members-button" data-club="${club.name}" title="Manage Members"><i class="fas fa-users"></i></button> <button class="btn btn-danger btn-sm delete-club-button" data-club="${club.name}" title="Delete Club"><i class="fas fa-trash"></i></button>`
      : `<span class="text-xs text-gray-500 italic">View Only</span>`;
    row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center"><img src="${
      club.image || club.defaultImage
    }" onerror="this.onerror=null; this.src='${club.defaultImage}'" alt="${
      club.name
    }" class="w-10 h-10 rounded-full object-cover mr-4 shrink-0 club-image-hover"><span class="text-sm font-medium text-gray-900">${
      club.name
    }</span></div></td><td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">${actionsHtml}</td>`;
    clubList.appendChild(row);
  });
}

// ENHANCED: Render Transactions List (with Filtering AND Sorting)
function renderTransactions() {
  if (!transactionList) return; // Ensure element exists
  transactionList.innerHTML = ""; // Clear list
  const isAdmin = currentUser && currentUser.role === "admin";

  // --- Filtering ---
  const searchText = transactionSearch.value.toLowerCase();
  const selectedClub = transactionSearchClub.value;
  const dateStartStr = transactionSearchDateStart.value;
  const dateEndStr = transactionSearchDateEnd.value;
  const dateStart = dateStartStr ? new Date(dateStartStr + "T00:00:00") : null;
  const dateEnd = dateEndStr ? new Date(dateEndStr + "T23:59:59") : null;
  const amountMin = parseFloat(transactionSearchAmountMin.value) || 0;
  const amountMax = parseFloat(transactionSearchAmountMax.value) || Infinity;

  let filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchText ||
      (transaction.description &&
        transaction.description.toLowerCase().includes(searchText)) ||
      transaction.club.toLowerCase().includes(searchText);
    const matchesClub = !selectedClub || transaction.club === selectedClub;
    let transactionDate = null;
    try {
      transactionDate = new Date(transaction.date + "T00:00:00");
      if (isNaN(transactionDate.getTime())) return false;
    } catch (e) {
      return false;
    }
    const matchesDate =
      (!dateStart || transactionDate >= dateStart) &&
      (!dateEnd || transactionDate <= dateEnd);
    const matchesAmount =
      transaction.amount >= amountMin && transaction.amount <= amountMax;
    return matchesSearch && matchesClub && matchesDate && matchesAmount;
  });

  // --- Sorting ---
  if (transactionSortColumn) {
    filteredTransactions.sort((a, b) => {
      let valA, valB;
      switch (transactionSortColumn) {
        case "date":
          valA = new Date(a.date);
          valB = new Date(b.date);
          break;
        case "club":
        case "type":
          valA = a[transactionSortColumn].toLowerCase();
          valB = b[transactionSortColumn].toLowerCase();
          break;
        case "amount":
          valA = a.amount;
          valB = b.amount;
          break;
        default:
          return 0; // No sort if column unknown
      }

      if (valA < valB) return transactionSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return transactionSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  // --- Update Sort Indicators ---
  updateSortIndicators();

  // --- Rendering ---
  if (filteredTransactions.length === 0) {
    const message =
      searchText ||
      selectedClub ||
      dateStart ||
      dateEnd ||
      transactionSearchAmountMin.value ||
      transactionSearchAmountMax.value
        ? "No transactions found matching the filter/sort criteria."
        : "No transactions recorded yet.";
    transactionList.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">${message}</td></tr>`;
    return;
  }

  filteredTransactions.forEach((transaction) => {
    const row = document.createElement("tr");
    const amountClass =
      transaction.type === "income"
        ? "text-green-600 font-semibold"
        : "text-red-600";
    const typeClass =
      transaction.type === "income"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";
    const actionsHtml = isAdmin
      ? `<button class="btn btn-primary btn-sm edit-transaction-button" data-id="${transaction.id}" title="Edit"><i class="fas fa-edit"></i></button> <button class="btn btn-danger btn-sm delete-transaction-button" data-id="${transaction.id}" title="Delete"><i class="fas fa-trash"></i></button>`
      : `<span class="text-xs text-gray-500 italic">View Only</span>`;

    row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
              transaction.date
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
              transaction.club
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClass}">${
      transaction.type
    }</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right ${amountClass}">${formatCurrency(
      transaction.amount
    )}</td> <td class="px-6 py-4 text-sm text-gray-500 break-words min-w-[150px]">${
      transaction.description || "-"
    }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">${actionsHtml}</td>
        `;
    transactionList.appendChild(row);
  });
}

// ENHANCEMENT: Update sort indicators in table header
function updateSortIndicators() {
  if (!transactionTableHead) return;
  transactionTableHead
    .querySelectorAll(".sortable-header")
    .forEach((header) => {
      const sortIcon = header.querySelector(".sort-icon i");
      if (!sortIcon) return;

      const sortBy = header.dataset.sortBy;
      if (sortBy === transactionSortColumn) {
        header.classList.add("sort-active");
        sortIcon.className =
          transactionSortDirection === "asc"
            ? "fas fa-sort-up"
            : "fas fa-sort-down";
      } else {
        header.classList.remove("sort-active");
        sortIcon.className = "fas fa-sort"; // Reset to default sort icon
      }
    });
}

function renderRecentTransactions() {
  /* ... (renderRecentTransactions logic unchanged) ... */
  if (!recentTransactionsTable) return;
  recentTransactionsTable.innerHTML = "";
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  if (recent.length === 0) {
    recentTransactionsTable.innerHTML = `<tr><td colspan="4" class="px-4 py-4 text-center text-gray-500">No transactions recorded yet</td></tr>`;
    return;
  }
  recent.forEach((transaction) => {
    const amountClass =
      transaction.type === "income" ? "text-green-600" : "text-red-600";
    const typeClass =
      transaction.type === "income"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50";
    row.innerHTML = `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${
      transaction.date
    }</td><td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${
      transaction.club
    }</td><td class="px-4 py-2 whitespace-nowrap text-sm capitalize"><span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClass}">${
      transaction.type
    }</span></td><td class="px-4 py-2 whitespace-nowrap text-sm font-medium ${amountClass}">${formatCurrency(
      transaction.amount
    )}</td>`;
    recentTransactionsTable.appendChild(row);
  });
}


function updateClubDropdowns() {
  /* ... (updateClubDropdowns logic unchanged) ... */
  const currentTransactionClub = transactionClubSelect.value;
  const currentReportClub = reportClubSelect.value;
  const currentSearchClub = transactionSearchClub.value;
  transactionClubSelect.innerHTML = '<option value="">Select Club</option>';
  reportClubSelect.innerHTML = '<option value="">All Clubs</option>';
  transactionSearchClub.innerHTML = '<option value="">All Clubs</option>';
  const sortedClubs = [...clubs].sort((a, b) => a.name.localeCompare(b.name));
  sortedClubs.forEach((club) => {
    const option1 = document.createElement("option");
    option1.value = club.name;
    option1.textContent = club.name;
    transactionClubSelect.appendChild(option1);
    const option2 = document.createElement("option");
    option2.value = club.name;
    option2.textContent = club.name;
    reportClubSelect.appendChild(option2);
    const option3 = document.createElement("option");
    option3.value = club.name;
    option3.textContent = club.name;
    transactionSearchClub.appendChild(option3);
  });
  if (clubs.some((club) => club.name === currentTransactionClub)) {
    transactionClubSelect.value = currentTransactionClub;
  }
  if (clubs.some((club) => club.name === currentReportClub)) {
    reportClubSelect.value = currentReportClub;
  }
  if (clubs.some((club) => club.name === currentSearchClub)) {
    transactionSearchClub.value = currentSearchClub;
  }
}
function updateCurrencySymbols() {
  /* ... (updateCurrencySymbols logic unchanged) ... */
  currencySymbolElements.forEach(
    (el) => (el.textContent = currentCurrencySymbol)
  );
  const transactionAmountLabel = document.querySelector(
    'label[for="transaction-amount"]'
  );
  if (transactionAmountLabel) {
    transactionAmountLabel.innerHTML = `Amount (<span class="currency-symbol">${currentCurrencySymbol}</span>)`;
  }
  renderDashboardCharts();
  renderTransactions();
  renderRecentTransactions();
  if (
    document.getElementById("reports").classList.contains("hidden") === false
  ) {
    generateReport();
  }
}
function renderDashboardCharts() {
  /* ... (renderDashboardCharts logic unchanged) ... */
  recalculateAllClubBalances();
  let totalIncome = 0,
    totalExpenses = 0;
  Object.values(clubBalances).forEach((balance) => {
    totalIncome += balance.income;
    totalExpenses += balance.expenses;
  });
  const netBudget = totalIncome - totalExpenses;
  dashboardTotalBudgetElement.textContent = formatCurrency(totalIncome);
  dashboardTotalSpentElement.textContent = formatCurrency(totalExpenses);
  dashboardRemainingBudgetElement.textContent = formatCurrency(netBudget);
  dashboardRemainingBudgetElement.classList.remove(
    "text-blue-500",
    "text-red-500",
    "text-gray-700"
  );
  if (netBudget > 0) {
    dashboardRemainingBudgetElement.classList.add("text-blue-500");
  } else if (netBudget < 0) {
    dashboardRemainingBudgetElement.classList.add("text-red-500");
  } else {
    dashboardRemainingBudgetElement.classList.add("text-gray-700");
  }
  renderClubIncomeExpenseChart();
}
function renderClubIncomeExpenseChart() {
  /* ... (renderClubIncomeExpenseChart logic unchanged) ... */
  if (!budgetChartCtx) return;
  const clubNames = clubs.map((club) => club.name).sort();
  const incomeData = clubNames.map((name) => clubBalances[name]?.income || 0);
  const expensesData = clubNames.map(
    (name) => clubBalances[name]?.expenses || 0
  );
  const chartData = {
    labels: clubNames,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
      {
        label: "Expenses",
        data: expensesData,
        backgroundColor: "rgba(239, 68, 68, 0.6)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };
  if (budgetChart) {
    budgetChart.destroy();
  }
  budgetChart = new Chart(budgetChartCtx, {
    type: "bar",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: false },
        legend: { position: "bottom", labels: { boxWidth: 12, padding: 20 } },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (value) => formatCurrency(value) },
        },
        x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } },
      },
    },
  });
}

// --- Page Switching (Unchanged) ---
function switchPage(pageId) {
  /* ... (switchPage logic unchanged) ... */
  pages.forEach((page) => page.classList.add("hidden"));
  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.classList.remove("hidden");
  sidebarItems.forEach((item) => item.classList.remove("active"));
  const activeItem = document.querySelector(
    `.sidebar-item[data-page="${pageId}"]`
  );
  if (activeItem) activeItem.classList.add("active");
  if (pageId === "dashboard") {
    renderDashboardCharts();
    renderRecentTransactions();
  } else if (pageId === "clubs") {
    renderClubList();
  } else if (pageId === "transactions") {
    renderTransactions();
  } else if (pageId === "reports") {
    if (!yearlyBudgetChart && yearlyBudgetChartCtx) renderYearlyBudgetChart();
    generateReport();
  } else if (pageId === "settings") {
    renderSettingsUserList();
  }
}

// --- Modal Opening Functions (Unchanged - Client-Side Permissions) ---
function openAddClubModal() {
  /* ... */ if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can add clubs.", "error");
    return;
  }
  resetModalForms("add-club-modal");
  showModal("add-club-modal");
}
function openEditClubModal(clubName) {
  /* ... */ if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can edit clubs.", "error");
    return;
  }
  const club = clubs.find((c) => c.name === clubName);
  if (!club) {
    showAlert("Club not found.", "error");
    return;
  }
  editingClubName = clubName;
  clubNameInput.value = club.name;
  clubModalTitle.textContent = "Edit Club";
  showModal("add-club-modal");
}
function openAddTransactionModal() {
  /* ... */ if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can add transactions.", "error");
    return;
  }
  resetModalForms("add-transaction-modal");
  updateClubDropdowns();
  transactionDateInput.valueAsDate = new Date();
  showModal("add-transaction-modal");
}
function openEditTransactionModal(transactionId) {
  /* ... */ if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can edit transactions.", "error");
    return;
  }
  const transaction = transactions.find((t) => t.id === transactionId);
  if (!transaction) {
    showAlert("Transaction not found.", "error");
    return;
  }
  editingTransactionId = transactionId;
  transactionModalTitle.textContent = "Edit Transaction";
  transactionIdInput.value = transaction.id;
  updateClubDropdowns();
  transactionClubSelect.value = transaction.club;
  transactionTypeSelect.value = transaction.type;
  transactionAmountInput.value = transaction.amount;
  transactionDescriptionInput.value = transaction.description || "";
  transactionDateInput.value = transaction.date;
  showModal("add-transaction-modal");
}
function openAddUserModal() {
  /* ... */ if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can add users.", "error");
    return;
  }
  resetModalForms("add-user-modal");
  showModal("add-user-modal");
}
function openEditUserModal(userId) {
  /* ... */ if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can edit users.", "error");
    return;
  }
  const user = users.find((u) => u.id === userId);
  if (!user) {
    showAlert("User not found.", "error");
    return;
  }
  if (user.id === currentUser.id) {
    showAlert("Admin cannot edit own account via this form.", "info");
    return;
  }
  editingUserId = userId;
  userModalTitle.textContent = "Edit User";
  userIdInput.value = user.id;
  userFullnameInput.value = user.fullName || "";
  usernameInput.value = user.username;
  usernameInput.disabled = true;
  userRoleSelect.value = user.role;
  userPasswordInput.value = "";
  userPasswordInput.placeholder = "Leave blank to keep current password";
  showModal("add-user-modal");
}
function openManageMembersModal(clubName) {
  /* ... */ if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can manage members.", "error");
    return;
  }
  const club = clubs.find((c) => c.name === clubName);
  if (!club) {
    showAlert("Club not found.", "error");
    return;
  }
  clubMembersModal.dataset.currentClub = clubName;
  clubMembersModalTitle.textContent = `Manage Members: ${club.name}`;
  renderClubMembers(club);
  showModal("club-members-modal");
}

// --- Save Functions (Unchanged - Client-Side Permissions, In-Memory Save) ---
function saveClub() {
  /* ... (saveClub logic unchanged) ... */
  if (!currentUser || currentUser.role !== "admin") return;
  const clubName = clubNameInput.value.trim();
  if (!clubName) {
    showAlert("Please enter a club name.", "error");
    return;
  }
  const isNewClub = !editingClubName;
  const originalName = editingClubName;
  if (
    clubs.some(
      (c) =>
        c.name.toLowerCase() === clubName.toLowerCase() &&
        c.name !== originalName
    )
  ) {
    showAlert("Club name already exists.", "error");
    return;
  }
  const defaultImage = "images/default-club.png";
  const clubImage = `images/${clubName.toLowerCase().replace(/\s+/g, "-")}.png`;
  if (isNewClub) {
    clubs.push({
      name: clubName,
      image: clubImage,
      defaultImage: defaultImage,
      members: [],
      clubAdmin: null,
    });
    clubBalances[clubName] = { budget: 0, expenses: 0, income: 0 };
    showAlert(`Club "${clubName}" added.`, "success");
  } else {
    const clubIndex = clubs.findIndex((c) => c.name === originalName);
    if (clubIndex > -1) {
      const oldClubData = clubs[clubIndex];
      clubs[clubIndex] = { ...oldClubData, name: clubName, image: clubImage };
      if (originalName !== clubName) {
        clubBalances[clubName] = clubBalances[originalName];
        delete clubBalances[originalName];
        transactions.forEach((t) => {
          if (t.club === originalName) t.club = clubName;
        });
        showAlert(
          `Club "${originalName}" updated to "${clubName}".`,
          "success"
        );
      } else {
        showAlert(`Club "${clubName}" updated.`, "success");
      }
    } else {
      showAlert(`Error updating club "${originalName}". Not found.`, "error");
      hideModal("add-club-modal");
      return;
    }
  }
  renderClubList();
  renderTransactions();
  updateClubDropdowns();
  renderDashboardCharts();
  hideModal("add-club-modal");
}
function saveTransaction() {
  /* ... (saveTransaction logic unchanged) ... */
  if (!currentUser || currentUser.role !== "admin") return;
  const club = transactionClubSelect.value;
  const type = transactionTypeSelect.value;
  const amount = parseFloat(transactionAmountInput.value);
  const description = transactionDescriptionInput.value.trim();
  const date = transactionDateInput.value;
  const id = editingTransactionId ? editingTransactionId : Date.now();
  if (!club) {
    showAlert("Select club.", "error");
    return;
  }
  if (!type) {
    showAlert("Select type.", "error");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    showAlert("Enter valid positive amount.", "error");
    return;
  }
  if (!date) {
    showAlert("Select date.", "error");
    return;
  }
  if (!clubs.some((c) => c.name === club)) {
    showAlert("Invalid club.", "error");
    return;
  }
  const newTransactionData = { id, club, type, amount, description, date };
  if (editingTransactionId) {
    const index = transactions.findIndex((t) => t.id === id);
    if (index > -1) {
      transactions[index] = newTransactionData;
      showAlert("Transaction updated.", "success");
    } else {
      showAlert("Error updating. ID not found.", "error");
      hideModal("add-transaction-modal");
      return;
    }
  } else {
    transactions.push(newTransactionData);
    showAlert("Transaction added.", "success");
  }
  recalculateAllClubBalances();
  renderTransactions();
  renderRecentTransactions();
  renderDashboardCharts();
  if (
    document.getElementById("reports").classList.contains("hidden") === false
  ) {
    generateReport();
  }
  hideModal("add-transaction-modal");
}
function saveUser() {
  /* ... (saveUser logic unchanged - Insecure Passwords) ... */
  if (!currentUser || currentUser.role !== "admin") return;
  const fullName = userFullnameInput.value.trim();
  const username = usernameInput.value.trim();
  const role = userRoleSelect.value;
  const password = userPasswordInput.value;
  const id = editingUserId ? editingUserId : Date.now();
  if (!fullName) {
    showAlert("Enter full name.", "error");
    return;
  }
  if (!username) {
    showAlert("Enter username.", "error");
    return;
  }
  if (!editingUserId && !password) {
    showAlert("Password required for new users.", "error");
    return;
  }
  if (editingUserId && role !== "admin") {
    const adminCount = users.filter((u) => u.role === "admin").length;
    const userBeingEdited = users.find((u) => u.id === editingUserId);
    if (
      userBeingEdited &&
      userBeingEdited.role === "admin" &&
      adminCount <= 1
    ) {
      showAlert("Cannot remove last admin role.", "error");
      return;
    }
  }
  if (
    !editingUserId &&
    users.some((u) => u.username.toLowerCase() === username.toLowerCase())
  ) {
    showAlert("Username already exists.", "error");
    return;
  }
  if (editingUserId) {
    const index = users.findIndex((u) => u.id === id);
    if (index > -1) {
      if (users[index].id === currentUser.id) {
        showAlert("Cannot edit own account here.", "error");
        hideModal("add-user-modal");
        return;
      }
      users[index].fullName = fullName;
      users[index].role = role;
      if (password) {
        users[index].password = password;
      }
      showAlert(`User "${users[index].username}" updated.`, "success");
    } else {
      showAlert("Error updating user. ID not found.", "error");
      hideModal("add-user-modal");
      return;
    }
  } else {
    users.push({ id, fullName, username, password, role });
    showAlert(`User "${username}" added.`, "success");
  }
  renderSettingsUserList();
  if (clubMembersModal.style.display === "block") {
    const clubName = clubMembersModal.dataset.currentClub;
    const club = clubs.find((c) => c.name === clubName);
    if (club) populateAvailableMembers(club);
  }
  hideModal("add-user-modal");
}
function saveSettings() {
  /* ... (saveSettings logic unchanged) ... */
  if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can save.", "error");
    return;
  }
  const oldCurrency = currentCurrencySymbol;
  currentCurrencySymbol = settingCurrencySelect.value;
  if (oldCurrency !== currentCurrencySymbol) {
    updateCurrencySymbols();
  }
  showAlert("Settings saved!", "success");
}

// --- Delete Functions (Unchanged - Client-Side Permissions, In-Memory Delete) ---
function deleteClub(clubToDelete) {
  /* ... */ if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can delete.", "error");
    return;
  }
  if (confirm(`Delete "${clubToDelete}" & transactions? (Lost on refresh)`)) {
    const index = clubs.findIndex((c) => c.name === clubToDelete);
    if (index > -1) {
      clubs.splice(index, 1);
      delete clubBalances[clubToDelete];
      transactions = transactions.filter((t) => t.club !== clubToDelete);
      renderClubList();
      renderTransactions();
      renderRecentTransactions();
      updateClubDropdowns();
      renderDashboardCharts();
      if (
        document.getElementById("reports").classList.contains("hidden") ===
        false
      ) {
        generateReport();
      }
      showAlert(`Club "${clubToDelete}" deleted from memory.`, "success");
    } else {
      showAlert(`Error: Club "${clubToDelete}" not found.`, "error");
    }
  }
}
function deleteTransaction(transactionId) {
  /* ... */ if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can delete.", "error");
    return;
  }
  if (confirm(`Delete transaction?`)) {
    const index = transactions.findIndex((t) => t.id === transactionId);
    if (index > -1) {
      transactions.splice(index, 1);
      recalculateAllClubBalances();
      renderTransactions();
      renderRecentTransactions();
      renderDashboardCharts();
      if (
        document.getElementById("reports").classList.contains("hidden") ===
        false
      ) {
        generateReport();
      }
      showAlert(`Transaction deleted.`, "success");
    } else {
      showAlert("Error deleting. ID not found.", "error");
    }
  }
}
function deleteUser(userId) {
  /* ... */ if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can delete.", "error");
    return;
  }
  const userToDelete = users.find((u) => u.id === userId);
  if (!userToDelete) {
    showAlert("User not found.", "error");
    return;
  }
  if (userId === currentUser.id) {
    showAlert("Cannot delete own account.", "error");
    return;
  }
  if (
    userToDelete.role === "admin" &&
    users.filter((u) => u.role === "admin").length <= 1
  ) {
    showAlert("Cannot delete last admin.", "error");
    return;
  }
  if (confirm(`Delete user "${userToDelete.username}" & remove from clubs?`)) {
    users = users.filter((u) => u.id !== userId);
    clubs.forEach((club) => {
      club.members = club.members.filter((m) => m.userId !== userId);
      if (club.clubAdmin === userId) {
        club.clubAdmin = null;
      }
    });
    renderSettingsUserList();
    if (clubMembersModal.style.display === "block") {
      const clubName = clubMembersModal.dataset.currentClub;
      const club = clubs.find((c) => c.name === clubName);
      if (club) {
        renderClubMembers(club);
        populateAvailableMembers(club);
      }
    }
    showAlert(`User "${userToDelete.username}" deleted.`, "success");
  }
}

// --- Club Member Management (Unchanged - Client-Side Permissions, In-Memory) ---
function renderClubMembers(club) {
  /* ... (renderClubMembers logic unchanged, uses corrected 'member.userId') ... */
  if (!club) return;
  clubMembersList.innerHTML = "";
  const isAdmin = currentUser && currentUser.role === "admin";
  if (!club.members || club.members.length === 0) {
    clubMembersList.innerHTML = `<tr><td colspan="3" class="px-4 py-3 text-center text-gray-500">No members assigned.</td></tr>`;
    return;
  }
  club.members.forEach((member, idx) => {
    let row = document.createElement("tr");
    let isClubAdmin = member.role === "admin";
    let actionsHtml = '<span class="text-xs text-gray-500 italic">View Only</span>';
    if (isAdmin) {
      // Use data-member-idx for promote, depromote, and remove buttons
      if (isClubAdmin) {
        actionsHtml = `<button class="btn btn-warning btn-sm depromote-member" data-club="${club.name}" data-member-idx="${idx}" title="Depromote">Depromote</button> <button class="btn btn-danger btn-sm remove-member" data-club="${club.name}" data-member-idx="${idx}" title="Remove">Remove</button>`;
      } else {
        actionsHtml = `<button class="btn btn-primary btn-sm promote-member" data-club="${club.name}" data-member-idx="${idx}" title="Make Admin">Make Admin</button> <button class="btn btn-danger btn-sm remove-member" data-club="${club.name}" data-member-idx="${idx}" title="Remove">Remove</button>`;
      }
    }
    // If member has a name (custom added), show name/role; else fallback to userId lookup
    if (member.name) {
      row.innerHTML = `<td class="px-4 py-3"><div class="font-medium">${member.name}</div></td><td class="px-4 py-3 capitalize">${isClubAdmin ? '<span class="font-semibold text-green-600">Club Admin</span>' : "Member"}</td><td class="px-4 py-3 space-x-2">${actionsHtml}</td>`;
    } else {
      const user = users.find((u) => u.id === member.userId);
      if (user) {
        row.innerHTML = `<td class="px-4 py-3"><div class="font-medium">${user.fullName || user.username}</div><div class="text-xs text-gray-500">${user.username}</div></td><td class="px-4 py-3 capitalize">${isClubAdmin ? '<span class="font-semibold text-green-600">Club Admin</span>' : "Member"}</td><td class="px-4 py-3 space-x-2">${actionsHtml}</td>`;
      } else {
        row.innerHTML = `<td class="px-4 py-3"><div class="font-medium text-red-500">Unknown User</div></td><td class="px-4 py-3 capitalize">Member</td><td class="px-4 py-3 space-x-2">${actionsHtml}</td>`;
      }
    }
    clubMembersList.appendChild(row);
  });
}
function populateAvailableMembers(club) {
  // No-op: legacy function, not needed for name/role input UI
  return;
}
function addClubMember(clubName, userIdStr) {
  /* ... (unchanged) ... */
  if (!currentUser || currentUser.role !== "admin") return;
  const club = clubs.find((c) => c.name === clubName);
  if (!club) {
    showAlert("Club not found", "error");
    return;
  }
  const userId = parseInt(userIdStr);
  if (isNaN(userId) || !users.some((u) => u.id === userId)) {
    showAlert("Invalid user.", "error");
    return;
  }
  if (club.members.some((m) => m.userId === userId)) {
    showAlert("User already member.", "info");
    return;
  }
  club.members.push({ userId: userId, role: "member" });
  renderClubMembers(club);
  // Also update Manage Users list to reflect new member
  renderSettingsUserList();
  addClubMemberSelect.value = "";
  showAlert("Member added.", "success");
}
function removeClubMember(clubName, userId) {
  /* ... (unchanged) ... */
  if (!currentUser || currentUser.role !== "admin") return;
  const club = clubs.find((c) => c.name === clubName);
  if (!club) {
    showAlert("Club not found", "error");
    return;
  }
  if (confirm("Remove member?")) {
    const initialLength = club.members.length;
    club.members = club.members.filter((m) => m.userId !== userId);
    if (club.clubAdmin === userId) {
      club.clubAdmin = null;
    }
    if (club.members.length < initialLength) {
      renderClubMembers(club);
      // Also update Manage Users list to reflect removed member
      renderSettingsUserList();
      showAlert("Member removed.", "success");
    } else {
      showAlert("Member not found.", "error");
    }
  }
}
function promoteClubMember(clubName, userId) {
  /* ... (unchanged) ... */
  if (!currentUser || currentUser.role !== "admin") return;
  const club = clubs.find((c) => c.name === clubName);
  if (!club) {
    showAlert("Club not found", "error");
    return;
  }
  const memberIndex = club.members.findIndex((m) => m.userId === userId);
  if (memberIndex === -1) {
    showAlert("Member not found.", "error");
    return;
  }
  if (confirm("Make Club Admin? Current admin becomes member.")) {
    const currentAdminIndex = club.members.findIndex((m) => m.role === "admin");
    if (currentAdminIndex > -1) {
      club.members[currentAdminIndex].role = "member";
    }
    club.members[memberIndex].role = "admin";
    club.clubAdmin = userId;
    renderClubMembers(club);
    showAlert("Member promoted.", "success");
  }
}

// --- Reports (Unchanged) ---
function setReportDefaults() {
  /* ... */ reportTypeSelect.value = "monthly";
  toggleCustomDateRange();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  reportStartDateInput.valueAsDate = firstDayOfMonth;
  reportEndDateInput.valueAsDate = today;
  reportClubSelect.value = "";
  if (!yearlyBudgetChart && yearlyBudgetChartCtx) renderYearlyBudgetChart();
}
function toggleCustomDateRange() {
  /* ... */ const isCustom = reportTypeSelect.value === "custom";
  customDateRangeDiv.classList.toggle("hidden", !isCustom);
}
function generateReport() {
  /* ... (generateReport logic unchanged) ... */
  const reportType = reportTypeSelect.value;
  const selectedClub = reportClubSelect.value;
  const startDateStr = reportStartDateInput.value;
  const endDateStr = reportEndDateInput.value;
  let reportTitle = "";
  const now = new Date();
  const currentMonthName = now.toLocaleString("default", { month: "long" });
  const currentYear = now.getFullYear();
  let startDate = null;
  let endDate = null;
  let filteredTransactions = transactions.filter((t) => {
    let transactionDate = null;
    try {
      transactionDate = new Date(t.date + "T00:00:00");
      if (isNaN(transactionDate.getTime())) throw new Error("Invalid date");
    } catch (e) {
      console.error(`Invalid date format: ${t.date}`);
      return false;
    }
    const matchesClub = !selectedClub || t.club === selectedClub;
    let matchesDate = false;
    switch (reportType) {
      case "monthly":
        matchesDate =
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === currentYear;
        reportTitle = `Monthly Report (${currentMonthName} ${currentYear})`;
        break;
      case "yearly":
        matchesDate = transactionDate.getFullYear() === currentYear;
        reportTitle = `Yearly Report (${currentYear})`;
        break;
      case "custom":
        if (!startDateStr || !endDateStr) {
          showAlert("Select start/end dates.", "error");
          return false;
        }
        try {
          startDate = new Date(startDateStr + "T00:00:00");
          endDate = new Date(endDateStr + "T23:59:59");
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
            throw new Error("Invalid custom date");
        } catch (e) {
          showAlert("Invalid start/end date.", "error");
          return false;
        }
        matchesDate =
          transactionDate >= startDate && transactionDate <= endDate;
        reportTitle = `Custom Report (${startDateStr} to ${endDateStr})`;
        break;
      case "all":
        matchesDate = true;
        reportTitle = `All Time Report`;
        break;
      default:
        matchesDate = true;
        reportTitle = "Report";
    }
    return matchesClub && matchesDate;
  });
  if (
    reportType === "custom" &&
    (!startDateStr || !endDateStr || !startDate || !endDate)
  ) {
    reportContent.innerHTML = `<p class="text-red-500 italic">Select valid start/end dates.</p>`;
    return;
  }
  if (selectedClub) {
    reportTitle += ` - ${selectedClub}`;
  } else {
    reportTitle += ` - All Clubs`;
  }
  reportContent.innerHTML = generateReportHtml(
    reportTitle,
    selectedClub,
    filteredTransactions
  );
  const reportYear =
    reportType === "yearly" || reportType === "monthly"
      ? currentYear
      : endDate
      ? endDate.getFullYear()
      : currentYear;
  if (yearlyBudgetChartCtx) renderYearlyBudgetChart(selectedClub, reportYear);
}
function generateReportHtml(title, club, filteredTransactions) {
  /* ... (generateReportHtml logic unchanged) ... */
  let html = `<h3 class="text-xl font-semibold mb-4">${title}</h3>`;
  let totalIncome = 0;
  let totalExpenses = 0;
  if (filteredTransactions.length === 0) {
    html += `<p class="text-gray-500 italic">No transactions found.</p>`;
    return html;
  }
  filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
  html += `<div class="table-container border rounded-lg overflow-hidden"><table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>${
    !club
      ? '<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Club</th>'
      : ""
  }<th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th><th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th></tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
  filteredTransactions.forEach((t) => {
    const amountClass = t.type === "income" ? "text-green-600" : "text-red-600";
    totalIncome += t.type === "income" ? t.amount : 0;
    totalExpenses += t.type === "expense" ? t.amount : 0;
    html += `<tr><td class="px-4 py-2">${t.date}</td>${
      !club ? `<td class="px-4 py-2">${t.club}</td>` : ""
    }<td class="px-4 py-2 capitalize">${
      t.type
    }</td><td class="px-4 py-2 break-words min-w-[150px]">${
      t.description || "-"
    }</td><td class="px-4 py-2 text-right font-medium ${amountClass}">${formatCurrency(
      t.amount
    )}</td></tr>`;
  });
  html += `</tbody></table></div>`;
  const netBalance = totalIncome - totalExpenses;
  const netBalanceClass = netBalance >= 0 ? "text-blue-600" : "text-red-600";
  html += `<div class="mt-6 p-4 bg-gray-50 rounded-lg border"><h4 class="text-md font-semibold mb-2">Summary</h4><div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm"><div><strong>Income:</strong> <span class="text-green-600 font-semibold">${formatCurrency(
    totalIncome
  )}</span></div><div><strong>Expenses:</strong> <span class="text-red-600 font-semibold">${formatCurrency(
    totalExpenses
  )}</span></div><div><strong>Net Balance:</strong> <span class="${netBalanceClass} font-semibold">${formatCurrency(
    netBalance
  )}</span></div></div></div>`;
  return html;
}
function renderYearlyBudgetChart(
  selectedClub = "",
  year = new Date().getFullYear()
) {
  /* ... (renderYearlyBudgetChart logic unchanged) ... */
  if (!yearlyBudgetChartCtx) return;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyIncome = Array(12).fill(0);
  const monthlyExpenses = Array(12).fill(0);
  transactions.forEach((t) => {
    let d = null;
    try {
      d = new Date(t.date + "T00:00:00");
      if (isNaN(d.getTime())) throw new Error("Invalid date");
    } catch (e) {
      return;
    }
    if (
      d.getFullYear() === year &&
      (!selectedClub || t.club === selectedClub)
    ) {
      const monthIndex = d.getMonth();
      if (t.type === "income") {
        monthlyIncome[monthIndex] += t.amount;
      } else if (t.type === "expense") {
        monthlyExpenses[monthIndex] += t.amount;
      }
    }
  });
  const chartTitle = selectedClub
    ? `Monthly Overview: ${selectedClub} (${year})`
    : `Overall Monthly Overview (${year})`;
  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Income",
        data: monthlyIncome,
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.1,
      },
      {
        label: "Expenses",
        data: monthlyExpenses,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.1,
      },
    ],
  };
  if (yearlyBudgetChart) {
    yearlyBudgetChart.data = chartData;
    yearlyBudgetChart.options.plugins.title.text = chartTitle;
    yearlyBudgetChart.update();
  } else {
    yearlyBudgetChart = new Chart(yearlyBudgetChartCtx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chartTitle,
            font: { size: 16 },
            padding: { bottom: 15 },
          },
          legend: { position: "bottom", labels: { boxWidth: 12, padding: 20 } },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: `Amount (${currentCurrencySymbol})` },
            ticks: { callback: (value) => formatCurrency(value) },
          },
          x: { title: { display: true, text: "Month" } },
        },
      },
    });
  }
}

// --- Excel Export (Unchanged) ---
function exportToExcel() {
  /* ... (exportToExcel logic unchanged) ... */
  if (!currentUser || currentUser.role !== "admin") {
    showAlert("Only admins can export.", "error");
    return;
  }
  const reportType = reportTypeSelect.value;
  const selectedClub = reportClubSelect.value;
  const startDateStr = reportStartDateInput.value;
  const endDateStr = reportEndDateInput.value;
  const now = new Date();
  const currentYear = now.getFullYear();
  let startDate = null;
  let endDate = null;
  let filteredTransactions = transactions.filter((t) => {
    let transactionDate = null;
    try {
      transactionDate = new Date(t.date + "T00:00:00");
      if (isNaN(transactionDate.getTime())) throw new Error("Invalid date");
    } catch (e) {
      return false;
    }
    const matchesClub = !selectedClub || t.club === selectedClub;
    let matchesDate = false;
    switch (reportType) {
      case "monthly":
        matchesDate =
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === currentYear;
        break;
      case "yearly":
        matchesDate = transactionDate.getFullYear() === currentYear;
        break;
      case "custom":
        if (!startDateStr || !endDateStr) return false;
        try {
          startDate = new Date(startDateStr + "T00:00:00");
          endDate = new Date(endDateStr + "T23:59:59");
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
            throw new Error("Invalid custom date");
        } catch (e) {
          return false;
        }
        matchesDate =
          transactionDate >= startDate && transactionDate <= endDate;
        break;
      case "all":
        matchesDate = true;
        break;
      default:
        matchesDate = true;
    }
    return matchesClub && matchesDate;
  });
  if (filteredTransactions.length === 0) {
    showAlert("No data to export.", "info");
    return;
  }
  const reportData = filteredTransactions
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((t) => ({
      Date: t.date,
      Club: t.club,
      Type: t.type,
      Description: t.description || "",
      Amount: t.amount,
    }));
  const ws = XLSX.utils.json_to_sheet(reportData, {
    header: ["Date", "Club", "Type", "Description", "Amount"],
    skipHeader: false,
  });
  const colWidths = [
    { wch: 12 },
    { wch: 20 },
    { wch: 10 },
    { wch: 35 },
    { wch: 12 },
  ];
  ws["!cols"] = colWidths;
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const cell_address = { c: 4, r: R };
    const cell_ref = XLSX.utils.encode_cell(cell_address);
    if (ws[cell_ref]) {
      ws[cell_ref].t = "n";
      ws[cell_ref].z = `${currentCurrencySymbol}#,##0.00`;
    }
  }
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });
  XLSX.utils.sheet_add_aoa(ws, [["Summary:", "", "", "Income:", totalIncome]], {
    origin: -1,
  });
  XLSX.utils.sheet_add_aoa(ws, [["", "", "", "Expenses:", totalExpenses]], {
    origin: -1,
  });
  XLSX.utils.sheet_add_aoa(ws, [["", "", "", "Net Balance:", netBalance]], {
    origin: -1,
  });
  const summaryStartRow = range.e.r + 2;
  for (let R = summaryStartRow; R <= summaryStartRow + 2; ++R) {
    const cell_address = { c: 4, r: R };
    const cell_ref = XLSX.utils.encode_cell(cell_address);
    if (ws[cell_ref]) {
      ws[cell_ref].t = "n";
      ws[cell_ref].z = `${currentCurrencySymbol}#,##0.00`;
    }
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Budget Report");
  const dateStr = new Date().toISOString().split("T")[0];
  const clubNamePart = selectedClub
    ? selectedClub.replace(/\s+/g, "_")
    : "AllClubs";
  const fileName = `Budget_Report_${reportType}_${clubNamePart}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
  showAlert("Report exported to Excel.", "success");
}

// --- Event Listeners Setup ---
function addCommonEventListeners() {
  /* ... (Re-adds listeners using helper) ... */
  document.body.removeEventListener("click", handleDelegatedActions); // Remove first
  document.body.addEventListener("click", handleDelegatedActions);

  sidebarItems.forEach((item) => {
    removeAndAddListener(item, "click", handleSidebarClick);
  });
  modals.forEach((modal) => {
    const closeBtn = modal.querySelector(".close-button");
    if (closeBtn) {
      removeAndAddListener(closeBtn, "click", handleModalClose);
    }
    const specificCloseButtons = modal.querySelectorAll(
      ".close-members-modal-button, #cancel-club-button, #cancel-transaction-button, #cancel-user-button"
    );
    specificCloseButtons.forEach((btn) => {
      removeAndAddListener(btn, "click", handleModalCloseFromButton);
    });
    removeAndAddListener(modal, "click", handleModalBackgroundClick);
  });

  removeAndAddListener(addClubButton, "click", openAddClubModal);
  removeAndAddListener(saveClubButton, "click", saveClub);
  removeAndAddListener(addTransactionButton, "click", openAddTransactionModal);
  removeAndAddListener(saveTransactionButton, "click", saveTransaction);
  removeAndAddListener(addUserButton, "click", openAddUserModal);
  removeAndAddListener(saveUserButton, "click", saveUser);
  removeAndAddListener(saveSettingsButton, "click", saveSettings);
  removeAndAddListener(settingCurrencySelect, "change", updateCurrencySymbols);
  removeAndAddListener(reportTypeSelect, "change", handleReportTypeChange);
  removeAndAddListener(generateReportButton, "click", generateReport);
  removeAndAddListener(exportExcelButton, "click", exportToExcel);
  removeAndAddListener(exportDataButton, "click", exportData);
  removeAndAddListener(importDataButton, "click", handleImportClick);
  removeAndAddListener(importFileInput, "change", handleFileImport);
  removeAndAddListener(addMemberButton, "click", handleAddMemberClick);
  removeAndAddListener(
    resetTransactionSearchButton,
    "click",
    resetTransactionSearch
  );
}
function removeAndAddListener(element, event, handler) {
  if (element) {
    element.removeEventListener(event, handler);
    element.addEventListener(event, handler);
  }
}
function handleSidebarClick(e) {
  e.preventDefault();
  const pageId = e.currentTarget.getAttribute("data-page");
  switchPage(pageId);
}
function handleModalClose(e) {
  hideModal(e.currentTarget.closest(".modal").id);
}
function handleModalCloseFromButton(e) {
  hideModal(e.currentTarget.closest(".modal").id);
}
function handleModalBackgroundClick(e) {
  if (e.target === e.currentTarget) {
    hideModal(e.currentTarget.id);
  }
}
function handleReportTypeChange() {
  toggleCustomDateRange();
  generateReport();
}
function handleImportClick() {
  if (currentUser && currentUser.role === "admin") {
    importFileInput.click();
  } else {
    showAlert("Only admins can import.", "error");
  }
}
function handleFileImport(e) {
  if (currentUser && currentUser.role === "admin") {
    const file = e.target.files[0];
    if (file) {
      importData(file);
    }
    e.target.value = "";
  }
}
function handleAddMemberClick() {
  if (!currentUser || currentUser.role !== "admin") return;
  const clubName = clubMembersModal.dataset.currentClub;
  const memberName = addMemberNameInput.value.trim();
  const memberRole = addMemberRoleSelect.value;
  if (!clubName) {
    showAlert("Could not determine club.", "error");
    return;
  }
  if (!memberName) {
    showAlert("Please enter member name.", "error");
    return;
  }
  addClubMemberByName(clubName, memberName, memberRole);
}

function addClubMemberByName(clubName, memberName, memberRole) {
  const club = clubs.find((c) => c.name === clubName);
  if (!club) {
    showAlert("Club not found", "error");
    return;
  }
  // Prevent duplicate names in the same club
  if (club.members.some((m) => m.name === memberName)) {
    showAlert("Member already exists in this club.", "info");
    return;
  }
  club.members.push({ name: memberName, role: memberRole });
  renderClubMembers(club);
  // Also update Manage Users list to reflect new member
  renderSettingsUserList();
  addMemberNameInput.value = "";
  addMemberRoleSelect.value = "member";
  showAlert("Member added.", "success");
}

// --- Delegated Event Handler for Dynamic Buttons & Sort Headers ---
function handleDelegatedActions(event) {
  if (!currentUser) return;

  // Check for sortable header click first
  const headerTarget = event.target.closest(".sortable-header");
  if (headerTarget) {
    const sortBy = headerTarget.dataset.sortBy;
    if (sortBy) {
      // Toggle direction if clicking the same column, otherwise default to 'asc'
      if (sortBy === transactionSortColumn) {
        transactionSortDirection =
          transactionSortDirection === "asc" ? "desc" : "asc";
      } else {
        transactionSortColumn = sortBy;
        transactionSortDirection = "asc"; // Default to ascending on new column
      }
      renderTransactions(); // Re-render with new sort
    }
    return; // Stop processing if it was a header click
  }

  // Check for button clicks
  const buttonTarget = event.target.closest("button");
  if (!buttonTarget) return;

  const isAdmin = currentUser.role === "admin";
  const dataset = buttonTarget.dataset;

  // Admin Actions (Client-Side Check)
  if (isAdmin) {
    if (buttonTarget.classList.contains("edit-club-button") && dataset.club) {
      openEditClubModal(dataset.club);
    } else if (
      buttonTarget.classList.contains("delete-club-button") &&
      dataset.club
    ) {
      deleteClub(dataset.club);
    } else if (
      buttonTarget.classList.contains("manage-members-button") &&
      dataset.club
    ) {
      openManageMembersModal(dataset.club);
    } else if (
      buttonTarget.classList.contains("edit-transaction-button") &&
      dataset.id
    ) {
      openEditTransactionModal(parseInt(dataset.id));
    } else if (
      buttonTarget.classList.contains("delete-transaction-button") &&
      dataset.id
    ) {
      deleteTransaction(parseInt(dataset.id));
    } else if (
      buttonTarget.classList.contains("edit-user-button") &&
      dataset.id
    ) {
      openEditUserModal(parseInt(dataset.id));
    } else if (
      buttonTarget.classList.contains("delete-user-button") &&
      dataset.id
    ) {
      deleteUser(parseInt(dataset.id));
    } else if (
      buttonTarget.classList.contains("remove-member") &&
      dataset.club &&
      typeof dataset.memberIdx !== "undefined"
    ) {
      // Remove by index for both user-based and name-based members
      const club = clubs.find((c) => c.name === dataset.club);
      if (club) {
        const idx = parseInt(dataset.memberIdx);
        if (!isNaN(idx) && club.members[idx]) {
          // Remove the member at idx
          club.members.splice(idx, 1);
          renderClubMembers(club);
          renderSettingsUserList();
          showAlert("Member removed.", "success");
        }
      }
    } else if (
      buttonTarget.classList.contains("promote-member") &&
      dataset.club &&
      typeof dataset.memberIdx !== "undefined"
    ) {
      // Promote by index for both user-based and name-based members
      const club = clubs.find((c) => c.name === dataset.club);
      if (club) {
        const idx = parseInt(dataset.memberIdx);
        if (!isNaN(idx) && club.members[idx]) {
          // Demote current admin if any
          const currentAdminIdx = club.members.findIndex((m) => m.role === "admin");
          if (currentAdminIdx > -1) club.members[currentAdminIdx].role = "member";
          club.members[idx].role = "admin";
          club.clubAdmin = club.members[idx].userId || club.members[idx].name;
          renderClubMembers(club);
          showAlert("Member promoted.", "success");
        }
      }
    } else if (
      buttonTarget.classList.contains("depromote-member") &&
      dataset.club &&
      typeof dataset.memberIdx !== "undefined"
    ) {
      // Depromote admin to member by index
      const club = clubs.find((c) => c.name === dataset.club);
      if (club) {
        const idx = parseInt(dataset.memberIdx);
        if (!isNaN(idx) && club.members[idx] && club.members[idx].role === "admin") {
          club.members[idx].role = "member";
          club.clubAdmin = null;
          renderClubMembers(club);
          showAlert("Admin demoted to member.", "success");
        }
      }
    }
  } else {
    const requiresAdmin =
      buttonTarget.classList.contains("edit-club-button") ||
      buttonTarget.classList.contains("delete-club-button") ||
      buttonTarget.classList.contains("manage-members-button") ||
      buttonTarget.classList.contains("edit-transaction-button") ||
      buttonTarget.classList.contains("delete-transaction-button") ||
      buttonTarget.classList.contains("edit-user-button") ||
      buttonTarget.classList.contains("delete-user-button") ||
      buttonTarget.classList.contains("remove-member") ||
      buttonTarget.classList.contains("promote-member");
    if (requiresAdmin) {
      showAlert("Action requires administrator privileges.", "info");
    }
  }
}

// --- ENHANCED Search Functionality ---
function addSearchEventListeners() {
  // Debounced listener for text search
  if (transactionSearch) {
    transactionSearch.removeEventListener("input", handleDebouncedSearch); // Remove previous if any
    transactionSearch.addEventListener("input", handleDebouncedSearch);
  }

  // Listeners for other filters (trigger render immediately on change)
  const otherFilters = [
    transactionSearchClub,
    transactionSearchDateStart,
    transactionSearchDateEnd,
    transactionSearchAmountMin,
    transactionSearchAmountMax,
  ];
  otherFilters.forEach((input) => {
    if (input) {
      removeAndAddListener(input, "change", renderTransactions);
    }
  });

  // Reset Button
  if (resetTransactionSearchButton) {
    removeAndAddListener(
      resetTransactionSearchButton,
      "click",
      resetTransactionSearch
    );
  }
}

// Wrapper for debounced search handler
const handleDebouncedSearch = debounce(() => {
  renderTransactions();
}, 300); // 300ms delay

// ENHANCED Reset: Clears filters AND sorting state
function resetTransactionSearch() {
  transactionSearch.value = "";
  transactionSearchClub.value = "";
  transactionSearchDateStart.value = "";
  transactionSearchDateEnd.value = "";
  transactionSearchAmountMin.value = "";
  transactionSearchAmountMax.value = "";

  // Reset sorting to default
  transactionSortColumn = "date";
  transactionSortDirection = "desc";

  renderTransactions(); // Re-render with cleared filters and default sort
}

// --- Initial Load Trigger ---
// App initialization happens *after* successful login.
