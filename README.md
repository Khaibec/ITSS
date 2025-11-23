# MAJIWAKARU - Japanese Learning Chat Platform

Ứng dụng chat học tiếng Nhật với giao diện hiện đại, hỗ trợ real-time messaging và quản lý nhóm chat.

## 📋 Mục Lục

1. [Giới Thiệu](#giới-thiệu)
2. [Cấu Trúc Project](#cấu-trúc-project)
3. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
4. [Cài Đặt và Chạy](#cài-đặt-và-chạy)
5. [Tài Khoản Test](#tài-khoản-test)
6. [Tính Năng](#tính-năng)
7. [Cấu Trúc Code](#cấu-trúc-code)
8. [API Endpoints](#api-endpoints)
9. [Troubleshooting](#troubleshooting)
10. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

---

## 🎯 Giới Thiệu

**MAJIWAKARU** là một nền tảng chat học tiếng Nhật được xây dựng với:
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: NestJS + PostgreSQL + Prisma
- **Real-time**: Socket.IO cho chat real-time
- **Authentication**: JWT-based authentication

---

## 📁 Cấu Trúc Project

```
ITSS/
├── fe/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (AuthContext)
│   │   ├── services/   # API services
│   │   └── utils/      # Utility functions
│   └── package.json
│
├── be/                 # Backend (NestJS)
│   ├── src/
│   │   ├── auth/       # Authentication module
│   │   ├── chat/       # Chat & WebSocket module
│   │   ├── chat-boxes/ # Chat boxes API
│   │   ├── prisma/     # Prisma service
│   │   └── main.ts     # Entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data
│   ├── postman/        # Postman collection
│   └── package.json
│
└── README.md           # File này
```

---

## 💻 Yêu Cầu Hệ Thống

### Backend
- **Node.js**: >= 18.x
- **PostgreSQL**: >= 14.x
- **npm**: >= 9.x

### Frontend
- **Node.js**: >= 18.x
- **npm**: >= 9.x

---

## 🚀 Cài Đặt và Chạy

### 1. Clone Repository

```bash
git clone <repository-url>
cd ITSS
```

### 2. Setup Backend

```bash
# Di chuyển vào thư mục backend
cd be

# Cài đặt dependencies
npm install

# Tạo file .env
# Copy nội dung từ .env.example (nếu có) hoặc tạo mới:
# DATABASE_URL="postgresql://user:password@localhost:5432/majiwakaru"
# JWT_SECRET="your-secret-key-here"
# PORT=3000

# Generate Prisma Client
npm run prisma:generate

# Chạy migrations
npm run prisma:migrate

# Seed database (tạo dữ liệu test)
npm run prisma:seed

# Chạy backend (development mode)
npm run start:dev
```

Backend sẽ chạy tại: **http://localhost:3000**

### 3. Setup Frontend

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd fe

# Cài đặt dependencies
npm install

# (Tùy chọn) Tạo file .env nếu muốn thay đổi API URL
# VITE_API_BASE_URL=http://localhost:3000
# Nếu không có file .env, mặc định sẽ dùng http://localhost:3000

# Chạy frontend (development mode)
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5175** (hoặc port khác nếu 5175 đã được sử dụng)

---

## 👤 Tài Khoản Test

Sau khi chạy seed database, bạn có thể sử dụng các tài khoản sau để đăng nhập:

| Email | Password | Mô tả |
|-------|----------|-------|
| `a.nguyen@example.com` | `password123` | User Việt Nam |
| `b.tran@example.com` | `password123` | User Việt Nam |
| `taro.yamada@example.jp` | `password123` | User Nhật Bản |
| `hanako.suzuki@example.jp` | `password123` | User Nhật Bản |

---

## ✨ Tính Năng

### ✅ Đã Hoàn Thành

- **Authentication**
  - Đăng nhập với email/password
  - JWT token authentication
  - Auto-logout khi token hết hạn

- **Chat Boxes**
  - Hiển thị danh sách groups mà user tham gia
  - Hiển thị tin nhắn mới nhất của mỗi group
  - Đếm số tin nhắn chưa đọc (unread count)
  - Sắp xếp theo thời gian tin nhắn mới nhất

- **Messages**
  - Xem 40 tin nhắn gần nhất trong mỗi group
  - Hiển thị thông tin người gửi
  - Hiển thị thời gian gửi

- **UI/UX**
  - Giao diện hiện đại với TailwindCSS
  - Responsive design
  - Loading states
  - Error handling

### 🚧 Đang Phát Triển

- Gửi tin nhắn mới
- Real-time message updates (WebSocket)
- Đánh dấu tin nhắn đã đọc
- Tạo group mới
- Thêm/xóa thành viên

---

## 📂 Cấu Trúc Code

### Frontend (`fe/src/`)

```
src/
├── components/
│   ├── auth/
│   │   └── Login.jsx          # Component đăng nhập
│   └── chatbox/
│       ├── ChatLayout.jsx     # Layout chính của chat
│       ├── GroupList.jsx      # Danh sách groups (sidebar)
│       ├── ChatArea.jsx       # Khu vực chat chính
│       ├── MessageList.jsx    # Danh sách tin nhắn
│       └── MessageItem.jsx     # Component hiển thị 1 tin nhắn
│
├── contexts/
│   └── AuthContext.jsx        # Context quản lý authentication state
│
├── services/
│   └── api.js                 # API service (axios wrapper)
│
├── utils/
│   └── jwt.js                 # Utility để decode JWT token
│
├── App.jsx                     # Root component
└── main.jsx                    # Entry point
```

### Backend (`be/src/`)

```
src/
├── auth/
│   ├── auth.controller.ts     # Auth endpoints (login, register)
│   ├── auth.service.ts        # Auth business logic
│   ├── auth.guard.ts          # JWT guard
│   └── jwt.strategy.ts        # Passport JWT strategy
│
├── chat/
│   ├── chat.controller.ts     # Chat endpoints
│   ├── chat.service.ts        # Chat business logic
│   └── chat.gateway.ts        # WebSocket gateway (Socket.IO)
│
├── chat-boxes/
│   ├── chat-boxes.controller.ts  # Chat boxes endpoints
│   └── chat-boxes.service.ts     # Chat boxes business logic
│
├── prisma/
│   └── prisma.service.ts      # Prisma service (database access)
│
└── main.ts                    # Application entry point
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/auth/login` | Đăng nhập | ❌ |
| POST | `/auth/register` | Đăng ký | ❌ |
| GET | `/auth/profile` | Lấy thông tin user | ✅ |

### Chat Boxes

| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| GET | `/api/chat-boxes` | Lấy danh sách chat boxes | ✅ |
| GET | `/api/chat-boxes/:groupId/messages` | Lấy 40 tin nhắn gần nhất | ✅ |

### Chat (WebSocket)

| Namespace | Event | Mô tả |
|-----------|-------|-------|
| `/chat` | `message` | Gửi tin nhắn |
| `/chat` | `join` | Tham gia room |
| `/chat` | `leave` | Rời room |

**Chi tiết API:** Xem file `be/API_DOCUMENTATION.md`

---

## 🛠️ Troubleshooting

### Backend không chạy được

**Lỗi: Database connection failed**
```bash
# Kiểm tra PostgreSQL đang chạy
# Kiểm tra DATABASE_URL trong file .env
# Thử chạy lại migrations:
cd be
npm run prisma:migrate
```

**Lỗi: Port 3000 đã được sử dụng**
```bash
# Thay đổi PORT trong file .env
PORT=3001
```

### Frontend không kết nối được với Backend

**Lỗi: CORS error**
- Đảm bảo backend đang chạy
- Kiểm tra `VITE_API_BASE_URL` trong file `.env` (nếu có)
- Mặc định frontend sẽ dùng `http://localhost:3000`

**Lỗi: 401 Unauthorized**
- Token có thể đã hết hạn, thử đăng nhập lại
- Kiểm tra token có được lưu trong localStorage không (F12 → Application → Local Storage)

### Database không có dữ liệu

```bash
# Chạy lại seed
cd be
npm run prisma:seed
```

### Prisma Client chưa được generate

```bash
cd be
npm run prisma:generate
```

---

## 📚 Tài Liệu Tham Khảo

### Tài Liệu Chính

- **API Documentation**: `be/API_DOCUMENTATION.md` - Tài liệu chi tiết về API endpoints
- **Postman Collection**: `be/postman/Chat_Boxes_API.postman_collection.json` - Import vào Postman để test API

### Công Nghệ Sử Dụng

- **NestJS**: https://docs.nestjs.com/
- **React**: https://react.dev/
- **Prisma**: https://www.prisma.io/docs/
- **Socket.IO**: https://socket.io/docs/
- **TailwindCSS**: https://tailwindcss.com/docs

### Scripts Hữu Ích

#### Backend

```bash
# Development
npm run start:dev          # Chạy với watch mode

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Chạy migrations
npm run prisma:seed        # Seed database
npm run prisma:studio      # Mở Prisma Studio (GUI cho database)

# Build
npm run build              # Build production
npm run start:prod         # Chạy production build
```

#### Frontend

```bash
# Development
npm run dev                # Chạy dev server

# Build
npm run build              # Build production
npm run preview            # Preview production build
```

---

## 📝 Lưu Ý Quan Trọng

1. **CORS**: Backend hiện tại cho phép tất cả origins (`*`). Trong production, nên thay đổi thành URL cụ thể của frontend.

2. **JWT Secret**: Đảm bảo `JWT_SECRET` trong file `.env` của backend là một chuỗi ngẫu nhiên, bảo mật.

3. **Database**: Đảm bảo PostgreSQL đang chạy trước khi start backend.

4. **Ports**: 
   - Backend mặc định: `3000`
   - Frontend mặc định: `5175` (hoặc port khác nếu 5175 đã được sử dụng)

5. **Token Storage**: JWT token được lưu trong `localStorage` của browser. Khi token hết hạn, user sẽ tự động bị logout.

---

## 🤝 Đóng Góp

Nếu bạn muốn đóng góp cho project:

1. Tạo branch mới từ `main`
2. Commit các thay đổi
3. Tạo Pull Request

---

## 📄 License

UNLICENSED

---

**Chúc bạn code vui vẻ! 🎉**

