let kopi = JSON.parse(localStorage.getItem("kopi")) || [
  { nama: "kapal api", harga: 5000, stok: 15 },
  { nama: "liong", harga: 7000, stok: 14 },
  { nama: "oplet", harga: 6000, stok: 20 },
];

kopi = kopi.map((item) => ({
  nama: item.nama || "",
  harga: item.harga || 0,
  stok: item.stok != null ? item.stok : 10,
}));

let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
let riwayatPesanan = JSON.parse(localStorage.getItem("riwayatPesanan")) || [];

function showToast(message, type = "success") {
  let toastArea = document.getElementById("toastArea");
  if (!toastArea) {
    toastArea = document.createElement("div");
    toastArea.id = "toastArea";
    toastArea.style.position = "fixed";
    toastArea.style.top = "1rem";
    toastArea.style.right = "1rem";
    toastArea.style.zIndex = "9999";
    toastArea.style.display = "flex";
    toastArea.style.flexDirection = "column";
    toastArea.style.gap = "0.5rem";
    document.body.appendChild(toastArea);
  }

  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.padding = "0.85rem 1rem";
  toast.style.borderRadius = "10px";
  toast.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.18)";
  toast.style.color = "#fff";
  toast.style.minWidth = "220px";
  toast.style.fontWeight = "600";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.2s ease, transform 0.2s ease";
  toast.style.transform = "translateY(-12px)";

  if (type === "error") {
    toast.style.background = "#ef4444";
  } else if (type === "primary") {
    toast.style.background = "#3730a3";
  } else {
    toast.style.background = "#10b981";
  }

  toastArea.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-12px)";
    setTimeout(() => toastArea.removeChild(toast), 250);
  }, 3500);
}

const authStorageKey = "kopiAppAuth";

function getAuthState() {
  try {
    const rawAuth = localStorage.getItem(authStorageKey);
    return rawAuth ? JSON.parse(rawAuth) : null;
  } catch (error) {
    console.error("Auth parsing error", error);
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
}
