function tampilkanMenuKasir() {
  const hasil = document.getElementById("hasil");
  if (!hasil) return;

  let output = "";

  kopi.forEach((item, index) => {
    const isHabis = item.stok <= 0;
    output += `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="px-3 py-3">${index + 1}</td>
        <td class="px-3 py-3 font-medium text-slate-800">${item.nama}</td>
        <td class="px-3 py-3 text-emerald-600 font-medium">Rp ${item.harga.toLocaleString("id-ID")}</td>
        <td class="px-3 py-3 text-center font-bold ${isHabis ? "text-rose-500" : "text-slate-700"}">${isHabis ? "Habis" : item.stok}</td>
        <td class="px-3 py-3 text-center">
          <button onclick="tambahOrderanIndex(${index})" class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 text-xs font-bold transition ${isHabis ? "opacity-50 cursor-not-allowed" : ""}" ${isHabis ? "disabled" : ""}>
            + Tambah
          </button>
        </td>
      </tr>
    `;
  });

  hasil.innerHTML = output;
}

function initKasirPage() {
  if (!requireAuth(["kasir"])) return;
  tampilkanMenuKasir();
  tampilkanOrderan();
}

function tampilanOrderan() {
  const hasilOr = document.getElementById("hasilOrder");
  if (!hasilOr) return;

  let output = "";

  keranjang.forEach((item, index) => {
    const subTotal = item.harga * item.qty;
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
}

function hapusDariKeranjang(index) {
  if (!keranjang[index]) return;

  if (confirm(`Hapus ${keranjang[index].nama} dari pesanan?`)) {
    keranjang.splice(index, 1);
    tampilanOrderan();
    simpanData();
    updateKembalian();
    showToast("Item dihapus dari pesanan", "success");
  }
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
}

function tambahOrderanIndex(index) {
  const menuDipilih = kopi[index];
  if (!menuDipilih) {
    showToast("Menu tidak ditemukan.", "error");
    return;
  }

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

  if (uangDiterima < totalBayar) {
    const kurang = totalBayar - uangDiterima;
    kembalianEl.innerHTML = `<span class="text-rose-500 font-bold">Kurang: Rp ${kurang.toLocaleString("id-ID")}</span>`;
  } else {
    const kembalian = uangDiterima - totalBayar;
    kembalianEl.innerHTML = `<span class="text-emerald-600 font-bold">Rp ${kembalian.toLocaleString("id-ID")}</span>`;
  }
}

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
  const nomorLapakEl = document.getElementById("nomorLapak");

  const uangDiterima = uangDiterimaEl ? Number(uangDiterimaEl.value) : 0;
  const metodePembayaran = metodePembayaranEl
    ? metodePembayaranEl.value
    : "Tunai";
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

  const transaksi = {
    date: now.toISOString(),
    items: [...keranjang],
    totalBayar,
    uangDiterima,
    kembalian,
    metodePembayaran,
    kasir: aktor,
    lapak: nomorLapak,
  };

  riwayatPesanan.push(transaksi);
  keranjang = [];
  simpanData();

  tampilanOrderan();
  tampilkanMenuKasir();
  updateKembalian();

  if (uangDiterimaEl) uangDiterimaEl.value = "0";
  if (nomorLapakEl) nomorLapakEl.value = "";

  const strukArea = document.getElementById("strukArea");
  if (!strukArea) return;

  const strukRows = transaksi.items
    .map(
      (item) => `
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
