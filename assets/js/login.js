const authStorageKey = "kopiAppAuth";
const userStorageKey = "kopiAppUsers";

// --- ENKRIPSI SEDERHANA ---
function encodePassword(raw) {
  try {
    return btoa(raw);
  } catch {
    return raw;
  }
}

function decodePassword(encoded) {
  try {
    return atob(encoded);
  } catch {
    return encoded;
  }
}

// --- MANAGEMENT USER ---
function getUsers() {
  try {
    const raw = localStorage.getItem(userStorageKey);
    let users;
    if (!raw) {
      users = [
        { username: "admin", password: encodePassword("admin123"), role: "admin" },
        { username: "kasir", password: encodePassword("kasir123"), role: "kasir" },
      ];
      localStorage.setItem(userStorageKey, JSON.stringify(users));
      return users;
    }

    users = JSON.parse(raw);
    if (!Array.isArray(users)) {
      users = [];
    }

    const hasAdmin = users.some((user) => user.username?.toLowerCase() === "admin");
    const hasKasir = users.some((user) => user.username?.toLowerCase() === "kasir");

    if (!hasAdmin || !hasKasir) {
      const defaults = [
        { username: "admin", password: encodePassword("admin123"), role: "admin" },
        { username: "kasir", password: encodePassword("kasir123"), role: "kasir" },
      ];
      users = [
        ...users.filter((u) => u.username && u.role),
        ...(hasAdmin ? [] : [defaults[0]]),
        ...(hasKasir ? [] : [defaults[1]]),
      ];
      localStorage.setItem(userStorageKey, JSON.stringify(users));
    }

    return users;
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
  return users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase(),
  );
}

// --- AUTH STATE ---
function getAuthState() {
  try {
    const raw = localStorage.getItem(authStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
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

// --- REDIRECTION ---
function redirectAfterLogin() {
  const auth = getAuthState();
  if (!auth) return;

  // Cek jika sedang di halaman login, baru redirect
  if (window.location.pathname.includes("login.html")) {
    const target = auth.role === "admin" ? "admin.html" : "order.html";
    window.location.replace(target);
  }
}

// --- CORE FUNCTIONS ---
function handleLogin() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("loginMessage");

  if (!usernameInput || !passwordInput || !message) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  // 1. Validasi Input Kosong
  if (!username || !password) {
    message.textContent = "Username dan password wajib diisi.";
    message.style.color = "#dc2626";
    return;
  }

  // 2. Cari User
  const user = findUser(username);
  if (!user) {
    message.textContent = "Akun tidak ditemukan.";
    message.style.color = "#dc2626";
    return;
  }

  // 3. Cek Password (Decode dulu data dari storage)
  const decodedPassword = decodePassword(user.password);
  const isPasswordValid = decodedPassword === password || user.password === password;

  if (!isPasswordValid) {
    message.textContent = "Password salah. Coba lagi.";
    message.style.color = "#dc2626";
    return;
  }

  // Jika password belum dalam encoding Base64, simpan kembali dengan enkripsi agar konsisten
  if (user.password !== encodePassword(password)) {
    const users = getUsers().map((u) =>
      u.username.toLowerCase() === user.username.toLowerCase()
        ? { ...u, password: encodePassword(password) }
        : u,
    );
    setUsers(users);
  }

  // 4. Berhasil Login
  setAuthState(user.role);
  message.textContent = `Berhasil login sebagai ${user.role}. Mengalihkan...`;
  message.style.color = "green";

  setTimeout(() => {
    window.location.replace(
      user.role === "admin" ? "admin.html" : "order.html",
    );
  }, 800);
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

  // Keamanan: Hanya admin yang bisa daftar (Opsional: Matikan jika ingin bebas daftar)
  const currentAuth = getAuthState();
  if (!currentAuth || currentAuth.role !== "admin") {
    message.textContent = "Hanya admin yang dapat mendaftarkan user baru.";
    message.style.color = "#dc2626";
    return;
  }

  if (password.length < 8) {
    message.textContent = "Password minimal 8 karakter.";
    message.style.color = "#dc2626";
    return;
  }

  if (findUser(username)) {
    message.textContent = "Username sudah terdaftar.";
    message.style.color = "#dc2626";
    return;
  }

  const users = getUsers();
  users.push({
    username,
    password: encodePassword(password),
    role,
  });
  setUsers(users);

  message.textContent = "Registrasi berhasil!";
  message.style.color = "green";

  setTimeout(() => {
    window.location.reload(); // Refresh halaman setelah daftar
  }, 1000);
}

function logout() {
  clearAuthState();
  window.location.replace("login.html");
}

// Jalankan pengecekan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  getUsers(); // Pastikan data dummy terbuat
  redirectAfterLogin();
});
