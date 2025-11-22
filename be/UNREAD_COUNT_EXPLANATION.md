# Giải thích cách tính Unread Count

## 📍 Vị trí trong Code

Phần tính toán `unread_count` nằm trong file:
- **File:** `be/src/chat-boxes/chat-boxes.service.ts`
- **Dòng:** 48-64
- **Function:** `getChatBoxes()`

## 🗄️ Nguồn dữ liệu: Database

Tất cả thông tin được lấy từ **PostgreSQL database** thông qua Prisma ORM, cụ thể:

### 1. Bảng `messages`
- Chứa tất cả tin nhắn trong các group
- Fields: `message_id`, `group_id`, `sender_id`, `content`, `created_at`

### 2. Bảng `message_reads`
- Chứa thông tin về tin nhắn nào đã được user nào đọc
- Fields: `message_id`, `user_id`, `read_at`
- Composite Primary Key: `[message_id, user_id]`

## 🔢 Cách tính Unread Count

### Bước 1: Đếm tổng số tin nhắn trong group

```typescript
const totalMessages = await this.prisma.messages.count({
  where: { group_id: group.group_id },
});
```

**SQL tương đương:**
```sql
SELECT COUNT(*) 
FROM messages 
WHERE group_id = 1;
```

**Ví dụ:** Group có 10 tin nhắn → `totalMessages = 10`

---

### Bước 2: Đếm số tin nhắn đã đọc bởi user

```typescript
const readMessages = await this.prisma.message_reads.count({
  where: {
    user_id: userId,  // Ví dụ: user_id = 1
    message: {
      group_id: group.group_id,  // Ví dụ: group_id = 1
    },
  },
});
```

**SQL tương đương:**
```sql
SELECT COUNT(*) 
FROM message_reads mr
INNER JOIN messages m ON mr.message_id = m.message_id
WHERE mr.user_id = 1 
  AND m.group_id = 1;
```

**Ví dụ:** User đã đọc 7 tin nhắn → `readMessages = 7`

---

### Bước 3: Tính số tin nhắn chưa đọc

```typescript
const unreadCount = Math.max(0, totalMessages - readMessages);
```

**Công thức:**
```
unread_count = Tổng tin nhắn - Số tin nhắn đã đọc
```

**Ví dụ:**
- `totalMessages = 10`
- `readMessages = 7`
- `unreadCount = Math.max(0, 10 - 7) = 3`

**Safety check:** `Math.max(0, ...)` đảm bảo `unread_count` không bao giờ âm.

---

## 📊 Ví dụ thực tế

### Tình huống: User ID = 1, Group ID = 1

#### Database State:

**Bảng `messages` (group_id = 1):**
```
message_id | group_id | sender_id | content              | created_at
-----------|----------|-----------|----------------------|------------------
1          | 1        | 2         | "Xin chào!"          | 2025-11-21 10:00
2          | 1        | 3         | "Chào bạn!"          | 2025-11-21 10:05
3          | 1        | 2         | "Hôm nay thế nào?"   | 2025-11-21 10:10
4          | 1        | 4         | "Tốt lắm!"           | 2025-11-21 10:15
5          | 1        | 2         | "Great!"              | 2025-11-21 10:20
```

**Bảng `message_reads` (user_id = 1):**
```
message_id | user_id | read_at
-----------|---------|------------------
1          | 1       | 2025-11-21 10:01
2          | 1       | 2025-11-21 10:06
3          | 1       | 2025-11-21 10:11
```

#### Tính toán:

1. **totalMessages:**
   ```sql
   SELECT COUNT(*) FROM messages WHERE group_id = 1;
   -- Kết quả: 5
   ```

2. **readMessages:**
   ```sql
   SELECT COUNT(*) 
   FROM message_reads mr
   INNER JOIN messages m ON mr.message_id = m.message_id
   WHERE mr.user_id = 1 AND m.group_id = 1;
   -- Kết quả: 3 (đã đọc message_id 1, 2, 3)
   ```

3. **unreadCount:**
   ```
   unreadCount = Math.max(0, 5 - 3) = 2
   ```

#### Response:

```json
{
  "group_id": 1,
  "group_name": "Team Viet-Japan",
  "unread_count": 2,  // ← 2 tin nhắn chưa đọc (message_id 4, 5)
  ...
}
```

---

## 🎯 Trong Response của bạn

Trong response bạn nhận được:

```json
{
  "group_id": 1,
  "unread_count": 0,  // ← Điều này có nghĩa là:
  ...
}
```

**Giải thích:**
- `unread_count: 0` có nghĩa là:
  - **Tất cả tin nhắn trong group đã được user đọc**, HOẶC
  - **Group chưa có tin nhắn nào**

**Có thể xảy ra 2 trường hợp:**

### Trường hợp 1: Đã đọc hết
```
totalMessages = 5
readMessages = 5
unreadCount = 5 - 5 = 0 ✅
```

### Trường hợp 2: Chưa có tin nhắn
```
totalMessages = 0
readMessages = 0
unreadCount = 0 - 0 = 0 ✅
```

---

## 🔍 Kiểm tra Database

Để kiểm tra chính xác, bạn có thể chạy các query sau:

### 1. Kiểm tra tổng số tin nhắn trong group:
```sql
SELECT COUNT(*) as total_messages
FROM messages
WHERE group_id = 1;
```

### 2. Kiểm tra số tin nhắn đã đọc:
```sql
SELECT COUNT(*) as read_messages
FROM message_reads mr
INNER JOIN messages m ON mr.message_id = m.message_id
WHERE mr.user_id = 1 
  AND m.group_id = 1;
```

### 3. Kiểm tra chi tiết tin nhắn chưa đọc:
```sql
SELECT m.message_id, m.content, m.created_at
FROM messages m
WHERE m.group_id = 1
  AND m.message_id NOT IN (
    SELECT mr.message_id 
    FROM message_reads mr 
    WHERE mr.user_id = 1
  )
ORDER BY m.created_at DESC;
```

---

## ⚡ Tối ưu hóa

Code hiện tại sử dụng cách tính **hiệu quả**:
- ✅ Đếm tổng số tin nhắn (1 query)
- ✅ Đếm số tin nhắn đã đọc (1 query)
- ✅ Tính toán: `total - read`

**Thay vì cách không hiệu quả:**
- ❌ Lấy tất cả tin nhắn rồi filter (nhiều data transfer)
- ❌ Loop qua từng tin nhắn để check (nhiều queries)

---

## 📝 Tóm tắt

| Câu hỏi | Trả lời |
|---------|---------|
| **unread_count có trong response không?** | ✅ Có, ở field `unread_count` |
| **Nó được tính ở đâu?** | Trong `chat-boxes.service.ts`, dòng 48-64 |
| **Lấy dữ liệu từ đâu?** | Từ database PostgreSQL qua Prisma |
| **Công thức tính?** | `unread_count = totalMessages - readMessages` |
| **Dữ liệu lấy từ bảng nào?** | `messages` và `message_reads` |

---

**Kết luận:** `unread_count` được tính **real-time** từ database mỗi khi gọi API, đảm bảo độ chính xác cao.

