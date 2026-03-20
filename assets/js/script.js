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

function showLaporan() {
  const laporanTarget = document.getElementById("laporanArea");
  const laporanContent = document.getElementById("laporanContent");
  if (!laporanTarget || !laporanContent) return;

  laporanTarget.classList.remove("hidden");

  if (riwayatPesanan.length === 0) {
    laporanContent.innerHTML = `<p class="text-sm text-slate-600">Belum ada transaksi.</p>`;
    return;
  }

  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  let totalPendapatan = 0;
  let totalPendapatanHariIni = 0;
  let totalTransaksi = riwayatPesanan.length;
  const salesCount = {};

  const laporanPerTanggal = {};

  riwayatPesanan.forEach((entry) => {
    totalPendapatan += entry.totalBayar || 0;
    const entryDate = new Date(entry.date);

    const tglKey = entryDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    if (isSameDay(entryDate, today)) {
      totalPendapatanHariIni += entry.totalBayar || 0;
    }

    (entry.items || []).forEach((i) => {
      if (!salesCount[i.nama]) salesCount[i.nama] = 0;
      salesCount[i.nama] += i.qty;
    });

    if (!laporanPerTanggal[tglKey]) {
      laporanPerTanggal[tglKey] = { totalBayar: 0, jumlahTransaksi: 0 };
    }
    laporanPerTanggal[tglKey].totalBayar += entry.totalBayar || 0;
    laporanPerTanggal[tglKey].jumlahTransaksi += 1;
  });

  let bestSeller = "-";
  let bestSellerCount = 0;
  Object.entries(salesCount).forEach(([nama, jumlah]) => {
    if (jumlah > bestSellerCount) {
      bestSellerCount = jumlah;
      bestSeller = `${nama} (${jumlah} cup)`;
    }
  });

  // --- RENDER WIDGET ATAS ---
  let html = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="text-sm text-slate-500">Total Pendapatan Hari Ini</div>
        <div class="text-xl font-bold text-emerald-600">Rp ${totalPendapatanHariIni.toLocaleString("id-ID")}</div>
      </div>
      <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="text-sm text-slate-500">Menu Paling Laku</div>
        <div class="text-xl font-bold text-slate-700">${bestSeller}</div>
      </div>
      <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="text-sm text-slate-500">Total Transaksi Berhasil</div>
        <div class="text-xl font-bold text-slate-700">${totalTransaksi}</div>
      </div>
    </div>
  `;

  // --- RENDER TABEL REKAP HARIAN (Dengan Tombol Detail) ---
  html += `<h3 class="font-bold text-lg mb-3 text-slate-800">📅 Rekap Pendapatan Harian</h3>`;
  html += `
    <div class="overflow-x-auto mb-6">
      <table class="min-w-full text-sm divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
        <thead class="bg-indigo-50 text-indigo-800">
          <tr>
            <th class="px-3 py-2 text-left font-semibold">Tanggal</th>
            <th class="px-3 py-2 text-center font-semibold">Jml Transaksi</th>
            <th class="px-3 py-2 text-right font-semibold">Total Pendapatan</th>
            <th class="px-3 py-2 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody class="text-slate-700 bg-white divide-y divide-slate-100">
  `;

  Object.keys(laporanPerTanggal).forEach((tgl) => {
    const dataHarian = laporanPerTanggal[tgl];
    html += `
      <tr class="hover:bg-slate-50">
        <td class="px-3 py-3 font-medium text-slate-800">${tgl}</td>
        <td class="px-3 py-3 text-center">${dataHarian.jumlahTransaksi}</td>
        <td class="px-3 py-3 text-right font-bold text-emerald-600">Rp ${dataHarian.totalBayar.toLocaleString("id-ID")}</td>
        <td class="px-3 py-3 text-center">
          <button onclick="lihatDetailTanggal('${tgl}')" class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-semibold transition">Lihat Detail</button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  // --- AREA UNTUK MENAMPILKAN DETAIL (Awalnya Kosong) ---
  html += `<div id="detailHarianArea" class="mt-6 border-t border-slate-200 pt-6">
             <p class="text-slate-500 text-center italic py-4">Klik tombol "Lihat Detail" pada tabel di atas untuk melihat rincian item yang terjual.</p>
           </div>`;

  // --- TOTAL KESELURUHAN ---
  html += `
    <div class="mt-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold flex flex-wrap justify-between items-center shadow-sm">
      <span class="text-lg">Total Seluruh Pendapatan (All Time):</span>
      <span class="text-2xl">Rp ${totalPendapatan.toLocaleString("id-ID")}</span>
    </div>
  `;

  laporanContent.innerHTML = html;
}

function lihatDetailTanggal(tglDicari) {
  const detailArea = document.getElementById("detailHarianArea");
  if (!detailArea) return;

  // Filter hanya transaksi yang tanggalnya sama dengan tombol yang diklik
  const transaksiHariIni = riwayatPesanan.filter((entry) => {
    const entryDate = new Date(entry.date);
    const tglKey = entryDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return tglKey === tglDicari;
  });

  if (transaksiHariIni.length === 0) {
    detailArea.innerHTML = `<p class="text-rose-500 text-center italic py-4">Tidak ada data untuk tanggal ini.</p>`;
    return;
  }

  // Buat HTML untuk tabel rincian
  let html = `<div class="flex justify-between items-center mb-3">
                <h3 class="font-bold text-lg text-slate-800">📋 Rincian Transaksi: <span class="text-indigo-600">${tglDicari}</span></h3>
              </div>`;

  html += `
    <div class="overflow-x-auto mb-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <table class="min-w-full text-sm divide-y divide-slate-200">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th class="px-3 py-3 text-left font-semibold">Jam</th>
            <th class="px-3 py-3 text-left font-semibold">Kasir</th>
            <th class="px-3 py-3 text-left font-semibold">Item Terjual</th>
            <th class="px-3 py-3 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody class="text-slate-700 divide-y divide-slate-100">
  `;

  // Tampilkan urut dari yang paling baru
  [...transaksiHariIni].reverse().forEach((entry) => {
    const jamWaktu = new Date(entry.date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const namaItem = (entry.items || [])
      .map((i) => `${i.nama} <span class="text-slate-400">(x${i.qty})</span>`)
      .join("<br>");
    const namaKasir = entry.kasir || "-";

    html += `
      <tr class="hover:bg-slate-50">
        <td class="px-3 py-3 whitespace-nowrap align-top font-medium">${jamWaktu}</td>
        <td class="px-3 py-3 whitespace-nowrap align-top text-xs text-slate-500 mt-1">${namaKasir}</td>
        <td class="px-3 py-3 align-top leading-relaxed">${namaItem}</td>
        <td class="px-3 py-3 align-top text-right font-medium text-emerald-600">Rp ${(entry.totalBayar || 0).toLocaleString("id-ID")}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  detailArea.innerHTML = html;

  // Efek scroll mulus ke bawah agar user langsung melihat tabel rinciannya
  detailArea.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // Cek apakah saat ini sedang di halaman kasir (order.html)
  const isKasir = window.location.pathname.includes("order.html");

  let output = "";
  let totalHarga = 0;

  kopi.forEach((item, index) => {
    if (isKasir) {
      // Tampilan Kasir: Nampilin Stok dari Admin
      const isHabis = item.stok <= 0;

      output += `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="px-3 py-3">${index + 1}</td>
        <td class="px-3 py-3 font-medium text-slate-800">${item.nama}</td>
        <td class="px-3 py-3 text-emerald-600 font-medium">Rp ${item.harga.toLocaleString("id-ID")}</td>
        
        <td class="px-3 py-3 text-center font-bold ${isHabis ? "text-rose-500" : "text-slate-700"}">
          ${isHabis ? "Habis" : item.stok}
        </td>
        
        <td class="px-3 py-3 text-center">
          <button onclick="tambahOrderanIndex(${index})" class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed" ${isHabis ? "disabled" : ""}>
            + Tambah
          </button>
        </td>
      </tr>
      `;
    } else {
      // Tampilan untuk Admin (Lengkap dengan Stok dan Edit)
      output += `
      <tr>
        <td class="px-3 py-2">${index + 1}</td>
        <td class="px-3 py-2">${item.nama}</td>
        <td class="px-3 py-2">Rp ${item.harga.toLocaleString("id-ID")}</td>
        <td class="px-3 py-2">${item.stok}</td>
        <td class="px-3 py-2">
          <button class="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs transition" onclick="editMenu(${index})">Edit</button>
        </td>
      </tr>
      `;
    }
    totalHarga += item.harga;
  });

  hasil.innerHTML = output;
  if (harga && !isKasir) {
    harga.innerHTML = `Total Harga Semua Menu: Rp ${totalHarga.toLocaleString("id-ID")}`;
  }
};
let editCurrentIndex = -1;

function editMenu(index) {
  if (index < 0 || index >= kopi.length) {
    showToast("Menu tidak ditemukan.", "error");
    return;
  }

  const current = kopi[index];
  editCurrentIndex = index; // Simpan index-nya

  // Isi nilai saat ini ke dalam form input di Modal
  document.getElementById("editNama").value = current.nama;
  document.getElementById("editHarga").value = current.harga;
  document.getElementById("editStok").value = current.stok;

  // Tampilkan Modal
  document.getElementById("editModal").classList.remove("hidden");
}

function tutupModalEdit() {
  // Sembunyikan Modal dan reset index
  document.getElementById("editModal").classList.add("hidden");
  editCurrentIndex = -1;
}

function simpanEditMenu() {
  if (editCurrentIndex === -1) return;

  // Ambil nilai baru dari input Modal
  const newName = document.getElementById("editNama").value.trim();
  const newPrice = parseInt(document.getElementById("editHarga").value, 10);
  const newStok = parseInt(document.getElementById("editStok").value, 10);

  // Validasi data
  if (!newName) {
    showToast("Nama menu tidak boleh kosong.", "error");
    return;
  }
  if (isNaN(newPrice) || newPrice < 1000) {
    showToast("Harga harus angka valid minimal Rp 1000.", "error");
    return;
  }
  if (isNaN(newStok) || newStok < 0) {
    showToast("Stok tidak valid (minimal 0).", "error");
    return;
  }

  // Simpan data baru ke array kopi
  kopi[editCurrentIndex].nama = newName;
  kopi[editCurrentIndex].harga = newPrice;
  kopi[editCurrentIndex].stok = newStok;

  // Render ulang UI dan tutup modal
  simpanData();
  tampilanMenu();
  tutupModalEdit();
  showToast("Perubahan berhasil disimpan.", "success");
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
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="px-3 py-3">${index + 1}</td>
        <td class="px-3 py-3 font-medium text-slate-800">${item.nama}</td>
        <td class="px-3 py-3 text-slate-600">Rp ${item.harga.toLocaleString("id-ID")}</td>
        <td class="px-3 py-3">
          <div class="flex items-center gap-2">
            <button onclick="kurangQty(${index})" class="w-6 h-6 rounded bg-rose-100 text-rose-600 font-bold hover:bg-rose-200">-</button>
            <span class="w-4 text-center font-semibold">${item.qty}</span>
            <button onclick="tambahQty(${index})" class="w-6 h-6 rounded bg-emerald-100 text-emerald-600 font-bold hover:bg-emerald-200">+</button>
          </div>
        </td>
        <td class="px-3 py-3 font-bold text-emerald-600">Rp ${subTotal.toLocaleString("id-ID")}</td>
        <td class="px-3 py-3 text-center">
          <button onclick="hapusDariKeranjang(${index})" class="text-rose-500 hover:text-rose-700 transition" title="Hapus Item">🗑️</button>
        </td>
      </tr>
    `;
  });

  const totalBayar = keranjang.reduce(
    (acc, item) => acc + item.harga * item.qty,
    0,
  );

  if (keranjang.length === 0) {
    output = `
      <tr><td colspan="6" style="text-align:center; padding: 2rem; color: #475569;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:0.6rem;">
          <div style="font-size:2rem;">🛒</div>
          <div style="font-weight:700;">Belum ada pesanan</div>
          <div style="font-size:0.94rem;">Pilih menu dari daftar di sisi kiri.</div>
        </div>
      </td></tr>
    `;
  }

  hasilOr.innerHTML = output;

  const totalBayarEl = document.getElementById("totalBayar");
  if (totalBayarEl) {
    totalBayarEl.textContent = `Rp ${totalBayar.toLocaleString("id-ID")}`;
  }
};

// Tambahkan fungsi baru ini untuk tombol 🗑️
function hapusDariKeranjang(index) {
  if (confirm(`Hapus ${keranjang[index].nama} dari pesanan?`)) {
    keranjang.splice(index, 1);
    tampilanOrderan();
    simpanData();
    updateKembalian(); // Update kembalian otomatis kalau item dihapus
    showToast("Item dihapus dari pesanan", "success");
  }
}

function updateKembalian() {
  const totalBayar = keranjang.reduce(
    (acc, item) => acc + item.harga * item.qty,
    0,
  );
  const uangDiterimaEl = document.getElementById("uangDiterima");
  const kembalianEl = document.getElementById("kembalianVal");

  if (!uangDiterimaEl || !kembalianEl) return;

  const uangDiterima = Number(uangDiterimaEl.value);
  if (Number.isNaN(uangDiterima) || uangDiterima === 0) {
    kembalianEl.innerHTML = `<span class="text-slate-700">Rp 0</span>`;
    return;
  }

  // Logika pengecekan uang
  if (uangDiterima < totalBayar) {
    // Jika uang kurang
    const kurang = totalBayar - uangDiterima;
    kembalianEl.innerHTML = `<span class="text-rose-500 font-bold">Kurang: Rp ${kurang.toLocaleString("id-ID")}</span>`;
  } else {
    // Jika uang pas atau ada kembalian
    const kembalian = uangDiterima - totalBayar;
    kembalianEl.innerHTML = `<span class="text-emerald-600 font-bold">Rp ${kembalian.toLocaleString("id-ID")}</span>`;
  }
}

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

  const itemDitemukan = keranjang.find(
    (item) => item.nama === menuDipilih.nama,
  );

  if (itemDitemukan) {
    if (itemDitemukan.qty + 1 > menuDipilih.stok) {
      showToast("Stok tidak cukup untuk menambah lagi.", "error");
      return;
    }
    itemDitemukan.qty += 1;
  } else {
    keranjang.push({
      nama: menuDipilih.nama,
      harga: menuDipilih.harga,
      qty: 1,
    });
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

function tambahOrderanIndex(index) {
  const menuDipilih = kopi[index];

  if (menuDipilih.stok <= 0) {
    showToast(`Maaf, stok ${menuDipilih.nama} sudah habis.`, "error");
    return;
  }

  const itemDitemukan = keranjang.find(
    (item) => item.nama === menuDipilih.nama,
  );

  if (itemDitemukan) {
    if (itemDitemukan.qty + 1 > menuDipilih.stok) {
      showToast(`Stok tidak cukup! Sisa stok: ${menuDipilih.stok}`, "error");
      return;
    }
    itemDitemukan.qty += 1;
  } else {
    keranjang.push({
      nama: menuDipilih.nama,
      harga: menuDipilih.harga,
      qty: 1,
    });
  }

  tampilanOrderan();
  simpanData();
  showToast(`${menuDipilih.nama} ditambahkan ke keranjang`, "success");
}

const tambahQty = (index) => {
  if (!keranjang[index]) return;

  const menuDiKeranjang = keranjang[index];
  const menuDiKopi = kopi.find((item) => item.nama === menuDiKeranjang.nama);

  if (!menuDiKopi) {
    showToast("Menu tidak ditemukan.", "error");
    return;
  }

  if (menuDiKeranjang.qty + 1 > menuDiKopi.stok) {
    showToast("Stok tidak mencukupi.", "error");
    return;
  }

  menuDiKeranjang.qty += 1;
  tampilanOrderan();
  simpanData();
};

function selesaikanPembayaran() {
  if (keranjang.length === 0) {
    showToast("Keranjang kosong. Tambahkan pesanan terlebih dahulu.", "error");
    return;
  }

  const totalBayar = keranjang.reduce(
    (acc, item) => acc + item.harga * item.qty,
    0,
  );
  const uangDiterimaEl = document.getElementById("uangDiterima");
  const metodePembayaranEl = document.getElementById("metodePembayaran");
  const nomorLapakEl = document.getElementById("nomorLapak"); // AMBIL LAPAK

  const uangDiterima = uangDiterimaEl ? Number(uangDiterimaEl.value) : 0;
  const metodePembayaran = metodePembayaranEl
    ? metodePembayaranEl.value
    : "Tunai";
  // Jika kosong, tulis "Takeaway/Tanpa Meja"
  const nomorLapak =
    nomorLapakEl && nomorLapakEl.value.trim()
      ? nomorLapakEl.value.trim()
      : "Takeaway";

  if (Number.isNaN(uangDiterima) || uangDiterima < totalBayar) {
    showToast("Uang diterima kurang dari total bayar.", "error");
    return;
  }

  if (!confirm("Selesaikan pembayaran pesanan ini?")) {
    return;
  }

  const now = new Date();
  const auth = getAuthState();
  const aktor = auth?.role ? auth.role.toUpperCase() : "GUEST";

  // Kurangi stok
  for (let orderItem of keranjang) {
    const menuIndex = kopi.findIndex((item) => item.nama === orderItem.nama);
    if (menuIndex < 0) continue;
    if (kopi[menuIndex].stok >= orderItem.qty) {
      kopi[menuIndex].stok -= orderItem.qty;
    } else {
      showToast(
        `Stok untuk ${orderItem.nama} tidak cukup. Transaksi dibatalkan.`,
        "error",
      );
      return;
    }
  }

  const kembalian = uangDiterima - totalBayar;

  // SIMPAN LAPAK KE DALAM TRANSAKSI
  const transaksi = {
    date: now.toISOString(),
    items: [...keranjang],
    totalBayar,
    uangDiterima,
    kembalian,
    metodePembayaran,
    kasir: aktor,
    lapak: nomorLapak, // <--- DATA LAPAK DISIMPAN
  };

  riwayatPesanan.push(transaksi);
  keranjang = [];
  simpanData();

  tampilanOrderan();
  tampilanMenu();
  updateKembalian(); // Reset UI kembalian

  // Kosongkan inputan lapak dan uang setelah bayar
  if (uangDiterimaEl) uangDiterimaEl.value = "0";
  if (nomorLapakEl) nomorLapakEl.value = "";

  // BIKIN STRUK (MUNCULIN NOMOR LAPAK)
  const strukArea = document.getElementById("strukArea");
  if (!strukArea) return;

  const strukRows = transaksi.items
    .map(
      (item) =>
        `
      <div class="struk-row" style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
        <span>${item.nama}</span>
        <span>${item.qty} x ${item.harga.toLocaleString("id-ID")}</span>
        <span>${(item.harga * item.qty).toLocaleString("id-ID")}</span>
      </div>
    `,
    )
    .join("");

  strukArea.innerHTML = `
    <div class="struk-wrapper" style="width:80mm; max-width:100%; margin:0 auto; font-family:'Courier New', monospace; font-size:13px;">
      <div style="text-align:center; font-weight:bold; font-size:1.2rem; margin-bottom:0.2rem;">KopiKita</div>
      <div style="text-align:center; margin-bottom:0.5rem; font-size:11px; color:#555;">Jl. Kopi #123, Kota Rasa</div>
      <div class="struk-separator"></div>
      <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Tgl:</span> <span>${now.toLocaleDateString("id-ID")} ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span></div>
      <div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Kasir:</span> <span>${aktor}</span></div>
      <div style="display:flex; justify-content:space-between; margin-bottom:2px; font-weight:bold;"><span>Lapak:</span> <span>${nomorLapak}</span></div>
      <div class="struk-separator"></div>
      ${strukRows}
      <div class="struk-separator"></div>
      <div style="display:flex; justify-content:space-between; font-weight:bold;"> <span>Total</span> <span>Rp ${totalBayar.toLocaleString("id-ID")}</span></div>
      <div style="display:flex; justify-content:space-between;"> <span>Tunai/Metode</span> <span>Rp ${uangDiterima.toLocaleString("id-ID")} (${metodePembayaran})</span></div>
      <div style="display:flex; justify-content:space-between;"> <span>Kembali</span> <span>Rp ${kembalian.toLocaleString("id-ID")}</span></div>
      <div class="struk-separator"></div>
      <div style="text-align:center; margin-top:0.5rem; font-style:italic;">Terima kasih telah berkunjung!</div>
    </div>
  `;

  window.print();
  setTimeout(() => {
    showToast("Pesanan berhasil diselesaikan.", "success");
  }, 500);
}
