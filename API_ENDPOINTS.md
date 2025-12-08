# API Endpoints

## Authentication (`/auth`)

- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất (JWT required)
- `GET /auth/profile` - Lấy thông tin profile (JWT required)

## Messages (`/messages`)

- `GET /messages/group/:groupId` - Lấy tin nhắn theo nhóm (JWT required)
  - Query params: `take` (default: 50), `skip` (default: 0)
- `GET /messages/general` - Lấy tin nhắn chung (JWT required)
  - Query params: `take` (default: 50), `skip` (default: 0)

## Chat Boxes (`/api/chat-boxes`)

- `GET /api/chat-boxes` - Lấy danh sách chat boxes (JWT required)
- `GET /api/chat-boxes/:groupId/messages` - Lấy tin nhắn của một chat box (JWT required)
  - Trả về 40 tin nhắn gần nhất, sắp xếp từ cũ đến mới

## App

- `GET /` - Health check

## WebSocket Events (`/chat` namespace) ⭐ **MỚI**

**Kết nối:**
- Kết nối WebSocket: `ws://localhost:3000/chat` (hoặc tương ứng với server URL)
  - Query param: `token` (JWT token) - **Bắt buộc**
  - Tự động join vào room `general_chat` khi kết nối thành công

**Client → Server Events:**

- `sendMessage` - Gửi tin nhắn (JWT required)
  - Payload: `{ content: string, groupId?: number }`
  - Nếu không có `groupId`, tin nhắn sẽ gửi vào chat chung

- `joinRoom` - Tham gia phòng chat của một nhóm (JWT required)
  - Payload: `groupId` (number)
  - Tham gia vào room `group-{groupId}`

- `leaveRoom` - Rời phòng chat của một nhóm (JWT required)
  - Payload: `groupId` (number)
  - Rời khỏi room `group-{groupId}`

**Server → Client Events:**

- `receiveMessage` - Nhận tin nhắn mới
  - Được emit khi có tin nhắn mới trong room mà client đang tham gia
  - Payload: Message object với đầy đủ thông tin (message_id, content, created_at, sender, etc.)

- `joinedRoom` - Xác nhận đã tham gia phòng
  - Payload: `"You have joined group-{groupId}"`

- `leftRoom` - Xác nhận đã rời phòng
  - Payload: `"You have left group-{groupId}"`

- `error` - Lỗi xảy ra
  - Payload: `{ message: string, type: string }`
  - Các loại lỗi: `auth_error`, `auth_required`, `invalid_group`, `validation_error`, `server_error`

**Lưu ý:**
- Tất cả WebSocket events đều yêu cầu JWT authentication qua query parameter `token`
- Client tự động được join vào `general_chat` room khi kết nối thành công
- Để nhận tin nhắn từ một nhóm cụ thể, client phải gọi `joinRoom` với `groupId` tương ứng

