let lineChartInstance = null;
let pieChartInstance = null;

function initLaporanPage() {
  if (!requireAuth(["admin"])) return;
  showLaporan();
}

function showLaporan() {
  const laporanContent = document.getElementById("laporanContent");
  if (!laporanContent) return;

  if (riwayatPesanan.length === 0) {
    laporanContent.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
        <i class="ph-fill ph-receipt-x text-6xl mb-3"></i>
        <p class="text-lg font-medium">Belum ada data transaksi.</p>
      </div>`;
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

  // KARTU RINGKASAN ATAS
  let html = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="group p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 group-hover:scale-110 transition-transform">
            <i class="ph-fill ph-wallet text-2xl"></i>
          </div>
          <div>
            <div class="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-1">Pendapatan Hari Ini</div>
            <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">Rp ${totalPendapatanHariIni.toLocaleString("id-ID")}</div>
          </div>
        </div>
      </div>
      
      <div class="group p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-500 group-hover:scale-110 transition-transform">
            <i class="ph-fill ph-star text-2xl"></i>
          </div>
          <div>
            <div class="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-1">Menu Terlaris</div>
            <div class="text-xl font-bold text-slate-700 dark:text-slate-200">${bestSeller}</div>
          </div>
        </div>
      </div>

      <div class="group p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 group-hover:scale-110 transition-transform">
            <i class="ph-fill ph-receipt text-2xl"></i>
          </div>
          <div>
            <div class="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-1">Total Transaksi</div>
            <div class="text-xl font-bold text-slate-700 dark:text-slate-200">${totalTransaksi} Sukses</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // TABEL REKAP HARIAN
  html += `<h3 class="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><i class="ph-fill ph-calendar-blank text-indigo-500"></i> Rekap Pendapatan Harian</h3>`;
  html += `
    <div class="overflow-x-auto mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="px-5 py-4 text-left font-semibold">Tanggal</th>
            <th class="px-5 py-4 text-center font-semibold">Jml Transaksi</th>
            <th class="px-5 py-4 text-right font-semibold">Total Pendapatan</th>
            <th class="px-5 py-4 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody class="text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-700/50">
  `;

  Object.keys(laporanPerTanggal).forEach((tgl) => {
    const dataHarian = laporanPerTanggal[tgl];
    html += `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        <td class="px-5 py-4 font-semibold">${tgl}</td>
        <td class="px-5 py-4 text-center">
          <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full font-bold text-xs">${dataHarian.jumlahTransaksi}</span>
        </td>
        <td class="px-5 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">Rp ${dataHarian.totalBayar.toLocaleString("id-ID")}</td>
        <td class="px-5 py-4 text-center">
          <button onclick="lihatDetailTanggal('${tgl}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-lg text-xs font-bold transition-all active:scale-95">
            <i class="ph-bold ph-list-magnifying-glass text-sm"></i> Detail
          </button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  html += `<div id="detailHarianArea" class="mt-8"></div>`;

  laporanContent.innerHTML = html;

  // Render Grafik Chart.js
  renderGrafik(laporanPerTanggal, salesCount);
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

  let html = `
    <div class="p-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl animate-[fadeIn_0.3s_ease-in-out]">
      <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-200 dark:border-slate-700">
        <h3 class="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
          <i class="ph-fill ph-clipboard-text text-indigo-500"></i> 
          Rincian Transaksi: <span class="text-indigo-600 dark:text-indigo-400">${tglDicari}</span>
        </h3>
      </div>
      
      <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th class="px-5 py-3 text-left font-semibold">Waktu</th>
              <th class="px-5 py-3 text-left font-semibold">Kasir</th>
              <th class="px-5 py-3 text-left font-semibold">Item Terjual</th>
              <th class="px-5 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-700 dark:text-slate-300">
  `;

  [...transaksiHariIni].reverse().forEach((entry) => {
    const jamWaktu = new Date(entry.date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const namaItem = (entry.items || [])
      .map(
        (i) =>
          `<span class="inline-block bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs mb-1 mr-1">${i.nama} <span class="font-bold text-indigo-500 dark:text-indigo-300">(x${i.qty})</span></span>`,
      )
      .join("");
    const namaKasir = entry.kasir || "-";

    html += `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <td class="px-5 py-4 whitespace-nowrap align-top font-medium flex items-center gap-1.5">
          <i class="ph ph-clock text-slate-400"></i> ${jamWaktu}
        </td>
        <td class="px-5 py-4 whitespace-nowrap align-top">
          <div class="flex items-center gap-1.5">
            <i class="ph-fill ph-user-circle text-slate-400 text-lg"></i>
            <span class="font-semibold text-xs">${namaKasir}</span>
          </div>
        </td>
        <td class="px-5 py-4 align-top leading-relaxed">${namaItem}</td>
        <td class="px-5 py-4 align-top text-right font-bold text-emerald-600 dark:text-emerald-400">Rp ${(entry.totalBayar || 0).toLocaleString("id-ID")}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div></div>`;

  detailArea.innerHTML = html;
  detailArea.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderGrafik(laporanPerTanggal, salesCount) {
  const labelsLine = Object.keys(laporanPerTanggal);
  const dataLine = labelsLine.map((tgl) => laporanPerTanggal[tgl].totalBayar);

  const sortedSales = Object.entries(salesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const labelsPie = sortedSales.map((item) => item[0]);
  const dataPie = sortedSales.map((item) => item[1]);

  if (lineChartInstance) lineChartInstance.destroy();
  if (pieChartInstance) pieChartInstance.destroy();

  // Deteksi warna font biar pas di dark mode
  const isDark = document.documentElement.classList.contains("dark");
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark ? "#334155" : "#e2e8f0";

  const ctxLine = document.getElementById("lineChart");
  if (ctxLine) {
    lineChartInstance = new Chart(ctxLine, {
      type: "line",
      data: {
        labels: labelsLine,
        datasets: [
          {
            label: "Pendapatan (Rp)",
            data: dataLine,
            borderColor: "#10b981", // Emerald 500
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 3,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#10b981",
            pointBorderWidth: 2,
            pointRadius: 4,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor },
          },
          x: {
            grid: { color: gridColor, display: false },
            ticks: { color: textColor },
          },
        },
        plugins: {
          legend: { labels: { color: textColor } },
        },
      },
    });
  }

  const ctxPie = document.getElementById("pieChart");
  if (ctxPie) {
    pieChartInstance = new Chart(ctxPie, {
      type: "doughnut",
      data: {
        labels: labelsPie,
        datasets: [
          {
            data: dataPie,
            backgroundColor: [
              "#10b981",
              "#6366f1",
              "#f59e0b",
              "#f43f5e",
              "#8b5cf6",
            ], // Warna Tailwind modern
            borderWidth: isDark ? 0 : 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: textColor, padding: 20 },
          },
        },
        cutout: "70%", // Bikin doughnutnya lebih tipis dan estetik
      },
    });
  }
}

function exportLaporanCSV() {
  if (!riwayatPesanan || riwayatPesanan.length === 0)
    return showToast("Belum ada data untuk di-export.", "error");

  let csvContent =
    "Tanggal,Jam,Kasir,Menu Terjual,Total Qty,Subtotal,Diskon,Pajak,Total Bayar,Metode Pembayaran\n";
  riwayatPesanan.forEach((transaksi) => {
    const tgl = new Date(transaksi.date);
    const dateStr = tgl.toLocaleDateString("id-ID");
    const timeStr = tgl.toLocaleTimeString("id-ID");
    const items = transaksi.items
      .map((i) => `${i.nama} (x${i.qty})`)
      .join(" & ");
    const totalQty = transaksi.items.reduce((sum, item) => sum + item.qty, 0);

    const row = [
      dateStr,
      timeStr,
      transaksi.kasir || "GUEST",
      `"${items}"`,
      totalQty,
      transaksi.subtotal || 0,
      transaksi.diskon || 0,
      transaksi.pajak || 0,
      transaksi.totalBayar || 0,
      transaksi.metodePembayaran || "Tunai",
    ].join(",");
    csvContent += row + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Laporan_KopiKita_${new Date().toISOString().slice(0, 10)}.csv`;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Laporan CSV berhasil diunduh!", "success");
}
