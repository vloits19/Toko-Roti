# Roti Lezat - Toko Roti Online

Website toko roti lengkap dengan fitur e-commerce, admin dashboard, dan sistem pembayaran.

## Fitur Utama

### Untuk Pelanggan (Public)
- **Home** - Hero section, produk unggulan, promo roti
- **Produk** - Grid produk roti dengan filter dan pencarian
- **Detail Produk** - Informasi lengkap produk dengan tambah ke keranjang
- **Lokasi** - Informasi toko dan cabang dengan peta
- **Tentang** - Cerita toko, visi misi, tim
- **Contact** - Form kontak yang tersimpan di database (bukan redirect WA)

### Untuk Pelanggan (Login)
- **Keranjang** - Tambah, hapus, update jumlah, hitung total otomatis
- **Checkout** - Pilih metode pembayaran, proses order
- **Pesanan Saya** - Riwayat dan status pesanan
- **Profil** - Edit profil dan ubah password

### Untuk Admin
- **Dashboard** - Statistik penjualan, total pesanan, grafik
- **Manajemen Produk** - Tambah, edit, hapus produk dengan upload gambar
- **Kelola Pesanan** - Update status pembayaran dan order
- **Pesan Masuk** - Baca dan balas pesan dari contact form

## Teknologi

### Frontend
- React 19 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- shadcn/ui (UI Components)
- React Router (Routing)

### Backend
- Node.js + Express
- SQLite (Database)
- JWT (Authentication)
- bcryptjs (Password hashing)
- Multer (File upload)

## Struktur Folder

```
app/
├── backend/
│   ├── controllers/     # Logic handlers
│   ├── database/        # DB connection & schema
│   ├── middleware/      # Auth, upload
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Payment service
│   └── server.js        # Entry point
├── public/images/       # Product images
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/        # Auth & Cart context
│   ├── pages/           # Page components
│   ├── services/        # API service
│   └── types/           # TypeScript types
└── uploads/             # Uploaded files
```

## Database Schema

### Tabel
- **users** - id, name, email, password, role
- **products** - id, name, price, description, image_url, category, stock, is_featured
- **orders** - id, user_id, total_price, payment_status, payment_method, order_status
- **order_items** - id, order_id, product_id, quantity, price
- **messages** - id, name, email, message, is_read
- **cart** - id, user_id, product_id, quantity

## Cara Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Backend
```bash
npm run server
# atau
node backend/server.js
```
Server berjalan di http://localhost:3001

### 3. Jalankan Frontend (Terminal baru)
```bash
npm run dev
```
Frontend berjalan di http://localhost:5173

### 4. Jalankan Keduanya Bersamaan
```bash
npm run dev:full
```

## Akun Demo

### Admin
- Email: `admin@rotilezat.com`
- Password: `admin123`

### User
- Register akun baru atau gunakan login setelah register

## Payment Gateway Integration

File: `backend/services/paymentService.js`

Saat ini menggunakan **Mock Payment System** untuk development. 

### Integrasi dengan Payment Gateway Nyata

#### Midtrans
```javascript
// 1. Install
npm install midtrans-client

// 2. Uncomment kode di paymentService.js
// 3. Set environment variables:
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
```

#### Xendit
```javascript
// 1. Install
npm install xendit-node

// 2. Uncomment kode di paymentService.js
// 3. Set environment variable:
XENDIT_SECRET_KEY=your_secret_key
```

#### Stripe
```javascript
// 1. Install
npm install stripe

// 2. Uncomment kode di paymentService.js
// 3. Set environment variable:
STRIPE_SECRET_KEY=your_secret_key
```

### Flow Pembayaran
1. User checkout → pilih metode pembayaran
2. Sistem memproses melalui `paymentService.createTransaction()`
3. Return redirect_url / payment_token sesuai provider
4. User menyelesaikan pembayaran di halaman provider
5. Webhook menerima notifikasi status pembayaran
6. Status order diupdate di database

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update quantity
- `DELETE /api/cart/remove` - Remove item
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/my-orders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Messages
- `GET /api/messages` - Get all messages (Admin)
- `POST /api/messages` - Send message (Public)
- `PUT /api/messages/:id/read` - Mark as read (Admin)

## Environment Variables

Buat file `.env` di root project:

```env
# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here

# Payment (opsional - untuk integrasi nyata)
# MIDTRANS_SERVER_KEY=
# MIDTRANS_CLIENT_KEY=
# XENDIT_SECRET_KEY=
# STRIPE_SECRET_KEY=
```

## Keamanan

- ✅ Password hashing dengan bcryptjs
- ✅ JWT untuk authentication & authorization
- ✅ Protected routes (frontend & backend)
- ✅ Role-based access control (Admin/User)
- ✅ Form validation
- ✅ SQL injection protection (parameterized queries)

## Customization

### Warna Tema
Edit `src/index.css`:
```css
:root {
  --primary: 35 85% 50%;  /* Adjust hue, saturation, lightness */
}
```

### Produk Default
Edit `backend/database/db.js` di fungsi `seedData()`

### Informasi Toko
Edit komponen:
- `src/pages/Location.tsx` - Alamat & jam buka
- `src/pages/About.tsx` - Cerita & tim
- `src/components/Footer.tsx` - Kontak & sosial media

## Deployment

### Build Frontend
```bash
npm run build
```

### Deploy Backend
```bash
# Production
NODE_ENV=production npm run server
```

### Deploy ke Vercel/Railway/Render
1. Push ke GitHub
2. Connect ke platform deploy
3. Set environment variables
4. Deploy!

## Lisensi

MIT License - Bebas digunakan untuk personal dan komersial.

---

Dibuat dengan ❤️ oleh Roti Lezat Team
