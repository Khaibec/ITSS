# Hướng Dẫn Chạy Frontend - MAJIWAKARU

## 🚀 Cách Chạy Frontend

### Cách 1: Chạy Thủ Công (Khuyến nghị)

#### Bước 1: Mở 2 Terminal Windows

**Terminal 1 - Backend:**
```powershell
cd C:\Users\Admin\Desktop\ITSS-JP-7\ITSS\be
npm run start:dev
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\Admin\Desktop\ITSS-JP-7\ITSS\fe
npm run dev
```

#### Bước 2: Đợi Server Khởi Động

**Backend sẽ hiển thị:**
```
Application (HTTP API) is running on: http://localhost:3000
WebSocket (Socket.IO) is listening on namespace /chat at http://localhost:3000/chat
```

**Frontend sẽ hiển thị:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5175/
  ➜  Network: use --host to expose
```

#### Bước 3: Mở Browser

Truy cập: **http://localhost:5175**

---

### Cách 2: Dùng Script PowerShell

```powershell
cd C:\Users\Admin\Desktop\ITSS-JP-7\ITSS\fe
.\start-dev.ps1
```

---

## 🔍 Troubleshooting

### Lỗi: Port 5175 đã được sử dụng

**Giải pháp:**
- Vite sẽ tự động chọn port khác (5176, 5177...)
- Xem terminal để biết port chính xác
- Hoặc kill process đang dùng port 5175:
  ```powershell
  netstat -ano | findstr :5175
  taskkill /PID <PID> /F
  ```

### Lỗi: Cannot find module

**Giải pháp:**
```powershell
cd C:\Users\Admin\Desktop\ITSS-JP-7\ITSS\fe
npm install
```

### Lỗi: Backend không kết nối được

**Kiểm tra:**
1. Backend có đang chạy tại `http://localhost:3000` không?
2. Database PostgreSQL có đang chạy không?
3. File `.env` trong `be/` có đúng không?

### Lỗi: CORS error

**Kiểm tra:**
- Backend đã enable CORS chưa? (Đã có trong `main.ts`)
- Backend đang chạy đúng port 3000 không?

---

## 📋 Checklist Trước Khi Test

- [ ] Backend đang chạy tại `http://localhost:3000`
- [ ] Database PostgreSQL đang chạy
- [ ] Frontend dependencies đã được cài đặt (`npm install`)
- [ ] Frontend dev server đang chạy
- [ ] Browser có thể truy cập `http://localhost:5175`

---

## 🧪 Test Cases

### 1. Test Đăng Nhập
- Email: `a.nguyen@example.com`
- Password: `password123`
- ✅ Sau khi đăng nhập, redirect đến `/chatbox/groups`

### 2. Test Group List Dashboard
- ✅ Welcome box hiển thị với red border
- ✅ Sidebar navigation hiển thị đúng
- ✅ Group cards hiển thị đúng
- ✅ Unread badges hiển thị (nếu có)
- ✅ Time ago format đúng

### 3. Test Navigation
- ✅ Click group card → Navigate đến chat interface
- ✅ Click "グループ一覧" → Quay lại dashboard

---

## 📞 Nếu Vẫn Gặp Vấn Đề

1. Kiểm tra console trong browser (F12)
2. Kiểm tra Network tab để xem API calls
3. Kiểm tra terminal để xem error messages
4. Đảm bảo cả backend và frontend đều đang chạy

---

**Chúc bạn test thành công! 🎉**

