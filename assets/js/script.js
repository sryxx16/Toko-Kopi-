let kopi = JSON.parse(localStorage.getItem("kopi")) || [
  { nama: "kapal api", harga: 5000, stok: 15 },
  { nama: "liong", harga: 7000, stok: 14 },
  { nama: "oplet", harga: 6000, stok: 20 },
];
kopi = kopi.map((item) => ({ nama: item.nama || "", harga: item.harga || 0, stok: item.stok != null ? item.stok : 10 }));
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

function showLaporan() {
  const laporanTarget = document.getElementById("laporanArea");
  const laporanContent = document.getElementById("laporanContent");
  if (!laporanTarget || !laporanContent) return;

  laporanTarget.classList.remove("hidden");

  if (riwayatPesanan.length === 0) {
    laporanContent.innerHTML = `<p class="text-sm text-slate-600">Belum ada transaksi.</p>`;
    return;
  }

  let totalPendapatan = 0;
  let html = `
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm divide-y divide-slate-200">
        <thead class="bg-slate-100 text-slate-600">
          <tr>
            <th class="px-3 py-2 text-left">#</th>
            <th class="px-3 py-2 text-left">Tanggal</th>
            <th class="px-3 py-2 text-left">Item</th>
            <th class="px-3 py-2 text-left">Total</th>
          </tr>
        </thead>
        <tbody class="text-slate-700">
  `;

  riwayatPesanan.forEach((entry, idx) => {
    const tgl = new Date(entry.date).toLocaleString("id-ID");
    const namaItem = entry.items.map((i) => `${i.nama} x${i.qty}`).join(", ");
    html += `
      <tr class="hover:bg-slate-50">
        <td class="px-3 py-2">${idx + 1}</td>
        <td class="px-3 py-2">${tgl}</td>
        <td class="px-3 py-2">${namaItem}</td>
        <td class="px-3 py-2">Rp ${entry.total.toLocaleString("id-ID")}</td>
      </tr>
    `;
    totalPendapatan += entry.total;
  });

  html += `
        </tbody>
      </table>
    </div>
    <div class="mt-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold">
      Total Pendapatan: Rp ${totalPendapatan.toLocaleString("id-ID")}
    </div>
  `;

  laporanContent.innerHTML = html;
}

function toggleLaporan() {
  const laporanTarget = document.getElementById("laporanArea");
  const laporanBtn = document.getElementById("laporanBtn");
  if (!laporanTarget || !laporanBtn) return;

  const isHidden = laporanTarget.classList.contains("hidden");

  if (isHidden) {
    showLaporan();
    laporanBtn.textContent = "Tutup Laporan";
  } else {
    laporanTarget.classList.add("hidden");
    laporanBtn.textContent = "Lihat Laporan";
  }
}

function initAdminPage() {
  if (!requireAuth(["admin"])) return;
  tampilanMenu();
}

function initKasirPage() {
  if (!requireAuth(["kasir"])) return;
  tampilanMenu();
  tampilanOrderan();
}

function simpanData() {
  localStorage.setItem("kopi", JSON.stringify(kopi));
  localStorage.setItem("keranjang", JSON.stringify(keranjang));
  localStorage.setItem("riwayatPesanan", JSON.stringify(riwayatPesanan));
}
const tampilanMenu = () => {
  const hasil = document.getElementById("hasil");
  const harga = document.getElementById("harga");

  if (!hasil) return;

  let output = "";
  let totalHarga = 0;

  kopi.forEach((item, index) => {
    output += `
    <tr>
      <td>${index + 1}</td>
      <td>${item.nama}</td>
      <td>Rp ${item.harga.toLocaleString("id-ID")}</td>
      <td>${item.stok}</td>
      <td><button class="btn-edit" onclick="editMenu(${index})">Edit</button></td>
    </tr>
    `;
    totalHarga += item.harga;
  });

  hasil.innerHTML = output;
  if (harga) {
    harga.innerHTML = `Total Harga Semua Menu: Rp ${totalHarga.toLocaleString("id-ID")}`;
  }
};

function editMenu(index) {
  if (index < 0 || index >= kopi.length) {
    showToast("Menu tidak ditemukan.", "error");
    return;
  }

  const current = kopi[index];
  const newName = prompt("Ubah nama menu:", current.nama);
  if (newName === null || newName.trim() === "") {
    showToast("Nama menu tidak boleh kosong.", "error");
    return;
  }

  const newPriceInput = prompt("Ubah harga menu:", current.harga);
  const newPrice = parseInt(newPriceInput, 10);
  if (isNaN(newPrice) || newPrice < 1000) {
    showToast("Harga harus angka valid minimal Rp 1000.", "error");
    return;
  }

  kopi[index].nama = newName.trim();
  kopi[index].harga = newPrice;
  simpanData();
  tampilanMenu();
  showToast("Menu berhasil diperbarui.", "success");
}

function tambahMenu() {
  const inputKopiEl = document.getElementById("menuBaru");
  const inputHargaEl = document.getElementById("hargaMenu");
  const inputStokEl = document.getElementById("stokMenu");

  if (!inputKopiEl || !inputHargaEl) {
    showToast("Element input tidak ditemukan.", "error");
    return;
  }

  const inputKopi = inputKopiEl.value.trim();
  const inputHarga = parseInt(inputHargaEl.value, 10);
  const inputStok = inputStokEl ? parseInt(inputStokEl.value, 10) : 10;

  if (!inputKopi) {
    showToast("Nama menu tidak boleh kosong.", "error");
    return;
  }

  if (Number.isNaN(inputHarga) || inputHarga < 1000) {
    showToast("Harga menu harus angka dan minimal Rp 1000.", "error");
    return;
  }

  if (Number.isNaN(inputStok) || inputStok < 1) {
    showToast("Stok harus angka valid dan minimal 1.", "error");
    return;
  }

  kopi.push({ nama: inputKopi, harga: inputHarga, stok: inputStok });

  tampilanMenu();
  simpanData();

  inputKopiEl.value = "";
  inputHargaEl.value = "";
  if (inputStokEl) inputStokEl.value = "";

  showToast("Menu baru berhasil ditambahkan.", "success");
}

function hapusMenu() {
  let nomor = document.getElementById("hapus").value;
  let index = parseInt(nomor) - 1;

  if (index >= 0 && index < kopi.length) {
    kopi.splice(index, 1);
    document.getElementById("hasil").innerHTML;
    tampilanMenu();
    simpanData();
    document.getElementById("hapus").value = "";
    showToast("Menu berhasil dihapus", "success");
  } else {
    showToast("Menu tidak ada", "error");
  }
}

const tampilanOrderan = () => {
  const hasilOr = document.getElementById("hasilOrder");
  if (!hasilOr) return;

  let output = "";
  keranjang.forEach((item, index) => {
    let subTotal = item.harga * item.qty;
    output += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nama}</td>
        <td>Rp ${item.harga.toLocaleString("id-ID")}</td>
        <td>
          <button onclick="kurangQty(${index})">-</button>
          ${item.qty}
          <button onclick="tambahQty(${index})">+</button>
        </td>
        <td>Rp ${subTotal.toLocaleString("id-ID")}</td>
      </tr>
    `;
  });

  const totalBayar = keranjang.reduce((acc, item) => acc + item.harga * item.qty, 0);

  if (keranjang.length === 0) {
    output = `
      <tr><td colspan="5" style="text-align:center; padding: 2rem; color: #475569;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:0.6rem;">
          <div style="font-size:2rem;">🛒</div>
          <div style="font-weight:700;">Belum ada pesanan</div>
          <div style="font-size:0.94rem;">Tambahkan menu dari daftar di sisi kiri.</div>
        </div>
      </td></tr>
    `;
  } else {
    output += `
      <tr style="font-weight: bold; background-color: #f2f2f2;">
        <td colspan="4" style="text-align: center;">TOTAL BAYAR</td>
        <td>Rp ${totalBayar.toLocaleString("id-ID")}</td>
      </tr>
    `;
  }

  hasilOr.innerHTML = output;

  const totalBayarEl = document.getElementById("totalBayar");
  if (totalBayarEl) {
    totalBayarEl.textContent = `Rp ${totalBayar.toLocaleString("id-ID")}`;
  }
};

function tambahOrderan() {
  const nomorMenu = document.getElementById("tambahOrder").value;
  const index = parseInt(nomorMenu, 10) - 1;

  if (Number.isNaN(index) || index < 0 || index >= kopi.length) {
    showToast("Nomor menu tidak valid.", "error");
    return;
  }

  const menuDipilih = kopi[index];
  if (menuDipilih.stok <= 0) {
    showToast("Maaf, stok menu ini sudah habis.", "error");
    return;
  }

  const itemDitemukan = keranjang.find((item) => item.nama === menuDipilih.nama);

  if (itemDitemukan) {
    if (itemDitemukan.qty + 1 > menuDipilih.stok) {
      showToast("Stok tidak cukup untuk menambah lagi.", "error");
      return;
    }
    itemDitemukan.qty += 1;
  } else {
    keranjang.push({ nama: menuDipilih.nama, harga: menuDipilih.harga, qty: 1 });
  }

  tampilanOrderan();
  simpanData();
  document.getElementById("tambahOrder").value = "";
}


function hapusOrderan() {
  let nomorMenu = document.getElementById("hapusOrder").value;
  let index = parseInt(nomorMenu) - 1;

  if (index >= 0 && index < keranjang.length) {
    keranjang.splice(index, 1);
    document.getElementById("hasilOrder").innerHTML = "";
    tampilanOrderan();
    simpanData();
    document.getElementById("hapusOrder").value = "";
  } else {
    ("data yang anda masukan salah");
  }
}

const kurangQty = (index) => {
  if (keranjang[index]) {
    if (keranjang[index].qty > 1) {
      keranjang[index].qty -= 1;
    } else {
      keranjang.splice(index, 1);
    }
    tampilanOrderan();
    simpanData();
  }
};

const tambahQty = (index) => {
  if (keranjang[index]) {
    keranjang[index].qty += 1;
    tampilanOrderan();
    simpanData();
  }
};

function selesaikanPembayaran() {
  if (keranjang.length === 0) {
    showToast("Keranjang kosong. Tambahkan pesanan terlebih dahulu.", "error");
    return;
  }

  if (!confirm("Apakah pesanan sudah benar?")) {
    return;
  }

  const totalBayar = keranjang.reduce((acc, item) => acc + item.harga * item.qty, 0);
  const now = new Date();
  const auth = getAuthState();
  const aktor = auth?.role ? auth.role.toUpperCase() : "GUEST";

  // Update stok masing-masing menu
  for (let orderItem of keranjang) {
    const menuIndex = kopi.findIndex((item) => item.nama === orderItem.nama);
    if (menuIndex < 0) continue;
    if (kopi[menuIndex].stok >= orderItem.qty) {
      kopi[menuIndex].stok -= orderItem.qty;
    } else {
      showToast(`Stok untuk ${orderItem.nama} tidak cukup. Transaksi dibatalkan.`, "error");
      return;
    }
  }

  const transaksi = {
    date: now.toISOString(),
    items: [...keranjang],
    total: totalBayar,
    kasir: aktor,
  };

  riwayatPesanan.push(transaksi);
  keranjang = [];
  simpanData();
  tampilanOrderan();
  tampilanMenu();

  const strukArea = document.getElementById("strukArea");
  if (!strukArea) return;

  const strukRows = transaksi.items
    .map((item) =>
      `
      <div class="struk-row">
        <span>${item.nama}</span>
        <span>${item.qty} x Rp ${item.harga.toLocaleString("id-ID")}</span>
        <span>Rp ${(item.harga * item.qty).toLocaleString("id-ID")}</span>
      </div>
      <div class="struk-separator">---------------------------------------------</div>
    `,
    )
    .join("");

  strukArea.innerHTML = `
    <div class="struk-wrapper" style="width:80mm; max-width:100%; margin:0 auto; font-family:'Courier New', monospace; font-size:13px;">
      <div style="text-align:center; font-weight:bold; font-size:1.1rem; margin-bottom:0.5rem;">KopiKita</div>
      <div style="text-align:center; margin-bottom:0.5rem;">Barista: ${aktor}</div>
      <div style="text-align:center; margin-bottom:0.5rem;">${now.toLocaleString("id-ID")}</div>
      <div class="struk-separator">=================================</div>
      ${strukRows}
      <div class="struk-separator">=================================</div>
      <div style="text-align:right; font-weight:bold;">TOTAL: Rp ${totalBayar.toLocaleString("id-ID")}</div>
    </div>
  `;

  window.print();
  setTimeout(() => {
    showToast("Pesanan berhasil.", "success");
  }, 500);
}


