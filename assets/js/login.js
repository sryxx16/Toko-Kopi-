const authStorageKey = "kopiAppAuth";
const userStorageKey = "kopiAppUsers";

function getUsers() {
  try {
    const raw = localStorage.getItem(userStorageKey);
    if (!raw) {
      const defaultUsers = [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "kasir", password: "kasir123", role: "kasir" },
      ];
      localStorage.setItem(userStorageKey, JSON.stringify(defaultUsers));
      return defaultUsers;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error("Gagal membaca data pengguna", error);
    return [];
  }
}

function setUsers(users) {
  localStorage.setItem(userStorageKey, JSON.stringify(users));
}

function findUser(username) {
  const users = getUsers();
  return users.find((user) => user.username.toLowerCase() === username.toLowerCase());
}

function getAuthState() {
  try {
    const raw = localStorage.getItem(authStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Gagal membaca auth state", error);
    return null;
  }
}

function setAuthState(role) {
  const auth = { role, loginAt: Date.now() };
  localStorage.setItem(authStorageKey, JSON.stringify(auth));
}

function clearAuthState() {
  localStorage.removeItem(authStorageKey);
}

function requireAuth(allowedRoles = []) {
  const auth = getAuthState();

  if (!auth || !allowedRoles.includes(auth.role)) {
    clearAuthState();
    window.location.replace("login.html");
    return false;
  }

  return true;
}

function redirectAfterLogin() {
  const auth = getAuthState();
  if (!auth) return;

  if (auth.role === "admin") {
    window.location.replace("admin.html");
    return;
  }

  if (auth.role === "kasir") {
    window.location.replace("order.html");
    return;
  }
}

function handleLogin() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("loginMessage");

  if (!usernameInput || !passwordInput || !message) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    message.textContent = "Username dan password wajib diisi.";
    message.style.color = "#dc2626";
    return;
  }

  const user = findUser(username);

  if (!user) {
    message.textContent = "Akun tidak ditemukan, silakan register terlebih dahulu.";
    message.style.color = "#dc2626";
    return;
  }

  if (user.password !== password) {
    message.textContent = "Password salah. Coba lagi.";
    message.style.color = "#dc2626";
    return;
  }

  const role = user.role;
  setAuthState(role);
  const target = role === "admin" ? "admin.html" : "order.html";

  message.textContent = `Berhasil login sebagai ${role}. Mengalihkan...`;
  message.style.color = "green";
  setTimeout(() => {
    window.location.replace(target);
  }, 500);
}

function handleRegister() {
  const usernameInput = document.getElementById("regUsername");
  const passwordInput = document.getElementById("regPassword");
  const roleInput = document.getElementById("regRole");
  const message = document.getElementById("registerMessage");

  if (!usernameInput || !passwordInput || !roleInput || !message) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const role = roleInput.value;

  if (!username || !password) {
    message.textContent = "Username dan password tidak boleh kosong.";
    message.style.color = "#dc2626";
    return;
  }

  if (findUser(username)) {
    message.textContent = "Username sudah terdaftar. Silakan login.";
    message.style.color = "#dc2626";
    return;
  }

  const users = getUsers();
  users.push({ username, password, role });
  setUsers(users);

  message.textContent = "Registrasi berhasil! Silakan login.";
  message.style.color = "green";
  usernameInput.value = "";
  passwordInput.value = "";

  setTimeout(() => {
    window.location.replace("login.html");
  }, 1300);
}

function logout() {
  clearAuthState();
  window.location.replace("login.html");
}

window.addEventListener("DOMContentLoaded", () => {
  redirectAfterLogin();
});
