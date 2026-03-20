// --- STATE TAMBAHAN UNTUK FITUR BARU ---
let kategoriAktif = "semua";
let kataKunci = "";
let diskonAktif = 0; // Diskon desimal (0.2 = 20%)
const PPN_RATE = 0.11; // PPN 11%
let totalAkhirGlobal = 0; // Total setelah diskon & pajak

// --- FUNGSI INIT & EVENT LISTENER ---
function initKasirPage() {
  if (!requireAuth(["kasir", "admin"])) return; // Admin juga bisa akses order
  tampilkanMenuKasir();
  tampilanOrderan();

  // Setup Event Listener Pencarian
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      kataKunci = e.target.value.toLowerCase();
      tampilkanMenuKasir();
    });
  }

  // Setup Event Listener Kategori
  const btnCategories = document.querySelectorAll(".btn-category");
  btnCategories.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetBtn = e.currentTarget; // Pakai currentTarget biar icon di dalam tombol ga ganggu click

      // Reset semua tombol ke style default (Abu-abu / Dark)
      btnCategories.forEach((b) => {
        b.classList.remove(
          "bg-emerald-500",
          "text-white",
          "border-transparent",
        );
        b.classList.add(
          "bg-slate-100",
          "dark:bg-slate-900",
          "text-slate-600",
          "dark:text-slate-400",
        );
      });

      // Aktifkan tombol yang diklik (Hijau)
      targetBtn.classList.remove(
        "bg-slate-100",
        "dark:bg-slate-900",
        "text-slate-600",
        "dark:text-slate-400",
      );
      targetBtn.classList.add(
        "bg-emerald-500",
        "text-white",
        "border-transparent",
      );

      kategoriAktif = targetBtn.dataset.category;
      tampilkanMenuKasir();
    });
  });

  // Setup Event Listener Promo
  const btnApplyPromo = document.getElementById("btnApplyPromo");
  if (btnApplyPromo) {
    btnApplyPromo.addEventListener("click", () => {
      const code = document.getElementById("promoCode").value.toUpperCase();
      if (code === "PROMO20") {
        diskonAktif = 0.2;
        showToast("Berhasil! Diskon 20% diaplikasikan.", "success");
      } else if (code === "") {
        diskonAktif = 0;
        showToast("Promo dilepas.", "primary");
      } else {
        diskonAktif = 0;
        showToast("Kode promo tidak valid.", "error");
      }
      tampilanOrderan();
    });
  }
}

// --- FUNGSI RENDER MENU ---
function tampilkanMenuKasir() {
  const hasil = document.getElementById("hasil");
  if (!hasil) return;

  let output = "";

  kopi.forEach((item, index) => {
    const isMatchSearch = item.nama.toLowerCase().includes(kataKunci);

    // Logika Kategori (Gunakan field .kategori langsung)
    let isMatchCategory = true;
    if (kategoriAktif !== "semua") {
      isMatchCategory = item.kategori === kategoriAktif;
    }

    if (isMatchSearch && isMatchCategory) {
      const isHabis = item.stok <= 0;
      output += `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
          <td class="px-4 py-3 font-semibold">${item.nama}</td>
          <td class="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold tracking-wide">Rp ${item.harga.toLocaleString("id-ID")}</td>
          <td class="px-4 py-3 text-center">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${isHabis ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"}">
              ${isHabis ? "Habis" : item.stok}
            </span>
          </td>
          <td class="px-4 py-3 text-center">
            <button onclick="tambahOrderanIndex(${index})" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800 text-xs font-bold transition-all active:scale-95 ${isHabis ? "opacity-50 cursor-not-allowed" : ""}" ${isHabis ? "disabled" : ""}>
              <i class="ph-bold ph-plus"></i> Tambah
            </button>
          </td>
        </tr>
      `;
    }
  });

  if (output === "") {
    output = `<tr><td colspan="4" class="text-center py-8 text-slate-400 dark:text-slate-500"><i class="ph-fill ph-magnifying-glass text-4xl mb-2"></i><br>Menu tidak ditemukan.</td></tr>`;
  }

  hasil.innerHTML = output;
}

// --- FUNGSI RENDER KERANJANG ---
function tampilanOrderan() {
  const hasilOr = document.getElementById("hasilOrder");
  if (!hasilOr) return;

  let output = "";

  keranjang.forEach((item, index) => {
    const subTotal = item.harga * item.qty;
    output += `
      <tr class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        <td class="px-3 py-3">
          <div class="font-bold text-slate-800 dark:text-slate-200 leading-tight">${item.nama}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">Rp ${item.harga.toLocaleString("id-ID")}</div>
        </td>
        <td class="px-3 py-3">
          <div class="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-lg p-1 w-max mx-auto border border-slate-200 dark:border-slate-700">
            <button onclick="kurangQty(${index})" class="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:text-rose-500 transition-colors"><i class="ph-bold ph-minus"></i></button>
            <span class="w-4 text-center font-bold text-sm">${item.qty}</span>
            <button onclick="tambahQty(${index})" class="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:text-emerald-500 transition-colors"><i class="ph-bold ph-plus"></i></button>
          </div>
        </td>
        <td class="px-3 py-3 font-bold text-emerald-600 dark:text-emerald-400 text-right">Rp ${subTotal.toLocaleString("id-ID")}</td>
        <td class="px-3 py-3 text-center">
          <button onclick="hapusDariKeranjang(${index})" class="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1" title="Hapus Item">
            <i class="ph-fill ph-trash text-lg"></i>
          </button>
        </td>
      </tr>
    `;
  });

  if (keranjang.length === 0) {
    output = `
      <tr><td colspan="4" class="text-center py-10 text-slate-400 dark:text-slate-500">
        <i class="ph-fill ph-shopping-cart text-5xl mb-2 opacity-50"></i>
        <p class="font-medium text-sm">Keranjang masih kosong</p>
      </td></tr>
    `;
  }

  hasilOr.innerHTML = output;

  // Kalkulasi Harga
  const subtotal = keranjang.reduce(
    (acc, item) => acc + item.harga * item.qty,
    0,
  );
  const nominalDiskon = subtotal * diskonAktif;
  const subtotalSetelahDiskon = subtotal - nominalDiskon;
  const nominalPPN = subtotalSetelahDiskon * PPN_RATE;

  totalAkhirGlobal = subtotalSetelahDiskon + nominalPPN;

  // Update Tampilan Harga
  const subtotalDisplay = document.getElementById("subtotalDisplay");
  const discountDisplay = document.getElementById("discountDisplay");
  const taxDisplay = document.getElementById("taxDisplay");
  const totalDisplay = document.getElementById("totalDisplay");

  if (subtotalDisplay)
    subtotalDisplay.textContent = `Rp ${subtotal.toLocaleString("id-ID")}`;
  if (discountDisplay)
    discountDisplay.textContent = `- Rp ${nominalDiskon.toLocaleString("id-ID")}`;
  if (taxDisplay)
    taxDisplay.textContent = `Rp ${nominalPPN.toLocaleString("id-ID")}`;
  if (totalDisplay)
    totalDisplay.textContent = `Rp ${totalAkhirGlobal.toLocaleString("id-ID")}`;

  updateKembalian();
}

// --- FUNGSI MANAJEMEN KERANJANG ---
function hapusDariKeranjang(index) {
  if (!keranjang[index]) return;
  keranjang.splice(index, 1);
  tampilanOrderan();
  simpanData();
  showToast("Item dihapus dari pesanan", "primary");
}

function kurangQty(index) {
  if (!keranjang[index]) return;
  if (keranjang[index].qty > 1) {
    keranjang[index].qty -= 1;
  } else {
    keranjang.splice(index, 1);
  }
  tampilanOrderan();
  simpanData();
}

function tambahQty(index) {
  const menuDiKeranjang = keranjang[index];
  if (!menuDiKeranjang) return;

  const menuDiKopi = kopi.find((item) => item.nama === menuDiKeranjang.nama);
  if (!menuDiKopi) return showToast("Menu tidak ditemukan.", "error");
  if (menuDiKeranjang.qty + 1 > menuDiKopi.stok)
    return showToast("Stok tidak mencukupi.", "error");

  menuDiKeranjang.qty += 1;
  tampilanOrderan();
  simpanData();
}

function tambahOrderanIndex(index) {
  const menuDipilih = kopi[index];
  if (!menuDipilih) return showToast("Menu tidak ditemukan.", "error");
  if (menuDipilih.stok <= 0)
    return showToast(`Stok ${menuDipilih.nama} habis.`, "error");

  const itemDitemukan = keranjang.find(
    (item) => item.nama === menuDipilih.nama,
  );
  if (itemDitemukan) {
    if (itemDitemukan.qty + 1 > menuDipilih.stok)
      return showToast(`Stok tidak cukup!`, "error");
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
}

// --- FUNGSI PEMBAYARAN & KEMBALIAN ---
function updateKembalian() {
  const uangDiterimaEl = document.getElementById("uangDiterima");
  const kembalianEl = document.getElementById("kembalianVal");

  if (!uangDiterimaEl || !kembalianEl) return;

  const uangDiterima = Number(uangDiterimaEl.value);
  if (Number.isNaN(uangDiterima) || uangDiterima === 0) {
    kembalianEl.innerHTML = `Rp 0`;
    kembalianEl.className = "text-xl font-bold text-slate-800 dark:text-white";
    return;
  }

  if (uangDiterima < totalAkhirGlobal) {
    const kurang = totalAkhirGlobal - uangDiterima;
    kembalianEl.innerHTML = `Kurang Rp ${kurang.toLocaleString("id-ID")}`;
    kembalianEl.className = "text-xl font-bold text-rose-500";
  } else {
    const kembalian = uangDiterima - totalAkhirGlobal;
    kembalianEl.innerHTML = `Rp ${kembalian.toLocaleString("id-ID")}`;
    kembalianEl.className =
      "text-xl font-bold text-emerald-600 dark:text-emerald-400";
  }
}

function selesaikanPembayaran() {
  if (keranjang.length === 0) return showToast("Keranjang kosong!", "error");

  const uangDiterimaEl = document.getElementById("uangDiterima");
  const metodePembayaranEl = document.getElementById("metodePembayaran");
  const nomorLapakEl = document.getElementById("nomorLapak");

  const uangDiterima = uangDiterimaEl ? Number(uangDiterimaEl.value) : 0;
  const metodePembayaran = metodePembayaranEl
    ? metodePembayaranEl.value
    : "Tunai";
  const nomorLapak =
    nomorLapakEl && nomorLapakEl.value.trim()
      ? nomorLapakEl.value.trim()
      : "Takeaway";

  if (Number.isNaN(uangDiterima) || uangDiterima < totalAkhirGlobal)
    return showToast("Uang bayar kurang!", "error");

  const now = new Date();
  const auth = getAuthState();
  const aktor = auth?.username ? auth.username : "GUEST";

  // Kurangi stok
  for (let orderItem of keranjang) {
    const menuIndex = kopi.findIndex((item) => item.nama === orderItem.nama);
    if (menuIndex < 0) continue;
    if (kopi[menuIndex].stok >= orderItem.qty) {
      kopi[menuIndex].stok -= orderItem.qty;
    } else {
      return showToast(`Stok ${orderItem.nama} tidak cukup. Batal.`, "error");
    }
  }

  const kembalian = uangDiterima - totalAkhirGlobal;
  const subtotal = keranjang.reduce(
    (acc, item) => acc + item.harga * item.qty,
    0,
  );
  const nominalDiskon = subtotal * diskonAktif;
  const nominalPPN = (subtotal - nominalDiskon) * PPN_RATE;

  const transaksi = {
    date: now.toISOString(),
    items: [...keranjang],
    subtotal: subtotal,
    diskon: nominalDiskon,
    pajak: nominalPPN,
    totalBayar: totalAkhirGlobal,
    uangDiterima,
    kembalian,
    metodePembayaran,
    kasir: aktor,
    lapak: nomorLapak,
  };

  riwayatPesanan.push(transaksi);

  keranjang = [];
  diskonAktif = 0;
  if (document.getElementById("promoCode"))
    document.getElementById("promoCode").value = "";

  simpanData();
  tampilanOrderan();
  tampilkanMenuKasir();
  updateKembalian();

  if (uangDiterimaEl) uangDiterimaEl.value = "0";
  if (nomorLapakEl) nomorLapakEl.value = "";

  // Render Struk (Hidden untuk Print)
  const strukArea = document.getElementById("strukArea");
  if (strukArea) {
    const strukRows = transaksi.items
      .map(
        (item) => `
      <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
        <span>${item.nama}</span>
        <span>${item.qty}x</span>
        <span>${(item.harga * item.qty).toLocaleString("id-ID")}</span>
      </div>
    `,
      )
      .join("");

    strukArea.innerHTML = `
      <div class="struk-wrapper" style="width:80mm; font-family:'Courier New', monospace; font-size:12px;">
        <div style="text-align:center; font-weight:bold; font-size:16px;">KopiKita</div>
        <div style="text-align:center; color:#555; margin-bottom:5px;">Jl. Kopi #123, Kota Rasa</div>
        <div class="struk-separator"></div>
        <div style="display:flex; justify-content:space-between;"><span>Tgl:</span><span>${now.toLocaleDateString("id-ID")} ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Kasir:</span><span>${aktor}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Lapak:</span><span>${nomorLapak}</span></div>
        <div class="struk-separator"></div>
        ${strukRows}
        <div class="struk-separator"></div>
        <div style="display:flex; justify-content:space-between;"><span>Subtotal</span><span>Rp ${subtotal.toLocaleString("id-ID")}</span></div>
        ${nominalDiskon > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Diskon</span><span>-Rp ${nominalDiskon.toLocaleString("id-ID")}</span></div>` : ""}
        <div style="display:flex; justify-content:space-between;"><span>PPN (11%)</span><span>Rp ${nominalPPN.toLocaleString("id-ID")}</span></div>
        <div class="struk-separator"></div>
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:14px;"><span>Total</span><span>Rp ${totalAkhirGlobal.toLocaleString("id-ID")}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Bayar (${metodePembayaran})</span><span>Rp ${uangDiterima.toLocaleString("id-ID")}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Kembali</span><span>Rp ${kembalian.toLocaleString("id-ID")}</span></div>
        <div class="struk-separator"></div>
        <div style="text-align:center; margin-top:10px;">Terima kasih!</div>
      </div>
    `;

    // Tampilkan notif lalu print struk
    showToast("Transaksi berhasil disimpan!", "success");
    setTimeout(() => {
      window.print();
    }, 500);
  }
}
