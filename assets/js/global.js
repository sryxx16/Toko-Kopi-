// --- STATE DATA ---
let users = JSON.parse(localStorage.getItem("users")) || [
  { id: 1, username: "admin", password: "123", role: "admin" },
  { id: 2, username: "kasir", password: "123", role: "kasir" },
];

let kopi = JSON.parse(localStorage.getItem("kopi")) || [
  { nama: "kapal api", harga: 5000, stok: 15, kategori: "kopi" },
  { nama: "liong", harga: 7000, stok: 14, kategori: "kopi" },
  { nama: "oplet", harga: 6000, stok: 20, kategori: "kopi" },
];

kopi = kopi.map((item) => ({
  nama: item.nama || "",
  harga: item.harga || 0,
  stok: item.stok != null ? item.stok : 10,
  kategori: item.kategori || "kopi",
}));

let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
let riwayatPesanan = JSON.parse(localStorage.getItem("riwayatPesanan")) || [];

// --- FUNGSI TOAST ---
function showToast(message, type = "success") {
  let toastArea = document.getElementById("toastArea");
  if (!toastArea) {
    toastArea = document.createElement("div");
    toastArea.id = "toastArea";
    toastArea.className = "fixed top-4 right-4 z-[9999] flex flex-col gap-2";
    document.body.appendChild(toastArea);
  }

  const toast = document.createElement("div");

  // Kasih ikon di dalam toast
  let iconHtml =
    type === "error"
      ? '<i class="ph-fill ph-warning-circle text-xl"></i>'
      : '<i class="ph-fill ph-check-circle text-xl"></i>';

  toast.innerHTML = `<div class="flex items-center gap-2">${iconHtml} <span>${message}</span></div>`;
  toast.className = `px-4 py-3 rounded-xl shadow-lg text-white font-semibold min-w-[250px] transform transition-all duration-300 opacity-0 -translate-y-4 ${type === "error" ? "bg-rose-500" : "bg-emerald-500"}`;

  toastArea.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("opacity-0", "-translate-y-4");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "-translate-y-4");
    setTimeout(() => toastArea.removeChild(toast), 300);
  }, 3000);
}

// --- FUNGSI AUTENTIKASI ---
const authStorageKey = "kopiAppAuth";

function getAuthState() {
  try {
    const rawAuth = localStorage.getItem(authStorageKey);
    return rawAuth ? JSON.parse(rawAuth) : null;
  } catch (error) {
    return null;
  }
}

function requireAuth(allowedRoles = []) {
  const auth = getAuthState();
  if (!auth || !allowedRoles.includes(auth.role)) {
    localStorage.removeItem(authStorageKey);
    window.location.replace("login.html");
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem(authStorageKey);
  window.location.replace("login.html");
}

function simpanData() {
  localStorage.setItem("kopi", JSON.stringify(kopi));
  localStorage.setItem("keranjang", JSON.stringify(keranjang));
  localStorage.setItem("riwayatPesanan", JSON.stringify(riwayatPesanan));
  localStorage.setItem("users", JSON.stringify(users));
}

// --- FITUR DARK MODE DENGAN ICON UPDATE ---
function updateThemeIcon() {
  const icon = document.getElementById("themeIcon");
  if (!icon) return;
  if (document.documentElement.classList.contains("dark")) {
    icon.className = "ph-fill ph-sun text-xl text-amber-500"; // Ikon Matahari kuning
  } else {
    icon.className = "ph-fill ph-moon text-xl text-indigo-500"; // Ikon Bulan ungu
  }
}

function initTheme() {
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  // Kasih delay dikit biar DOM ke-load sebelum ganti icon
  setTimeout(updateThemeIcon, 100);
}

function toggleDarkMode() {
  if (document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.remove("dark");
    localStorage.theme = "light";
  } else {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
  }
  updateThemeIcon();
}

initTheme();
