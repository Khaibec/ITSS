# Sprint 3 Demo Guide - Majiwakaru App
## Hướng dẫn Demo Video Sprint 3

---

## 📋 Mục tiêu Demo

Quay video demo các tính năng đã hoàn thành trong Sprint 3 để gửi cho nhóm POT (Product Owner Team).

---

## 🔧 Chuẩn bị trước khi Demo

### 1. Pull Code mới nhất từ Main Branch

```bash
# Chuyển về branch main
git checkout main

# Pull code mới nhất
git pull origin main

# Kiểm tra branch hiện tại
git branch
```

### 2. Cài đặt Dependencies

```bash
# Backend
cd be
npm install
npx prisma generate

# Frontend
cd ../fe
npm install
```

### 3. Khởi động Database (nếu chưa chạy)

```bash
# Trong folder be
cd be
docker-compose up -d

# Kiểm tra database đang chạy
docker ps
```

### 4. Chạy Migration và Seed Data (nếu cần)

```bash
# Trong folder be
npx prisma migrate dev
npx prisma db seed
```

### 5. Khởi động Backend và Frontend

**Terminal 1 - Backend:**
```bash
cd be
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd fe
npm run dev
```

### 6. Truy cập Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

---

## ✅ Checklist Các Tính Năng Cần Test

### 🔍 Trước khi quay video, test các tính năng sau:

#### 1. 💬 Lưu tin nhắn phân tích (Message Explanation/AI Analysis)
- [ ] Gửi tin nhắn trong chat
- [ ] Click vào icon "?" bên cạnh tin nhắn
- [ ] Xem phân tích AI được hiển thị trong modal
- [ ] Kiểm tra phân tích có được lưu vào database không
- [ ] Xác nhận cache hoạt động (lần 2 click vào cùng 1 tin nhắn không gọi API)
- [ ] Test với tin nhắn tiếng Nhật
- [ ] Test với tin nhắn tiếng Việt

**Endpoint Backend liên quan:**
- `POST /messages/explain` - Phân tích tin nhắn

**Database Tables:**
- `message_analyses` - Lưu kết quả phân tích

---

#### 2. 📝 Lưu tin nhắn Review (Message Review)
- [ ] Nhập tin nhắn vào textbox
- [ ] Click vào icon "Review" (trước khi gửi)
- [ ] Xem kết quả review từ AI (kiểm tra ngữ pháp, đề xuất cải thiện)
- [ ] Kiểm tra review có được lưu vào database không
- [ ] Test với câu có lỗi ngữ pháp
- [ ] Test với câu đúng ngữ pháp

**Endpoint Backend liên quan:**
- `POST /messages/review` - Review tin nhắn trước khi gửi

**Database Tables:**
- `message_reviews` - Lưu kết quả review

---

#### 3. 📚 Nhật ký học tập (Learning Diary) - Chi tiết

##### Task 3: Tạo Diary Entry khi xem phân tích tin nhắn
- [ ] Login vào app
- [ ] Vào một chat group
- [ ] Gửi hoặc chọn một tin nhắn
- [ ] Click icon "?" để xem phân tích AI
- [ ] **Kiểm tra:** Một entry diary tự động được tạo trong database
- [ ] Xác nhận trong bảng `learning_diaries` có record mới với:
  - `user_id` của người xem
  - `message_id` của tin nhắn được phân tích
  - `learning_date` là ngày hiện tại
  - `title` tự động sinh (ví dụ: "メッセージ分析 - [ngày]")

**Backend Logic:**
```
Khi user click "?" để xem explanation
→ Gọi POST /messages/explain
→ Backend tự động tạo diary entry
→ Lưu vào bảng learning_diaries
```

##### Task 4: Hiển thị danh sách Diary
- [ ] Click vào menu "学習日記" (Learning Diary) trên sidebar
- [ ] **Kiểm tra:** Danh sách diary entries hiển thị đúng:
  - Hiển thị theo thứ tự mới nhất trước
  - Mỗi entry có: Title + Learning Date
  - Format ngày: YYYY-MM-DD
- [ ] Kiểm tra UI responsive
- [ ] Test với nhiều diary entries (scroll)

**Endpoint:**
- `GET /api/diaries` - Lấy danh sách diary của user hiện tại

##### Task 5: Xem chi tiết Diary Entry
- [ ] Từ danh sách diary, click vào một entry
- [ ] **Kiểm tra:** Trang chi tiết hiển thị đầy đủ:
  - Title của diary
  - Learning Date
  - Nội dung tin nhắn gốc (message content)
  - Kết quả phân tích AI (explanation)
  - Thông tin người gửi tin nhắn
- [ ] Click "戻る" (Back) để quay lại danh sách
- [ ] Kiểm tra scroll position được giữ khi quay lại list

**Endpoint:**
- `GET /api/diaries/:diaryId` - Lấy chi tiết một diary entry

**Database Relations:**
```
learning_diaries
  ├─ message_id → messages (tin nhắn gốc)
  └─ user_id → users (người tạo diary)

messages
  ├─ sender_id → users (người gửi)
  └─ message_analyses (phân tích AI)
```

---

#### 4. 🐛 Lỗi giao diện của Tùng (UI Bugs)
- [ ] Kiểm tra các lỗi UI đã được fix:
  - Layout responsive
  - Styling tailwind CSS
  - Icon alignment
  - Button hover effects
  - Modal popup display
- [ ] Test trên các screen size khác nhau
- [ ] Kiểm tra console không có error

**Các component cần check:**
- ChatLayout
- MessageItem
- MessageList
- GroupList
- Các Modal (ExplainModal, ReviewModal)

---

#### 5. 🔐 Lỗi đăng xuất của Giang (Logout Bug)
- [ ] Login vào app
- [ ] Vào chat group, gửi tin nhắn
- [ ] Chuyển giữa các chat groups
- [ ] **Kiểm tra:** Không bị tự động logout khi:
  - Chuyển giữa các chat groups
  - Thoát khỏi chat group về menu
  - Reload page
  - Sau một khoảng thời gian không hoạt động
- [ ] Test trường hợp token hết hạn (logout đúng)
- [ ] Test logout bình thường qua menu

**Root Causes đã fix:**
1. Socket reconnection với token cũ
2. Error handler quá nhạy cảm (logout khi có lỗi nhỏ)
3. API error 401 bị catch nhầm từ network error
4. useEffect dependency với logout function gây re-run

---

## 🎬 Kịch bản Demo Video (Chi tiết)

### Phần 1: Giới thiệu (30 giây)
```
[Screen: Trang login]
👋 "Xin chào! Đây là video demo Sprint 3 của app Majiwakaru.
Hôm nay tôi sẽ demo các tính năng mới:
1. Phân tích tin nhắn bằng AI
2. Review tin nhắn trước khi gửi
3. Nhật ký học tập tự động
4. Các bug fixes"
```

---

### Phần 2: Login và Vào Chat (20 giây)
```
[Action]
1. Nhập email: minhhoang@example.com
2. Nhập password: (ẩn)
3. Click "ログイン"

[Narration]
"Đầu tiên, tôi sẽ đăng nhập vào app với tài khoản test."

[Show]
- Login thành công
- Redirect đến trang danh sách groups
```

---

### Phần 3: Demo Phân tích tin nhắn AI (1 phút 30 giây)

#### 3.1. Gửi tin nhắn mới
```
[Action]
1. Click vào group "日本語学習グループ"
2. Nhập tin nhắn: "こんにちは！今日はいい天気ですね。"
3. Click "送信"

[Narration]
"Tôi sẽ vào một chat group và gửi một tin nhắn tiếng Nhật."

[Show]
- Tin nhắn xuất hiện trong chat
- Realtime update
```

#### 3.2. Xem phân tích AI
```
[Action]
1. Click vào icon "?" bên cạnh tin nhắn vừa gửi
2. Đợi AI phân tích (hiển thị loading)

[Narration]
"Bây giờ tôi click vào icon dấu hỏi để xem phân tích AI về tin nhắn này."

[Show]
- Modal popup hiển thị
- Kết quả phân tích từ AI:
  * Ý nghĩa của câu
  * Ngữ cảnh sử dụng
  * Giải thích ngữ pháp
  * Cách diễn đạt phù hợp với văn hóa
```

#### 3.3. Test cache (optional)
```
[Action]
1. Đóng modal
2. Click lại icon "?" của cùng tin nhắn

[Narration]
"Để kiểm tra tính năng cache, tôi sẽ click lại lần nữa."

[Show]
- Kết quả hiển thị ngay lập tức (không loading)
- "Dữ liệu được cache, không gọi API lại"
```

---

### Phần 4: Demo Review tin nhắn (1 phút)

```
[Action]
1. Scroll xuống ô nhập tin nhắn
2. Nhập tin nhắn có lỗi: "私は学校を行きます" (lỗi: を thay vì に)
3. Click icon "Review" (TRƯỚC KHI GỬI)
4. Xem kết quả review

[Narration]
"Tiếp theo, tôi sẽ demo tính năng Review tin nhắn.
Tính năng này giúp kiểm tra ngữ pháp và đề xuất cải thiện 
TRƯỚC KHI gửi tin nhắn."

[Show]
- Modal Review popup
- AI chỉ ra lỗi: "を → に"
- Đề xuất: "私は学校に行きます"
- Explanation về lỗi
```

```
[Action - Nếu có tính năng Accept Suggestion]
1. Click "修正を適用" (Apply suggestion)
2. Tin nhắn được sửa tự động
3. Click "送信"

[Show]
- Tin nhắn đã được sửa xuất hiện trong chat
```

---

### Phần 5: Demo Nhật ký học tập (2 phút)

#### 5.1. Kiểm tra Diary tự động tạo
```
[Action]
1. Click vào menu "学習日記" trên sidebar

[Narration]
"Một tính năng mới rất hữu ích là Nhật ký học tập.
Mỗi khi bạn xem phân tích AI, hệ thống sẽ TỰ ĐỘNG
lưu vào nhật ký học tập của bạn."

[Show]
- Danh sách diary entries
- Entry mới nhất tương ứng với tin nhắn vừa phân tích
- Format: "メッセージ分析 - 2024-12-24"
```

#### 5.2. Xem chi tiết Diary
```
[Action]
1. Click vào diary entry mới nhất

[Narration]
"Tôi sẽ click vào để xem chi tiết nhật ký học tập này."

[Show]
- Trang chi tiết diary:
  * Title
  * Learning Date
  * Nội dung tin nhắn gốc: "こんにちは！今日はいい天気ですね。"
  * Kết quả phân tích AI (đầy đủ)
  * Avatar và tên người gửi
```

#### 5.3. Quay lại danh sách
```
[Action]
1. Click "戻る" (Back button)

[Show]
- Quay lại danh sách diary
- Scroll position được giữ nguyên
```

---

### Phần 6: Demo Bug Fixes (1 phút)

#### 6.1. Test không bị logout khi chuyển chat
```
[Action]
1. Quay lại "チャットボックス" → "グループ一覧"
2. Vào chat group khác
3. Gửi tin nhắn
4. Thoát ra menu
5. Vào lại chat group ban đầu

[Narration]
"Trước đây có một bug là app tự động logout khi chuyển 
giữa các chat groups. Bug này đã được fix."

[Show]
- Chuyển đổi mượt mà giữa các groups
- KHÔNG bị logout
- User vẫn authenticated
```

#### 6.2. Test UI/UX
```
[Action]
1. Di chuyển giữa các trang
2. Resize cửa sổ browser
3. Test các button hover effects

[Narration]
"Các lỗi giao diện cũng đã được fix:
- Layout responsive
- Icon alignment
- Button effects"

[Show]
- UI hoạt động mượt mà
- Không có lỗi hiển thị
```

---

### Phần 7: Demo Profile (30 giây - Bonus)
```
[Action]
1. Click "プロフィール" trên sidebar
2. Xem thông tin user
3. Click icon mắt để show/hide password

[Narration]
"App cũng có trang Profile để xem thông tin cá nhân."

[Show]
- User info: name, email, nationality
- Password toggle (auto-hide sau 5s)
```

---

### Phần 8: Kết thúc (20 giây)
```
[Action]
1. Click "ログアウト"
2. Confirm logout

[Narration]
"Đó là các tính năng chính trong Sprint 3.
Cảm ơn POT team đã xem video demo!"

[Show]
- Logout thành công
- Quay về trang login
```

---

## 📊 Checklist Trước Khi Gửi Video

### Technical Check
- [ ] Video có âm thanh rõ ràng
- [ ] Screen resolution ít nhất 1080p
- [ ] Không có thông tin nhạy cảm trong video (passwords, tokens)
- [ ] Console không có error trong video
- [ ] Tất cả tính năng demo hoạt động OK

### Content Check
- [ ] Demo đủ 5 tính năng chính:
  - [ ] Message Analysis (AI Explanation)
  - [ ] Message Review
  - [ ] Learning Diary - Auto create
  - [ ] Learning Diary - List view
  - [ ] Learning Diary - Detail view
  - [ ] Bug fixes (logout, UI)
- [ ] Giải thích rõ ràng mỗi tính năng
- [ ] Thời lượng video hợp lý (5-8 phút)

### Format Check
- [ ] Video format: MP4 hoặc MOV
- [ ] File size < 100MB (hoặc theo yêu cầu)
- [ ] Tên file: `Majiwakaru_Sprint3_Demo_[TenBan]_[Ngay].mp4`

---

## 🎥 Tools Gợi ý để Quay Video

### Windows
- **OBS Studio** (Free, mạnh mẽ)
- **Windows Game Bar** (Win + G)
- **Loom** (Browser extension)

### Mac
- **QuickTime Player** (Built-in)
- **OBS Studio** (Free)
- **Loom** (Browser extension)

### Recording Settings
- Resolution: 1920x1080 (1080p)
- Frame rate: 30 FPS
- Bitrate: 5000 kbps
- Audio: Bật microphone để narrate

---

## 📤 Cách Gửi Video cho POT Team

### Option 1: Google Drive
```
1. Upload video lên Google Drive
2. Set permission: "Anyone with the link can view"
3. Copy link
4. Gửi link qua email/Slack/Teams
```

### Option 2: YouTube (Unlisted)
```
1. Upload lên YouTube
2. Set visibility: "Unlisted" (không public)
3. Copy link
4. Gửi link cho team
```

### Option 3: File sharing service
- WeTransfer
- Dropbox
- OneDrive

---

## 📝 Email Template gửi POT

```
Subject: [Sprint 3] Demo Video - Majiwakaru App

こんにちは POT Team,

Sprint 3のデモビデオを送信します。

【デモ内容】
1. メッセージ分析機能（AI Explanation）
2. メッセージレビュー機能（Review before send）
3. 学習日記機能
   - 自動作成
   - 一覧表示
   - 詳細表示
4. バグ修正
   - ログアウトのバグ
   - UI/UXの問題

【ビデオリンク】
[Video link here]

【所要時間】約X分

ご確認をお願いします。

よろしくお願いいたします。

---
Thành
Majiwakaru Development Team
```

---

## 🐛 Troubleshooting

### Nếu gặp lỗi khi test:

#### Backend không start
```bash
# Check port 3000 có bị occupied không
netstat -ano | findstr :3000

# Kill process nếu cần (Windows)
taskkill /PID [PID] /F

# Restart backend
npm run start:dev
```

#### Database connection error
```bash
# Restart Docker container
docker-compose down
docker-compose up -d

# Check logs
docker logs itss_postgres
```

#### Frontend không connect backend
```bash
# Check VITE_API_BASE_URL trong .env
# Hoặc thêm vào fe/.env:
VITE_API_BASE_URL=http://localhost:3000
```

#### AI analysis không hoạt động
```bash
# Check .env trong be folder:
GOOGLE_STUDIO_API_KEY=your_key_here
GOOGLE_MODEL_NAME=gemini-1.5-flash

# Restart backend sau khi update .env
```

---

## 📞 Contact

Nếu có vấn đề khi chuẩn bị demo, liên hệ:
- Team Lead: [Name]
- Backend Dev: [Name]
- Frontend Dev: [Name]

---

**Chúc bạn demo thành công! 🎉**

