# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

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
Team:
- Hen: product-management.
1. Lengkapi CRUD Products:
2. Buat endpoint GET /api/products/:id untuk mengambil satu produk spesifik.
3. Buat endpoint PUT /api/products/:id untuk mengedit detail produk (nama, harga, deskripsi).
4. Buat endpoint DELETE /api/products/:id untuk menghapus produk.
5. Implementasi Resep (Recipes):
6. Buat endpoint POST /api/products/:id/recipes untuk menambahkan bahan baku ke sebuah produk (menghubungkan product_id dengan material_id dan quantity_needed).
7. Buat endpoint GET /api/products/:id/recipes untuk melihat semua bahan baku yang dibutuhkan untuk sebuah produk.
8. Buat endpoint DELETE /api/products/:id/recipes/:material_id untuk menghapus satu bahan baku dari resep.
9. Menambahkan Validasi: memastikan semua input dari request body (misalnya, harga harus angka, nama tidak boleh kosong) divalidasi dengan benar sebelum diproses.
---
- Ade: operasional.
1. Setup Awal Service:
2. Lakukan setup awal seperti Developer B (buat folder, Dockerfile, aplikasi dasar, tambahkan ke docker-compose.yml).
3. Pastikan service ini bisa melakukan request ke service lain menggunakan fetch atau axios dari dalam jaringan Docker (misal: memanggil http://product-management:3002/api/products).
4. Implementasi Alur Pembuatan Pesanan (POST /api/orders):
5. Buat fungsi inisialisasi database untuk membuat tabel orders dan order_items.
6. Buat endpoint POST /api/orders. Ini adalah alur utama yang sudah kita rancang di flowchart:
7. Terima pesanan dari client (berisi daftar product_id dan quantity).
8. Untuk setiap item di pesanan, panggil API GET /api/products/:id dari Service Product untuk mendapatkan harga dan resepnya.
9. Hitung total harga pesanan.
10. Untuk setiap bahan baku di resep, panggil API dari Service Inventory untuk mengurangi stok.
11. Jika semua proses di atas berhasil, simpan data ke tabel orders dan order_items.
12. Kirim balasan sukses ke client.
13. Implementasi Pembacaan Pesanan:
14. Buat endpoint GET /api/orders dan GET /api/orders/:id untuk melihat riwayat pesanan.
---
- Danendra: inventory-management.
1. Setup Awal Service:
2. Buat struktur folder inventory-management (bisa mencontoh product-management).
3. Buat Dockerfile dan aplikasi Express "Hello World" awal.
4. Tambahkan service ini ke docker-compose.yml.
5. Implementasi CRUD Bahan Baku (Raw Materials):
6. Buat fungsi inisialisasi database untuk membuat tabel raw_materials dan stock_transactions.
7. Buat endpoint POST /api/inventory/materials untuk menambah bahan baku baru.
8. Buat endpoint GET /api/inventory/materials untuk melihat semua bahan baku dan stoknya.
9. Buat endpoint PUT /api/inventory/materials/:id untuk mengedit detail bahan baku (nama, satuan).
10. Implementasi Transaksi Stok (Stock Transactions):
11. Buat endpoint POST /api/inventory/stock-in untuk mencatat penambahan stok (misal: setelah belanja). Endpoint ini harus menambah quantity_on_hand di raw_materials DAN mencatat transaksi di stock_transactions dengan tipe in.
12. Buat endpoint internal yang akan dipanggil oleh Service Operasional untuk mengurangi stok (ini akan menjadi tugas selanjutnya setelah dasarnya jadi).
---
- Khrisna: Frontend
---
Ini adalah keputusan final untuk arsitektur, alur, dan API Contract proyek "minirestoo". Patuhi ini agar proyek berjalan lancar ya guys.
-----

### \#\# 1. Penetapan Port Final

Untuk menghindari kebingungan, kita tetapkan port untuk setiap service.

  * **Product Management**: `3002`
  * **Inventory Management**: `3001`
  * **Operasional**: `3003`
  * **Frontend (jika ada)**: `3000`
  * **Database (PostgreSQL)**: `5432`
  * **API Gateway (Nginx)**: `80` (Ini adalah pintu masuk utama)

-----

### \#\# 2. Alur Kerja Utama: "Membuat Pesanan Baru"

Ini adalah alur paling penting yang mengikat semua service.

1.  **Frontend** mengirim request ke **API Gateway** (`POST /api/orders`) dengan data pesanan.
2.  **API Gateway** meneruskan request ke **Service Operasional** (`port 3003`).
3.  **Service Operasional** menerima request. Untuk setiap item pesanan, ia melakukan:
    a. Memanggil `GET http://product-management:3002/api/products/:id` untuk mendapatkan **harga** dan **resep**.
    b. Jika ada produk yang tidak ditemukan, seluruh transaksi gagal dan kirim error 404.
4.  Setelah semua data produk dan resep terkumpul, **Service Operasional** menyiapkan data untuk pengurangan stok.
5.  **Service Operasional** memanggil `POST http://inventory-management:3001/api/inventory/stock-out` dengan mengirimkan daftar bahan baku yang perlu dikurangi.
6.  **Service Inventory** mencoba mengurangi stok.
    a. Jika stok cukup, ia update database dan membalas sukses.
    b. Jika stok kurang, ia membalas error 400 dan seluruh transaksi di **Service Operasional** dibatalkan (*rollback*).
7.  Jika pengurangan stok berhasil, **Service Operasional** menyimpan data final ke tabel `orders` dan `order_items`.
8.  **Service Operasional** mengirim respons sukses (201 Created) kembali ke client.

-----

### \#\# 3. Master API Contract (Final)

Ini adalah kontrak final yang harus dipatuhi oleh setiap developer.

#### **Developer A: Service `product-management` (Port: 3002)**

Anda fokus pada semua yang berhubungan dengan produk dan resepnya.

  * `GET /api/products`: Mengambil semua produk.
  * `POST /api/products`: Membuat produk baru.
      * **Body**: `{ "name": "...", "price": ..., "description": "..." }`
  * `GET /api/products/:id`: Mengambil satu produk (ini yang dipanggil Service Operasional).
      * **Respons Wajib**:
        ```json
        {
          "id": 1, "name": "...", "price": "...", "description": "...",
          "recipes": [
            { "material_id": 10, "name": "...", "quantity_needed": 200, "unit": "gram" }
          ]
        }
        ```
  * `PUT /api/products/:id`: Update produk.
  * `DELETE /api/products/:id`: Hapus produk.
  * `POST /api/products/:id/recipes`: Menambah/mengubah resep untuk sebuah produk.
      * **Body**: `{ "material_id": ..., "quantity_needed": ... }`

#### **Developer B: Service `inventory-management` (Port: 3001)**

Anda fokus pada semua yang berhubungan dengan bahan baku dan stok.

  * `GET /api/inventory/materials`: Mengambil semua bahan baku & stoknya.
  * `POST /api/inventory/materials`: Menambah bahan baku baru.
  * `POST /api/inventory/stock-in`: Menambah stok (misal: habis belanja).
      * **Body**: `{ "material_id": ..., "quantity": ... }`
  * `POST /api/inventory/stock-out`: Mengurangi stok (ini yang dipanggil Service Operasional).
      * **Request Body Wajib**:
        ```json
        {
          "order_id": 123,
          "items": [ { "material_id": 10, "quantity": 200 } ]
        }
        ```
      * **Respons Sukses**: `{ "status": "success", "message": "..." }`
      * **Respons Gagal (Stok Kurang)**: `{ "status": "error", "message": "Insufficient stock for..." }`
  * `GET /api/inventory/transactions`: Melihat riwayat transaksi stok.

#### **Developer C: Service `operasional` (Port: 3003)**

Anda adalah "otak" yang menghubungkan semuanya. Anda **tidak membuat banyak endpoint**, tapi **memanggil endpoint** dari service lain.

  * `POST /api/orders`: Membuat pesanan baru (mengikuti alur kerja utama di atas).
      * **Body**: `{ "items": [ { "product_id": 1, "quantity": 2 } ] }`
      * **Respons Sukses**: Data pesanan yang baru dibuat.
  * `GET /api/orders`: Melihat semua riwayat pesanan.
  * `GET /api/orders/:id`: Melihat detail satu pesanan.
  * `PUT /api/orders/:id/status`: Mengubah status pesanan (misal: dari `pending` ke `completed`).
      * **Body**: `{ "status": "completed" }`

Ini adalah panduan lengkapnya. Semua sudah ditentukan. Sekarang tim bisa fokus bekerja pada service masing-masing dengan acuan yang sama. Selamat bekerja\! 🚀
> Dokumentasi ini akan terus diperbarui seiring perkembangan proyek, jadi kalo kalian mau jelasin sesuatu, taruh sini aja ya :D
>> Selamat berkontribusi & happy coding, mentemen :D! 🎉
