# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN MAJIWAKARU

Hướng dẫn chi tiết từng bước để chạy Backend và Frontend.

---

## 📋 YÊU CẦU TRƯỚC KHI BẮT ĐẦU

### 1. Kiểm tra phần mềm đã cài đặt:
- ✅ **Node.js** >= 18.x (kiểm tra: `node --version`)
- ✅ **PostgreSQL** >= 14.x (kiểm tra: `psql --version`)
- ✅ **npm** >= 9.x (kiểm tra: `npm --version`)

### 2. Đảm bảo PostgreSQL đang chạy:
- Windows: Kiểm tra trong Services hoặc Task Manager
- Hoặc chạy lệnh: `pg_ctl status` (nếu có trong PATH)

---

## 🔧 BƯỚC 1: SETUP BACKEND

### 1.1. Di chuyển vào thư mục backend
```powershell
cd be
```

### 1.2. Cài đặt dependencies (nếu chưa cài)
```powershell
npm install
```

### 1.3. Kiểm tra file .env
Đảm bảo file `be/.env` có các biến sau:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/majiwakaru"
JWT_SECRET="your-secret-key-here-change-this-in-production"
PORT=3000
GOOGLE_STUDIO_API_KEY="your-api-key-if-using-ai-features"
GOOGLE_MODEL_NAME="gemini-2.5-flash"
```

**Lưu ý:** 
- Thay `user`, `password`, và `majiwakaru` bằng thông tin database của bạn
- `JWT_SECRET` nên là một chuỗi ngẫu nhiên, bảo mật

### 1.4. Generate Prisma Client
```powershell
npm run prisma:generate
```

### 1.5. Chạy migrations (tạo bảng trong database)
```powershell
npm run prisma:migrate
```

Nếu có lỗi, thử:
```powershell
npm run prisma:push
```

### 1.6. Seed database (tạo dữ liệu test)
```powershell
npm run prisma:seed
```

### 1.7. Chạy Backend
```powershell
npm run start:dev
```

**Kết quả mong đợi:**
- Terminal sẽ hiển thị: `Application (HTTP API) is running on: http://localhost:3000`
- Terminal sẽ hiển thị: `WebSocket (Socket.IO) is listening on namespace /chat at http://localhost:3000/chat`
- Không có lỗi màu đỏ

**Kiểm tra Backend đã chạy:**
- Mở trình duyệt: http://localhost:3000
- Hoặc test API: http://localhost:3000/auth/login (sẽ trả về lỗi validation, nhưng chứng tỏ server đang chạy)

---

## 🎨 BƯỚC 2: SETUP FRONTEND

### 2.1. Mở terminal mới (giữ terminal Backend đang chạy)

### 2.2. Di chuyển vào thư mục frontend
```powershell
cd fe
```

### 2.3. Cài đặt dependencies (nếu chưa cài)
```powershell
npm install
```

### 2.4. (Tùy chọn) Tạo file .env
Nếu muốn thay đổi API URL, tạo file `fe/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

**Lưu ý:** Nếu không có file `.env`, frontend sẽ mặc định dùng `http://localhost:3000`

### 2.5. Chạy Frontend
```powershell
npm run dev
```

**Kết quả mong đợi:**
- Terminal sẽ hiển thị: `Local: http://localhost:5175` (hoặc port khác)
- Không có lỗi màu đỏ
- Tự động mở trình duyệt

**Kiểm tra Frontend đã chạy:**
- Mở trình duyệt: http://localhost:5175 (hoặc port được hiển thị trong terminal)

---

## ✅ BƯỚC 3: KIỂM TRA ỨNG DỤNG

### 3.1. Đăng nhập
Sử dụng một trong các tài khoản test sau:

| Email | Password | Mô tả |
|-------|----------|-------|
| `a.nguyen@example.com` | `password123` | User Việt Nam |
| `b.tran@example.com` | `password123` | User Việt Nam |
| `taro.yamada@example.jp` | `password123` | User Nhật Bản |
| `hanako.suzuki@example.jp` | `password123` | User Nhật Bản |

### 3.2. Kiểm tra các tính năng:
- ✅ Đăng nhập thành công
- ✅ Hiển thị danh sách chat boxes
- ✅ Xem được tin nhắn trong các group
- ✅ Giao diện hiển thị đẹp, không có lỗi console

---

## 🛠️ XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: "Database connection failed"
**Nguyên nhân:** PostgreSQL chưa chạy hoặc DATABASE_URL sai

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy:
   ```powershell
   # Windows: Kiểm tra trong Services
   services.msc
   ```
2. Kiểm tra DATABASE_URL trong `be/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/majiwakaru"
   ```
3. Tạo database nếu chưa có:
   ```powershell
   psql -U postgres
   CREATE DATABASE majiwakaru;
   \q
   ```

### ❌ Lỗi: "Port 3000 is already in use"
**Nguyên nhân:** Port 3000 đã được sử dụng bởi ứng dụng khác

**Giải pháp:**
1. Tìm process đang dùng port 3000:
   ```powershell
   netstat -ano | findstr :3000
   ```
2. Hoặc thay đổi PORT trong `be/.env`:
   ```env
   PORT=3001
   ```
3. Nhớ cập nhật `VITE_API_BASE_URL` trong `fe/.env` nếu đổi port

### ❌ Lỗi: "Cannot find module '@prisma/client'"
**Nguyên nhân:** Prisma Client chưa được generate

**Giải pháp:**
```powershell
cd be
npm run prisma:generate
```

### ❌ Lỗi: "Table does not exist"
**Nguyên nhân:** Chưa chạy migrations

**Giải pháp:**
```powershell
cd be
npm run prisma:migrate
# Hoặc
npm run prisma:push
```

### ❌ Frontend không kết nối được với Backend
**Nguyên nhân:** Backend chưa chạy hoặc CORS error

**Giải pháp:**
1. Đảm bảo Backend đang chạy (kiểm tra terminal)
2. Kiểm tra URL trong `fe/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```
3. Kiểm tra Console trong trình duyệt (F12) để xem lỗi chi tiết

### ❌ Lỗi: "401 Unauthorized"
**Nguyên nhân:** Token hết hạn hoặc không hợp lệ

**Giải pháp:**
1. Đăng xuất và đăng nhập lại
2. Xóa localStorage (F12 → Application → Local Storage → Clear)

---

## 📝 CÁC LỆNH HỮU ÍCH

### Backend
```powershell
cd be

# Development
npm run start:dev          # Chạy với watch mode (tự động reload khi code thay đổi)

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Chạy migrations
npm run prisma:push        # Push schema trực tiếp (không tạo migration)
npm run prisma:seed        # Seed database với dữ liệu test
npm run prisma:studio      # Mở Prisma Studio (GUI để xem database)

# Build
npm run build              # Build production
npm run start:prod         # Chạy production build
```

### Frontend
```powershell
cd fe

# Development
npm run dev                # Chạy dev server

# Build
npm run build              # Build production
npm run preview            # Preview production build
```

---

## 🎯 TÓM TẮT QUY TRÌNH CHẠY

### Lần đầu tiên:
1. ✅ Cài đặt Node.js, PostgreSQL
2. ✅ Tạo database PostgreSQL
3. ✅ Tạo file `be/.env` với DATABASE_URL, JWT_SECRET
4. ✅ `cd be && npm install`
5. ✅ `npm run prisma:generate`
6. ✅ `npm run prisma:migrate`
7. ✅ `npm run prisma:seed`
8. ✅ `npm run start:dev` (giữ terminal này chạy)
9. ✅ Mở terminal mới: `cd fe && npm install`
10. ✅ `npm run dev`
11. ✅ Mở trình duyệt: http://localhost:5175

### Các lần sau (khi đã setup xong):
1. ✅ `cd be && npm run start:dev` (terminal 1)
2. ✅ `cd fe && npm run dev` (terminal 2)
3. ✅ Mở trình duyệt và sử dụng

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. ✅ PostgreSQL đang chạy
2. ✅ File `.env` có đúng cấu hình
3. ✅ Dependencies đã được cài đặt (`node_modules` tồn tại)
4. ✅ Prisma Client đã được generate
5. ✅ Migrations đã được chạy
6. ✅ Console trong trình duyệt (F12) để xem lỗi chi tiết

**Chúc bạn code vui vẻ! 🎉**

