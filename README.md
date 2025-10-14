# 🍽️ MiniRestoo Project

Selamat datang di **MiniRestoo**!  
Ini adalah sistem **backend** untuk aplikasi restoran mini yang dibangun menggunakan **arsitektur microservices** dengan **Docker**.

---

## Detail Proyek

Proyek ini dibangun di atas satu **Git repository (monorepo)** untuk menyederhanakan pengembangan dan kolaborasi.  
Setiap service memiliki **tanggung jawab tunggal** dan berjalan di dalam container Docker-nya sendiri, berkomunikasi melalui jaringan internal.

###  Daftar Service
| Service | Deskripsi |
|----------|------------|
|  **inventory-management** | Mengelola stok bahan baku. |
|  **product-management** | Mengelola data menu/produk yang dijual. |
|  **operasional** | Mengelola proses bisnis inti seperti pesanan dan transaksi. |

---

##  Prasyarat

Sebelum memulai, pastikan perangkatmu sudah terinstal:

- [x] **Git** — Untuk manajemen kode sumber.  
- [x] **Docker & Docker Compose** — Untuk menjalankan aplikasi dalam container.  
  > 💡 Pastikan Docker Desktop sedang berjalan sebelum menjalankan perintah apapun.

---

## Panduan Setup & Menjalankan Proyek

Langkah-langkah ini hanya perlu dilakukan **sekali** saat pertama kali menyiapkan proyek di komputermu.

### [x] Clone Repository
```bash
git clone [URL_REPOSITORY_GIT_KAMU]
cd minirestoo
```

### [x] Gunakan docker-compose untuk mengorkestrasi semua service.
```bash
docker-compose up --build product-management
```
untuk menjalankan semua services sekaligus, pakai:

```bash
docker-compose up --build
```
### Untuk menghentikan semua container yang sedang berjalan:
Tekan Ctrl + C di terminal tempat kamu menjalankan docker-compose up.

## Struktur foldering kita:

```bash
minirestoo/
├── .gitignore               # Daftar file yang diabaikan oleh Git
├── docker-compose.yml       # File utama untuk orkestrasi Docker
├── README.md                # Dokumentasi yang sedang kamu baca
│
├── inventory-management/    # Folder untuk service inventory
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│
├── product-management/      # Folder untuk service product
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│
└── operasional/             # Folder untuk service operasional
    └── ...

```

### Workflow & Aturan main kita:
- Selalu buat branch baru dari main.
```bash
git checkout main
git pull origin main
git checkout -b feature/nama-fitur-yang-deskriptif
```
- Kerjakan tugas & commit secara berkala.
- Buat Pull Request (PR) ke branch main setelah selesai.
- Tag setidaknya satu anggota tim untuk me-review kodemu.
- ⚠️ Dilarang keras push langsung ke main tanpa review!

## Endpoint API & Uji Coba:
- GET /api/products — Melihat Semua Produk, gunanya ya mendapatkan daftar semua produk yang ada di database.
> Metode: GET

> URL:
>> http://localhost:3002/api/products

Contoh Respons Sukses:
```bash
[
  {
    "id": 1,
    "name": "Nasi Goreng Spesial",
    "price": "25000.00",
    "description": "Nasi goreng dengan telur, ayam, dan bakso.",
    "created_at": "..."
  }
]
```

- POST /api/products — Membuat Produk Baru, Menambahkan produk baru ke dalam database.
> Metode: POST
>> URL: http://localhost:3002/api/products
>>>Cara Tes: Gunakan curl, Postman, atau Insomnia.

Body Request (JSON):
```bash
{
  "name": "Es Teh Manis",
  "price": 5000,
  "description": "Teh segar disajikan dingin dengan gula."
}
```

Contoh Perintah curl:
```bash
curl -X POST http://localhost:3002/api/products \
-H "Content-Type: application/json" \
-d '{"name": "Es Teh Manis", "price": 5000, "description": "Teh segar disajikan dingin dengan gula."}'
```

Contoh Respons Sukses:
```bash
{
  "id": 2,
  "name": "Es Teh Manis",
  "price": "5000.00",
  "description": null,
  "created_at": "..."
}
```

# Catatan Akhir
> Dokumentasi ini akan terus diperbarui seiring perkembangan proyek, jadi kalo kalian mau jelasin sesuatu, taruh sini aja ya :D
>> Selamat berkontribusi & happy coding, mentemen :D! 🎉
