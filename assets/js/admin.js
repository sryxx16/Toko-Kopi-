let editCurrentIndex = -1;

function initAdminPage() {
  if (!requireAuth(["admin"])) return;
  tampilkanMenuAdmin();
  tampilkanRingkasanHariIni();
}

function tampilkanRingkasanHariIni() {
  const elPendapatan = document.getElementById("pendapatanHariIni");
  const elTransaksi = document.getElementById("transaksiHariIni");

  if (!elPendapatan || !elTransaksi) return;

  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  let pendapatanHariIni = 0;
  let jumlahTransaksiHariIni = 0;

  if (typeof riwayatPesanan !== "undefined") {
    riwayatPesanan.forEach((transaksi) => {
      const tglTransaksi = new Date(transaksi.date);
      if (isSameDay(tglTransaksi, today)) {
        pendapatanHariIni += transaksi.totalBayar || 0;
        jumlahTransaksiHariIni += 1;
      }
    });
  }

  elPendapatan.textContent = `Rp ${pendapatanHariIni.toLocaleString("id-ID")}`;
  elTransaksi.textContent = jumlahTransaksiHariIni;
}

function tampilkanMenuAdmin() {
  const hasil = document.getElementById("hasil");
  if (!hasil) return;

  let output = "";
  kopi.forEach((item, index) => {
    const kategoriLabel = item.kategori
      ? `<div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">${item.kategori}</div>`
      : "";
    output += `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
        <td class="px-5 py-4">${index + 1}</td>
        <td class="px-5 py-4 font-semibold">
          <div>${item.nama}</div>
          ${kategoriLabel}
        </td>
        <td class="px-5 py-4 text-emerald-600 dark:text-emerald-400 font-bold tracking-wide">Rp ${item.harga.toLocaleString("id-ID")}</td>
        <td class="px-5 py-4 text-center">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${item.stok <= 5 ? (item.stok <= 0 ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300") : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"}">
            ${item.stok <= 0 ? "Habis" : item.stok + " Cup"}
          </span>
        </td>
        <td class="px-5 py-4 text-center space-x-2">
          <button onclick="editMenu(${index})" class="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800 rounded-lg transition-all active:scale-90" title="Edit">
            <i class="ph-bold ph-pencil-simple text-lg"></i>
          </button>
          <button onclick="hapusMenuIndex(${index})" class="inline-flex items-center justify-center w-8 h-8 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800 rounded-lg transition-all active:scale-90" title="Hapus">
            <i class="ph-bold ph-trash text-lg"></i>
          </button>
        </td>
      </tr>
    `;
  });
  hasil.innerHTML = output;
}

function hapusMenuIndex(index) {
  if (index < 0 || index >= kopi.length)
    return showToast("Menu tidak valid.", "error");
  kopi.splice(index, 1);
  simpanData();
  tampilkanMenuAdmin();
  showToast("Menu berhasil dihapus", "success");
}

function editMenu(index) {
  if (index < 0 || index >= kopi.length) return;
  const currentMenu = kopi[index];
  editCurrentIndex = index;

  document.getElementById("editNama").value = currentMenu.nama;
  document.getElementById("editHarga").value = currentMenu.harga;
  document.getElementById("editStok").value = currentMenu.stok;
  document.getElementById("editKategori").value = currentMenu.kategori || "";

  // Logika Animasi Buka Modal
  const modal = document.getElementById("editModal");
  const modalContent = document.getElementById("editModalContent");

  modal.classList.remove("pointer-events-none");
  modal.classList.replace("opacity-0", "opacity-100");

  // Kasih delay render dikit biar transisi kontennya jalan
  setTimeout(() => {
    modalContent.classList.remove("scale-95", "translate-y-4", "opacity-0");
    modalContent.classList.add("scale-100", "translate-y-0", "opacity-100");
  }, 10);
}

function tutupModalEdit() {
  const modal = document.getElementById("editModal");
  const modalContent = document.getElementById("editModalContent");

  // Logika Animasi Tutup Modal
  modalContent.classList.remove("scale-100", "translate-y-0", "opacity-100");
  modalContent.classList.add("scale-95", "translate-y-4", "opacity-0");

  setTimeout(() => {
    modal.classList.replace("opacity-100", "opacity-0");
    modal.classList.add("pointer-events-none");
    editCurrentIndex = -1;
  }, 200); // Tunggu sampai animasi zoom-out selesai
}

function simpanEditMenu() {
  if (editCurrentIndex === -1) return;
  const newName = document.getElementById("editNama").value.trim();
  const newPrice = Number(document.getElementById("editHarga").value);
  const newStok = Number(document.getElementById("editStok").value);
  const newKategori = document.getElementById("editKategori").value.trim();

  if (!newName) return showToast("Nama menu tidak boleh kosong.", "error");
  if (Number.isNaN(newPrice) || newPrice < 1000)
    return showToast("Harga minimal Rp 1000.", "error");
  if (Number.isNaN(newStok) || newStok < 0)
    return showToast("Stok minimal 0.", "error");
  if (!newKategori)
    return showToast("Kategori harus dipilih.", "error");

  kopi[editCurrentIndex] = { 
    nama: newName, 
    harga: newPrice, 
    stok: newStok, 
    kategori: newKategori 
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
  const inputKategoriEl = document.getElementById("kategoriMenu");

  const namaMenuBaru = inputKopiEl.value.trim();
  const hargaMenuBaru = Number(inputHargaEl.value);
  const stokMenuBaru = Number(inputStokEl.value);
  const kategoriMenuBaru = inputKategoriEl.value.trim();

  if (!namaMenuBaru) return showToast("Nama menu tidak boleh kosong.", "error");
  if (Number.isNaN(hargaMenuBaru) || hargaMenuBaru < 1000)
    return showToast("Harga minimal Rp 1000.", "error");
  if (Number.isNaN(stokMenuBaru) || stokMenuBaru < 1)
    return showToast("Stok minimal 1.", "error");
  if (!kategoriMenuBaru)
    return showToast("Kategori harus dipilih.", "error");

  kopi.push({ 
    nama: namaMenuBaru, 
    harga: hargaMenuBaru, 
    stok: stokMenuBaru, 
    kategori: kategoriMenuBaru 
  });
  simpanData();
  tampilkanMenuAdmin();

  inputKopiEl.value = "";
  inputHargaEl.value = "";
  inputStokEl.value = "";
  inputKategoriEl.value = "";
  showToast("Menu baru berhasil ditambahkan.", "success");
}
