let kopi = JSON.parse(localStorage.getItem("kopi")) || [
  { nama: "kapal api", harga: 5000 },
  { nama: "liong", harga: 7000 },
  { nama: "oplet", harga: 6000 },
];
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
  let html = `<table><thead><tr><th>#</th><th>Tanggal</th><th>Item</th><th>Total</th></tr></thead><tbody>`;
  riwayatPesanan.forEach((entry, idx) => {
    const tgl = new Date(entry.date).toLocaleString("id-ID");
    const namaItem = entry.items.map((i) => `${i.nama} x${i.qty}`).join(", ");
    html += `<tr><td>${idx + 1}</td><td>${tgl}</td><td>${namaItem}</td><td>Rp ${entry.total.toLocaleString("id-ID")}</td></tr>`;
  });
  html += `</tbody></table>`;
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
    </tr>
    `;
    totalHarga += item.harga;
  });

  hasil.innerHTML = output;
  if (harga) {
    harga.innerHTML = `Total Harga Semua Menu: Rp ${totalHarga.toLocaleString("id-ID")}`;
  }
};

function tambahMenu() {
  let inputKopi = document.getElementById("menuBaru").value;
  let inputHarga = document.getElementById("hargaMenu").value;

  if (inputKopi !== "" && inputHarga !== "") {
    let menuBaru = {
      nama: inputKopi,
      harga: parseInt(inputHarga),
    };
    kopi.push(menuBaru);

    document.getElementById("hasil").innerHTML = "";
    tampilanMenu();
    simpanData();
    document.getElementById("menuBaru").value = "";
    document.getElementById("hargaMenu").value = "";
  } else {
    alert(" data belum di masukan ");
  }
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
  const itemDitemukan = keranjang.find((item) => item.nama === menuDipilih.nama);

  if (itemDitemukan) {
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

  const totalBayar = keranjang.reduce((acc, item) => acc + item.harga * item.qty, 0);
  const now = new Date();
  const transaksi = {
    date: now.toISOString(),
    items: [...keranjang],
    total: totalBayar,
  };

  riwayatPesanan.push(transaksi);
  keranjang = [];
  simpanData();
  tampilanOrderan();

  const strukArea = document.getElementById("strukArea");
  if (strukArea) {
    const strukRows = transaksi.items
      .map((item) =>
        `
        <tr>
          <td>${item.nama}</td>
          <td>${item.qty}</td>
          <td>Rp ${item.harga.toLocaleString("id-ID")}</td>
          <td>Rp ${(item.harga * item.qty).toLocaleString("id-ID")}</td>
        </tr>
      `,
      )
      .join("");

    strukArea.innerHTML = `
      <div class="card" style="max-width: 420px; margin: 0 auto;">
        <div class="card-header">
          <h3>🧾 Struk Pembayaran</h3>
        </div>
        <p><strong>Tanggal:</strong> ${now.toLocaleString("id-ID")}</p>
        <table>
          <thead>
            <tr>
              <th>Menu</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Sub</th>
            </tr>
          </thead>
          <tbody>
            ${strukRows}
            <tr>
              <td colspan="3" style="font-weight: bold; text-align: right;">Total</td>
              <td style="font-weight: bold; color: #1f7a35;">Rp ${totalBayar.toLocaleString("id-ID")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    setTimeout(() => {
      window.print();
    }, 250);

    setTimeout(() => {
      alert("Pesanan berhasil dibayar dan dimasukkan ke riwayat.");
    }, 500);
  }
}

