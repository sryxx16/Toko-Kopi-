// --- LOGIKA HALAMAN MANAJEMEN PEGAWAI ---

function initUsersPage() {
  if (!requireAuth(["admin"])) return;
  tampilkanUserAdmin();
}

function tampilkanUserAdmin() {
  const hasilUser = document.getElementById("hasilUser");
  if (!hasilUser) return;

  let output = "";
  users.forEach((u, index) => {
    // Styling Badge Role berdasarkan tipe user
    const isAdmin = u.role === "admin";
    const badgeColor = isAdmin
      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    const iconRole = isAdmin ? "ph-shield-star" : "ph-storefront";

    output += `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
        <td class="px-5 py-4 font-medium text-slate-500">${index + 1}</td>
        
        <td class="px-5 py-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600">
              <i class="ph-fill ph-user text-xl"></i>
            </div>
            <div>
              <div class="font-bold text-slate-800 dark:text-white text-base">${u.username}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">ID: ${u.id || "User"}</div>
            </div>
          </div>
        </td>
        
        <td class="px-5 py-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${badgeColor}">
            <i class="ph-fill ${iconRole}"></i> ${u.role.toUpperCase()}
          </span>
        </td>
        
        <td class="px-5 py-4 text-center">
          <button onclick="hapusUser(${index})" class="inline-flex items-center justify-center w-9 h-9 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-800 rounded-xl transition-all active:scale-90" title="Hapus Akun" ${u.username === "admin" ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ""}>
            <i class="ph-bold ph-trash text-lg"></i>
          </button>
        </td>
      </tr>
    `;
  });
  hasilUser.innerHTML = output;
}

function tambahUser() {
  const inputUsername = document.getElementById("usernameBaru");
  const inputPassword = document.getElementById("passwordBaru");
  const selectRole = document.getElementById("roleBaru");

  const valUser = inputUsername.value.trim();
  const valPass = inputPassword.value.trim();
  const valRole = selectRole.value;

  if (!valUser || !valPass)
    return showToast("Username dan Password wajib diisi!", "error");

  const isExist = users.find(
    (u) => u.username.toLowerCase() === valUser.toLowerCase(),
  );
  if (isExist) return showToast("Username sudah terdaftar!", "error");

  users.push({
    id: Date.now(), // Generate ID unik
    username: valUser,
    password: valPass,
    role: valRole,
  });

  simpanData();
  tampilkanUserAdmin();

  inputUsername.value = "";
  inputPassword.value = "";

  // Balikin kursor ke input username biar bisa ngetik lagi dengan cepat
  inputUsername.focus();

  showToast(`Akun ${valUser} berhasil dibuat!`, "success");
}

function hapusUser(index) {
  if (users[index].username === "admin")
    return showToast("Akun admin utama tidak bisa dihapus!", "error");

  if (
    confirm(
      `Apakah Anda yakin ingin menghapus akun "${users[index].username}"?`,
    )
  ) {
    users.splice(index, 1);
    simpanData();
    tampilkanUserAdmin();
    showToast("Akun berhasil dihapus", "success");
  }
}
