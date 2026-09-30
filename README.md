# Marsha Security — Project Workspace

Dokumentasi penggunaan platform manajemen task tugas akhir untuk koordinasi teknis antara **Aditya Rahman** dan **Fahristi Dewi Khadijah**.

Aplikasi ini menggunakan arsitektur monolitik modern berbasis **Laravel 12**, **Inertia.js**, dan **React** dengan komponen visual **shadcn/ui**, styling **Tailwind CSS**, serta database **MariaDB**.

---

## 1. Kredensial & Autentikasi

Aplikasi menggunakan autentikasi internal tertutup (*closed access*). Registrasi publik dinonaktifkan untuk menjaga keamanan data tugas akhir.

Tabel akun terdaftar:

| Nama Pengguna | Email Workspace | Kata Sandi | Peran |
| :--- | :--- | :--- | :--- |
| **Aditya Rahman** | `marshaSec@adit.ta` | `12345678` | Security Architect |
| **Fahristi Dewi Khadijah** | `marshaSec@risti.ta` | `fdk321` | Project Manager |

### Alur Masuk:
1. Akses rute `/login`.
2. Masukkan **Email Workspace** dan kata sandi akun Anda (kolom input bersih tanpa teks placeholder).
3. Klik tombol **Sign In**.

---

## 2. Hak Akses & Pembagian Tanggung Jawab

Sistem menerapkan otorisasi ketat berbasis penanggung jawab (*Assignee-Based Authorization*):

* **Visibilitas Dua Arah:**
  Aditya dan Fahristi dapat memantau seluruh task pada papan Kanban dan List View untuk sinkronisasi progres riset harian.

* **Otorisasi Khusus Assignee (Assignee-Only Mutation):**
  * Task milik **Fahristi** hanya dapat diperbarui statusnya, diedit tab/deskripsinya, atau dihapus oleh **Fahristi**.
  * Task milik **Aditya** hanya dapat diperbarui statusnya, diedit tab/deskripsinya, atau dihapus oleh **Aditya**.
  * Permintaan mutasi tanpa otorisasi akan diblokir oleh backend dengan status HTTP `403 Forbidden`.

* **Mode Tinjau (Read-Only):**
  Saat membuka task milik rekan, modal otomatis terkunci dalam mode baca. Tombol perubahan status dan form edit disembunyikan.

* **Thread Komentar Terbuka:**
  Kedua pihak dapat menambahkan catatan evaluasi dan feedback teknis pada task milik rekan maupun task sendiri.

---

## 3. Fitur Utama & Panduan Penggunaan

### A. Dynamic Workstream Tabs & Aktivitas Tugas

Setiap task diorganisir menggunakan tab kerja dinamis (*workstreams*) sehingga aktivitas dan dokumen referensi tidak tercampur:

1. **Preset Default Tab:**
   Saat membuat task baru, sistem menyediakan 3 tab awal:
   * **UI/UX**: Untuk pekerjaan antarmuka, wireframe, dan usability testing.
   * **Coding**: Untuk implementasi kode program, arsitektur backend, dan integrasi API.
   * **Design System**: Untuk standardisasi token desain, warna, dan komponen visual.

2. **Pengelolaan Tab Dinamis:**
   * **Tambah Tab (+ Add Tab)**: Pengguna dapat menambahkan tab baru sesuai kebutuhan modul tugas akhir (misal: *Dataset*, *Pengujian Akurasi*, *Bab 4 Evaluasi*).
   * **Ubah Nama Tab**: Klik nama tab untuk mengedit label kerja.
   * **Hapus Tab**: Tab yang tidak relevan dapat dihapus menggunakan tombol hapus pada tab tersebut.

3. **Input Item Aktivitas ("Lagi Ngapain"):**
   * Di dalam setiap tab, pengguna dapat memasukkan rincian pekerjaan secara bertahap menggunakan tombol **+ Add Item**.
   * Contoh: Pada tab *Coding*, item dapat berisi "Konfigurasi JWT middleware" dan "Buat seed database pengguna".

4. **Input Dokumen Referensi:**
   * Setiap tab memiliki kolom tautan sendiri melalui tombol **+ Add Link**.
   * Masukkan URL dokumen penting seperti repositori GitHub, lembar kerja Overleaf, Google Docs, atau file Figma.

---

### B. Dialog Detail Task

Mengklik kartu task pada board atau list membuka dialog rincian lengkap:
* **Tab Switcher Interaktif**: Berpindah antar-tab untuk melihat rincian aktivitas dan tautan referensi per kategori kerja beserta indikator jumlah item.
* **Tautan Langsung**: Tautan referensi dapat langsung dibuka via peramban pada jendela baru.
* **Tombol Edit Tabs & Items**: Assignee dapat memperbarui isi tab, menambah rincian aktivitas baru, atau menyunting tautan referensi kapan saja.

---

### C. Alur Status Pekerjaan

Assignee memperbarui progres pekerjaan melalui status lifecycle:
* **Todo**: Task terdaftar dan menunggu giliran pengerjaan.
* **In Progress**: Task sedang aktif dikerjakan.
* **In Revision**: Task memerlukan perbaikan. Form mewajibkan input ringkasan catatan revisi yang harus ditindaklanjuti.
* **Completed**: Task tuntas dikerjakan. Sistem otomatis merekam timestamp tanggal dan waktu penyelesaian.

---

### D. Sistem Notifikasi Header

Bilah navigasi atas dilengkapi lonceng notifikasi interaktif:
* **Task Assignment**: Peringatan instan muncul saat rekan mendelegasikan atau mengalihkan task kepada Anda.
* **Komentar Masuk**: Peringatan muncul saat rekan memberikan komentar pada task yang Anda kerjakan atau delegasikan.
* **Tindakan Cepat**: Mengklik item notifikasi otomatis menandai pesan sebagai terbaca (*read*) dan mengarahkan ke task terkait. Tombol **Mark all read** tersedia untuk membersihkan antrean notifikasi secara serentak.

---

### E. Navigasi & Filter Workspace

* **Filter Scope (Sidebar):**
  * `All Project Tasks`: Menampilkan seluruh aktivitas proyek tugas akhir.
  * `Assigned to Me`: Memfilter task yang menjadi tanggung jawab Anda sendiri.
  * `Assigned by Me`: Memfilter task yang Anda delegasikan kepada rekan.
* **Filter Dinamis (Bilah Atas):**
  * Filter berdasarkan kategori modul.
  * Filter tingkat prioritas (*Low*, *Medium*, *High*, *Urgent*).
  * Pencarian teks cepat untuk judul, kategori, dan rincian kerja.
* **Tata Letak:**
  * **Board View**: Visualisasi kartu tugas berbasis kolom status Kanban.
  * **List View**: Tampilan tabel ringkas untuk audit cepat.

---

### F. Personalisasi & Lingkungan Kerja

* **Dark / Light Mode**: Tombol toggle tema pada sidebar menyimpan preferensi ke `localStorage`.
* **Kutipan Motivasi Sesi**: Menampilkan 1 kutipan inspiratif figur teknologi terkemuka dunia per sesi login, tersimpan di `sessionStorage` agar tidak berulang atau mengganggu fokus.

---

## 4. Menjalankan Aplikasi di Lingkungan Lokal

Pastikan service MariaDB telah berjalan pada port default `3306`, lalu jalankan server pengembangan:

```bash
# Terminal 1: Backend Server
php artisan serve

# Terminal 2: Asset Bundler
npm run dev
```

Buka peramban dan akses alamat:
```
http://127.0.0.1:8000
```

Untuk memverifikasi fungsionalitas dan integritas sistem:
```bash
php artisan test
npm run build
```
