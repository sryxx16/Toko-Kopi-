let kopi = JSON.parse(localStorage.getItem("kopi")) || [
  { nama: "kapal api", harga: 5000, stok: 15 },
  { nama: "liong", harga: 7000, stok: 14 },
  { nama: "oplet", harga: 6000, stok: 20 },
];
kopi = kopi.map((item) => ({ nama: item.nama || "", harga: item.harga || 0, stok: item.stok != null ? item.stok : 10 }));
let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
let riwayatPesanan = JSON.parse(localStorage.getItem("riwayatPesanan")) || [];

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

  if (riwayatPesanan.length === 0) {
    laporanTarget.style.display = "block";
    laporanContent.innerHTML = "<p>Belum ada transaksi.</p>";
    return;
  }

  laporanTarget.style.display = "block";
  let totalPendapatan = 0;
  let html = `<table><thead><tr><th>#</th><th>Tanggal</th><th>Item</th><th>Total</th></tr></thead><tbody>`;
  riwayatPesanan.forEach((entry, idx) => {
    const tgl = new Date(entry.date).toLocaleString("id-ID");
    const namaItem = entry.items.map((i) => `${i.nama} x${i.qty}`).join(", ");
    html += `<tr><td>${idx + 1}</td><td>${tgl}</td><td>${namaItem}</td><td>Rp ${entry.total.toLocaleString("id-ID")}</td></tr>`;
    totalPendapatan += entry.total;
  });
  html += `</tbody></table>`;
  html += `<div style="margin-top: 1rem; padding: 0.65rem; border-top: 2px solid #d1b79e; font-weight: 700;">Total Pendapatan: Rp ${totalPendapatan.toLocaleString("id-ID")}</div>`;
  laporanContent.innerHTML = html;
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
    alert("Menu tidak ditemukan.");
    return;
  }

  const current = kopi[index];
  const newName = prompt("Ubah nama menu:", current.nama);
  if (newName === null || newName.trim() === "") {
    alert("Nama menu tidak boleh kosong.");
    return;
  }

  const newPriceInput = prompt("Ubah harga menu:", current.harga);
  const newPrice = parseInt(newPriceInput, 10);
  if (isNaN(newPrice) || newPrice < 1000) {
    alert("Harga harus angka valid minimal Rp 1000.");
    return;
  }

  kopi[index].nama = newName.trim();
  kopi[index].harga = newPrice;
  simpanData();
  tampilanMenu();
  alert("Menu berhasil diperbarui.");
}

function tambahMenu() {
  const inputKopiEl = document.getElementById("menuBaru");
  const inputHargaEl = document.getElementById("hargaMenu");
  const inputStokEl = document.getElementById("stokMenu");

  if (!inputKopiEl || !inputHargaEl) {
    alert("Element input tidak ditemukan.");
    return;
  }

  const inputKopi = inputKopiEl.value.trim();
  const inputHarga = parseInt(inputHargaEl.value, 10);
  const inputStok = inputStokEl ? parseInt(inputStokEl.value, 10) : 10;

  if (!inputKopi) {
    alert("Nama menu tidak boleh kosong.");
    return;
  }

  if (Number.isNaN(inputHarga) || inputHarga < 1000) {
    alert("Harga menu harus angka dan minimal Rp 1000.");
    return;
  }

  if (Number.isNaN(inputStok) || inputStok < 1) {
    alert("Stok harus angka valid dan minimal 1.");
    return;
  }

  kopi.push({ nama: inputKopi, harga: inputHarga, stok: inputStok });

  tampilanMenu();
  simpanData();

  inputKopiEl.value = "";
  inputHargaEl.value = "";
  if (inputStokEl) inputStokEl.value = "";

  alert("Menu baru berhasil ditambahkan.");
}

function hapusMenu() {
  let nomor = document.getElementById("hapus").value;
  let index = parseInt(nomor) - 1;

  if (index >= 0 && index < kopi.length) {
    kopi.splice(index, 1);
    document.getElementById("hasil").innerHTML;
    tampilanMenu();
    simpanData();
    document.getElementById("hapus").value;
  } else alert("menu tidak ada");
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
      <tr><td colspan="5" style="text-align:center; padding: 1rem;">Keranjang kosong</td></tr>
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
    alert("Nomor menu tidak valid.");
    return;
  }

  const menuDipilih = kopi[index];
  if (menuDipilih.stok <= 0) {
    alert("Maaf, stok menu ini sudah habis.");
    return;
  }

  const itemDitemukan = keranjang.find((item) => item.nama === menuDipilih.nama);

  if (itemDitemukan) {
    if (itemDitemukan.qty + 1 > menuDipilih.stok) {
      alert("Stok tidak cukup untuk menambah lagi.");
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
    alert("Keranjang kosong. Tambahkan pesanan terlebih dahulu.");
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
      alert(`Stok untuk ${orderItem.nama} tidak cukup. Transaksi dibatalkan.`);
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
    alert("Pesanan berhasil.");
  }, 500);
}


