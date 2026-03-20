let editCurrentIndex = -1;

function tampilkanMenuAdmin() {
  const hasil = document.getElementById("hasil");
  if (!hasil) return;

  let output = "";
  let totalHarga = 0;

  kopi.forEach((item, index) => {
    output += `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="px-3 py-3">${index + 1}</td>
        <td class="px-3 py-3 font-medium text-slate-800">${item.nama}</td>
        <td class="px-3 py-3 text-emerald-600 font-medium">Rp ${item.harga.toLocaleString("id-ID")}</td>
        <td class="px-3 py-3 text-center font-bold ${item.stok <= 0 ? "text-rose-500" : "text-slate-700"}">${item.stok <= 0 ? "Habis" : item.stok}</td>
        <td class="px-3 py-3 text-center space-x-2">
          <button onclick="editMenu(${index})" class="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs transition">Edit</button>
          <button onclick="hapusMenuIndex(${index})" class="px-2 py-1 bg-rose-100 text-rose-700 rounded hover:bg-rose-200 text-xs transition">Hapus</button>
        </td>
      </tr>
    `;
    totalHarga += item.harga;
  });

  hasil.innerHTML = output;

  const hargaWrapper = document.getElementById("harga");
  if (hargaWrapper) {
    hargaWrapper.innerText = `Total Harga Semua Menu: Rp ${totalHarga.toLocaleString("id-ID")}`;
  }
}

function hapusMenuIndex(index) {
  if (index < 0 || index >= kopi.length) {
    showToast("Menu tidak valid.", "error");
    return;
  }
  kopi.splice(index, 1);
  simpanData();
  tampilkanMenuAdmin();
  showToast("Menu berhasil dihapus", "success");
}

function editMenu(index) {
  if (index < 0 || index >= kopi.length) {
    showToast("Menu tidak ditemukan.", "error");
    return;
  }

  const currentMenu = kopi[index];
  editCurrentIndex = index;

  document.getElementById("editNama").value = currentMenu.nama;
  document.getElementById("editHarga").value = currentMenu.harga;
  document.getElementById("editStok").value = currentMenu.stok;

  document.getElementById("editModal").classList.remove("hidden");
}

function tutupModalEdit() {
  document.getElementById("editModal").classList.add("hidden");
  editCurrentIndex = -1;
}

function simpanEditMenu() {
  if (editCurrentIndex === -1) return;

  const newName = document.getElementById("editNama").value.trim();
  const newPrice = Number(document.getElementById("editHarga").value);
  const newStok = Number(document.getElementById("editStok").value);

  if (!newName) {
    showToast("Nama menu tidak boleh kosong.", "error");
    return;
  }

  if (Number.isNaN(newPrice) || newPrice < 1000) {
    showToast("Harga harus angka valid minimal Rp 1000.", "error");
    return;
  }

  if (Number.isNaN(newStok) || newStok < 0) {
    showToast("Stok tidak valid (minimal 0).", "error");
    return;
  }

  kopi[editCurrentIndex] = {
    nama: newName,
    harga: newPrice,
    stok: newStok,
  };

  simpanData();
  tampilkanMenuAdmin();
  tutupModalEdit();
  showToast("Perubahan berhasil disimpan.", "success");
}

function tambahMenu() {
  const inputKopiEl = document.getElementById("menuBaru");
  const inputHargaEl = document.getElementById("hargaMenu");
  const inputStokEl = document.getElementById("stokMenu");

  if (!inputKopiEl || !inputHargaEl || !inputStokEl) {
    showToast("Element input tidak ditemukan.", "error");
    return;
  }

  const namaMenuBaru = inputKopiEl.value.trim();
  const hargaMenuBaru = Number(inputHargaEl.value);
  const stokMenuBaru = Number(inputStokEl.value);

  if (!namaMenuBaru) {
    showToast("Nama menu tidak boleh kosong.", "error");
    return;
  }

  if (Number.isNaN(hargaMenuBaru) || hargaMenuBaru < 1000) {
    showToast("Harga menu harus angka dan minimal Rp 1000.", "error");
    return;
  }

  if (Number.isNaN(stokMenuBaru) || stokMenuBaru < 1) {
    showToast("Stok harus angka valid dan minimal 1.", "error");
    return;
  }

  kopi.push({ nama: namaMenuBaru, harga: hargaMenuBaru, stok: stokMenuBaru });
  simpanData();
  tampilkanMenuAdmin();

  inputKopiEl.value = "";
  inputHargaEl.value = "";
  inputStokEl.value = "";

  showToast("Menu baru berhasil ditambahkan.", "success");
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

  html += `<div id="detailHarianArea" class="mt-6 border-t border-slate-200 pt-6">
             <p class="text-slate-500 text-center italic py-4">Klik tombol "Lihat Detail" pada tabel di atas untuk melihat rincian item yang terjual.</p>
           </div>`;

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
    </div>`;

  detailArea.innerHTML = html;
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
  tampilkanMenuAdmin();
}
