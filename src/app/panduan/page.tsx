import Image from "next/image";

export const metadata = {
  title: "Panduan Penggunaan — Truckinc Driver Report",
  description: "Panduan lengkap penggunaan sistem pelaporan driver Truckinc",
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-bold text-primary border-l-4 border-accent pl-3 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Step({ num, title, children }: { num: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="w-8 h-8 bg-accent text-white font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
        {num}
      </div>
      <div>
        <p className="font-semibold text-gray-900 mb-1">{title}</p>
        {children && <div className="text-sm text-gray-600 space-y-1">{children}</div>}
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-accent-100 border-l-4 border-accent px-4 py-3 text-sm text-gray-700 mb-4">
      💡 {children}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-red-50 border-l-4 border-danger px-4 py-3 text-sm text-gray-700 mb-4">
      ⚠️ {children}
    </div>
  );
}

function Badge({ type }: { type: "pickup" | "drop" | "admin" | "driver" }) {
  const map = {
    pickup: "bg-blue-50 text-blue-700",
    drop: "bg-green-50 text-green-700",
    admin: "bg-primary text-white",
    driver: "bg-accent text-white",
  };
  const label = { pickup: "PICKUP", drop: "DROP", admin: "Admin", driver: "Driver" };
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 ${map[type]}`}>
      {label[type]}
    </span>
  );
}

export default function PanduanPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-primary text-white py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <Image
            src="/images/truckinc-logo-white.svg"
            alt="Truckinc"
            width={140}
            height={38}
            className="h-9 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold mb-1">Panduan Penggunaan</h1>
          <p className="text-white/70 text-sm">Driver Reporting System · Versi 1.0</p>
        </div>
      </header>

      {/* ── TOC ── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex gap-4 flex-wrap text-sm font-medium">
          <a href="#driver" className="text-accent hover:underline">Untuk Driver</a>
          <span className="text-gray-300">·</span>
          <a href="#add-to-homescreen" className="text-accent hover:underline">Add to Home Screen</a>
          <span className="text-gray-300">·</span>
          <a href="#admin" className="text-accent hover:underline">Untuk Admin</a>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* ═══════════════════════════════════════════
            BAGIAN DRIVER
        ═══════════════════════════════════════════ */}
        <Section id="driver" title="Panduan Driver">
          <p className="text-gray-600 mb-6">
            Driver menggunakan aplikasi berbasis web (PWA) yang dapat diakses melalui browser HP.
            URL: <strong className="text-primary">driver.truckinc.id</strong>
          </p>

          <h3 className="font-bold text-gray-900 mb-3">1. Login</h3>
          <Step num={1} title="Buka driver.truckinc.id di browser HP">
            <p>Gunakan Chrome (Android) atau Safari (iPhone).</p>
          </Step>
          <Step num={2} title="Masukkan Username dan Password">
            <p>Username dan password diberikan oleh admin operasional.</p>
          </Step>
          <Step num={3} title="Klik tombol Masuk">
            <p>Setelah berhasil, aplikasi mengarahkan ke halaman Beranda.</p>
          </Step>

          <h3 className="font-bold text-gray-900 mb-3 mt-6">2. Buat Laporan</h3>
          <Warning>
            GPS HP harus aktif sebelum bisa mengirim laporan. Pastikan izin lokasi sudah diberikan ke browser.
          </Warning>
          <Step num={1} title="Tap tombol 'Buat Laporan' di Beranda" />
          <Step num={2} title="Pilih jenis laporan: Lanjutkan atau Laporan Baru">
            <p><strong>Lanjutkan Perjalanan</strong> — kota asal diisi otomatis dari tujuan laporan sebelumnya.</p>
            <p><strong>Laporan Baru</strong> — isi kota asal dari awal.</p>
          </Step>
          <Step num={3} title="Pilih Tipe Laporan">
            <p><Badge type="pickup" /> — saat mengambil muatan di lokasi asal.</p>
            <p><Badge type="drop" /> — saat mengantar/menurunkan muatan di tujuan.</p>
          </Step>
          <Step num={4} title="Isi Rute: Kota Asal dan Kota Tujuan" />
          <Step num={5} title="Upload Foto Muatan">
            <p>Minimal 1 foto, maksimal 5 foto. Foto dikompresi otomatis (&lt;100KB).</p>
            <p>Tap tombol kamera untuk ambil foto langsung atau pilih dari galeri.</p>
          </Step>
          <Step num={6} title="Isi Catatan (opsional)" />
          <Step num={7} title="Tap 'Kirim Laporan'">
            <p>Tombol aktif hanya jika GPS sudah terdeteksi dan semua field wajib terisi.</p>
          </Step>
          <Note>
            Setelah laporan terkirim, muncul pilihan <strong>Lanjutkan</strong> (isi laporan berikutnya dengan kota asal otomatis) atau <strong>Laporan Baru</strong>.
          </Note>

          <h3 className="font-bold text-gray-900 mb-3 mt-6">3. Riwayat Laporan</h3>
          <Step num={1} title="Tap menu 'Riwayat' di navigation bar bawah" />
          <Step num={2} title="Gunakan kolom pencarian untuk cari berdasarkan kota" />
          <Step num={3} title="Filter berdasarkan tipe: Semua / Pickup / Drop" />
          <Step num={4} title="Tap laporan untuk lihat detail, foto, dan lokasi di peta" />

          <h3 className="font-bold text-gray-900 mb-3 mt-6">4. Profil & Ganti Password</h3>
          <Step num={1} title="Tap menu 'Profil' di navigation bar" />
          <Step num={2} title="Tap 'Ubah' untuk edit nama, telepon, email" />
          <Step num={3} title="Tap 'Ubah Password' di bagian Keamanan" />
          <Step num={4} title="Tap 'Keluar dari Akun' untuk logout" />
        </Section>

        {/* ═══════════════════════════════════════════
            ADD TO HOME SCREEN
        ═══════════════════════════════════════════ */}
        <Section id="add-to-homescreen" title="Add to Home Screen (Shortcut)">
          <p className="text-gray-600 mb-4">
            Supaya driver tidak perlu mengetik URL setiap kali membuka aplikasi,
            aplikasi bisa dipasang sebagai shortcut di layar utama HP (seperti aplikasi biasa).
          </p>

          <Note>
            Fitur ini disebut <strong>PWA (Progressive Web App)</strong>. Setelah dipasang, aplikasi bisa dibuka langsung dari ikon di layar utama tanpa perlu buka browser terlebih dahulu.
          </Note>

          <h3 className="font-bold text-gray-900 mb-3">Android (Chrome)</h3>
          <Step num={1} title="Buka driver.truckinc.id di Chrome" />
          <Step num={2} title="Tap ikon tiga titik (⋮) di pojok kanan atas" />
          <Step num={3} title="Pilih 'Add to Home screen' atau 'Install App'" />
          <Step num={4} title="Tap 'Add' atau 'Install' pada dialog konfirmasi">
            <p>Ikon Truckinc akan muncul di layar utama HP.</p>
          </Step>
          <Step num={5} title="Buka aplikasi langsung dari ikon — selesai! ✓" />

          <h3 className="font-bold text-gray-900 mb-3 mt-6">iPhone / iPad (Safari)</h3>
          <Warning>
            Harus menggunakan <strong>Safari</strong>. Fitur ini tidak tersedia di Chrome iOS.
          </Warning>
          <Step num={1} title="Buka driver.truckinc.id di Safari" />
          <Step num={2} title="Tap ikon Share (kotak dengan panah ↑) di tengah bawah" />
          <Step num={3} title="Scroll ke bawah, pilih 'Add to Home Screen'" />
          <Step num={4} title="Ubah nama jika perlu, lalu tap 'Add'" >
            <p>Ikon Truckinc akan muncul di layar utama iPhone.</p>
          </Step>
          <Step num={5} title="Buka dari ikon — tampilan full screen tanpa URL bar ✓" />

          <Note>
            Setelah dipasang di iPhone dengan Safari, aplikasi berjalan dalam mode full screen (seperti app asli) dan status bar berwarna biru Truckinc.
          </Note>
        </Section>

        {/* ═══════════════════════════════════════════
            BAGIAN ADMIN
        ═══════════════════════════════════════════ */}
        <Section id="admin" title="Panduan Admin Operasional">
          <p className="text-gray-600 mb-6">
            Admin mengakses dashboard melalui browser laptop/desktop (atau HP).
            URL login sama: <strong className="text-primary">driver.truckinc.id</strong>
          </p>

          <h3 className="font-bold text-gray-900 mb-3">1. Dashboard Monitoring</h3>
          <Step num={1} title="Login dengan akun admin" />
          <Step num={2} title="Halaman Dashboard menampilkan:">
            <p>• Stats: total laporan, laporan hari ini, minggu ini, driver aktif</p>
            <p>• Peta perjalanan hari ini dengan titik-titik lokasi driver</p>
            <p>• Feed laporan terbaru (auto-refresh setiap 30 detik)</p>
          </Step>
          <Step num={3} title="Tap/klik laporan untuk lihat detail, foto, dan peta lokasi" />
          <Step num={4} title="Gunakan tombol Filter untuk filter berdasarkan tipe, driver, atau nopol" />
          <Step num={5} title="Tap 'Refresh' untuk memperbarui data secara manual" />

          <h3 className="font-bold text-gray-900 mb-3 mt-6">2. Halaman Laporan</h3>
          <Step num={1} title="Buka menu Laporan di sidebar kiri" />
          <Step num={2} title="Gunakan kolom pencarian untuk cari laporan spesifik" />
          <Step num={3} title="Gunakan Filter untuk filter kombinasi: tipe, driver, tanggal" />
          <Step num={4} title="Tap baris laporan untuk lihat detail lengkap" />
          <Step num={5} title="Tap 'Export Excel' untuk download data sesuai filter aktif">
            <p>File berformat .xlsx dengan kolom: No, Tanggal, Driver, Nopol, Tipe, Asal, Tujuan, Koordinat, Link Foto, Catatan.</p>
          </Step>
          <Step num={6} title="Tap ikon Hapus di panel detail untuk hapus laporan" />

          <h3 className="font-bold text-gray-900 mb-3 mt-6">3. Master Data Kendaraan</h3>
          <Step num={1} title="Buka menu Kendaraan di sidebar" />
          <Step num={2} title="Tap + untuk tambah kendaraan baru (isi Nopol + Tipe)" />
          <Step num={3} title="Tap Edit untuk ubah data kendaraan" />
          <Step num={4} title="Tap toggle untuk aktifkan/nonaktifkan kendaraan" />
          <Note>
            Kendaraan yang dinonaktifkan tidak bisa dipilih saat driver buat laporan.
          </Note>

          <h3 className="font-bold text-gray-900 mb-3 mt-6">4. Master Data Driver</h3>
          <Step num={1} title="Buka menu Driver di sidebar" />
          <Step num={2} title="Tap + untuk tambah driver baru">
            <p>Isi: Nama, Username, Password (min. 6 karakter), Telepon, Email, Kendaraan.</p>
          </Step>
          <Step num={3} title="Tap Edit untuk ubah data driver atau reset password" />
          <Step num={4} title="Driver yang memiliki laporan tidak bisa dihapus" />
          <Note>
            Username tidak bisa diubah setelah driver dibuat. Password bisa direset kapan saja oleh admin.
          </Note>

          <h3 className="font-bold text-gray-900 mb-3 mt-6">5. Master Data Admin</h3>
          <Step num={1} title="Buka menu Admin di sidebar" />
          <Step num={2} title="Tambah, edit, atau hapus akun admin lain" />
          <Warning>
            Akun admin yang sedang login tidak bisa dihapus oleh dirinya sendiri.
          </Warning>
        </Section>


        {/* ── Footer ── */}
        <footer className="border-t border-gray-200 pt-6 mt-4 text-center text-xs text-gray-400">
          <p>Truckinc Driver Reporting System · v1.0 · 2026</p>
          <p className="mt-1">Pertanyaan & bantuan teknis: hubungi tim IT Truckinc</p>
        </footer>

      </main>
    </div>
  );
}
