# Git Workflow - Quy Trình Làm Việc với Git

Tài liệu này mô tả quy trình làm việc với Git chuẩn trong môi trường team, giúp tránh conflict và đảm bảo code quality.

---

## 📋 Quy Trình Tổng Quan

```
main (production-ready code)
  │
  ├── feature/your-feature-name (branch của bạn)
  │     └── commit 1, 2, 3...
  │
  └── Pull Request → Review → Merge vào main
```

---

## 🚀 Các Bước Làm Việc

### 1. **Lấy Code Mới Nhất từ Main**

Trước khi bắt đầu làm việc, luôn đảm bảo bạn có code mới nhất:

```bash
# Chuyển sang branch main
git checkout main

# Lấy code mới nhất từ remote
git pull origin main
```

### 2. **Tạo Branch Mới cho Feature**

```bash
# Tạo và chuyển sang branch mới
git checkout -b feature/your-feature-name

# Hoặc nếu branch đã tồn tại ở remote:
git checkout -b feature/your-feature-name
git pull origin feature/your-feature-name
```

**Quy tắc đặt tên branch:**
- `feature/ten-feature` - Cho tính năng mới
- `fix/ten-bug` - Cho bug fix
- `chore/ten-task` - Cho các task không liên quan đến feature/bug
- `refactor/ten-refactor` - Cho refactoring code

**Ví dụ:**
- `feature/chat-boxes`
- `fix/login-error`
- `chore/update-dependencies`

### 3. **Làm Việc và Commit**

```bash
# Sau khi code xong, kiểm tra thay đổi
git status

# Add các file đã thay đổi
git add .

# Hoặc add từng file cụ thể
git add path/to/file1.js path/to/file2.js

# Commit với message rõ ràng
git commit -m "feat: add chat boxes list feature

- Implement chat boxes API endpoint
- Add UI for displaying chat boxes
- Add unread message count"
```

**Quy tắc Commit Message (Conventional Commits):**

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Thay đổi documentation
- `style`: Formatting, thiếu semicolon, etc (không ảnh hưởng code)
- `refactor`: Refactoring code
- `test`: Thêm/sửa test
- `chore`: Update build tasks, dependencies, etc

**Ví dụ:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login token expiration issue"
git commit -m "docs: update API documentation"
git commit -m "chore: update dependencies"
```

### 4. **Push Code Lên Remote**

```bash
# Push lần đầu (tạo branch mới trên remote)
git push -u origin feature/your-feature-name

# Các lần push sau
git push
```

### 5. **Tạo Pull Request (PR)**

#### Cách 1: Qua GitHub Web UI (Khuyến nghị)

1. Vào repository trên GitHub: https://github.com/Khaibec/ITSS
2. Bạn sẽ thấy banner "Compare & pull request" hoặc click vào tab **Pull requests**
3. Click **New pull request**
4. Chọn:
   - **Base branch**: `main` (branch muốn merge vào)
   - **Compare branch**: `giang/chat-boxes` (branch của bạn)
5. Điền thông tin PR:
   - **Title**: Mô tả ngắn gọn (ví dụ: "Add chat boxes feature")
   - **Description**: Mô tả chi tiết:
     ```markdown
     ## Mô tả
     - Thêm tính năng hiển thị danh sách chat boxes
     - Thêm API endpoint để lấy chat boxes
     - Thêm UI components cho chat boxes
     
     ## Checklist
     - [x] Code đã được test
     - [x] Không có linter errors
     - [x] Đã update documentation
     
     ## Screenshots (nếu có)
     [Thêm ảnh chụp màn hình]
     ```
6. Click **Create pull request**

#### Cách 2: Qua Link GitHub Tự Động

Sau khi push, GitHub sẽ hiển thị link:
```
https://github.com/Khaibec/ITSS/pull/new/giang/chat-boxes
```

Click vào link này để tạo PR.

### 6. **Review và Merge**

- Team members sẽ review code của bạn
- Nếu có comments, bạn sẽ nhận notification
- Sửa code theo feedback và push thêm commit:
  ```bash
  # Sửa code...
  git add .
  git commit -m "fix: address review comments"
  git push
  ```
- Sau khi được approve, maintainer sẽ merge PR vào `main`

---

## 🔄 Sync Branch với Main (Khi Main Có Code Mới)

Nếu trong lúc bạn đang làm việc, có người merge code vào `main`, bạn cần sync:

```bash
# Đảm bảo bạn đang ở branch của mình
git checkout feature/your-feature-name

# Lấy code mới nhất từ main
git fetch origin main

# Merge main vào branch của bạn
git merge origin/main

# Hoặc dùng rebase (nếu team dùng rebase)
git rebase origin/main

# Resolve conflicts nếu có, sau đó:
git add .
git commit -m "chore: merge main into feature branch"

# Push lên remote
git push
```

---

## ⚠️ Lưu Ý Quan Trọng

### ✅ Nên Làm

1. **Luôn tạo branch mới** trước khi code
2. **Commit thường xuyên** với message rõ ràng
3. **Pull code mới nhất** từ main trước khi bắt đầu
4. **Test code** trước khi push
5. **Review code của mình** trước khi tạo PR
6. **Viết description rõ ràng** trong PR

### ❌ Không Nên Làm

1. **KHÔNG commit trực tiếp vào `main`**
2. **KHÔNG push code chưa test**
3. **KHÔNG commit file `.env`** (đã có trong .gitignore)
4. **KHÔNG commit `node_modules`** (đã có trong .gitignore)
5. **KHÔNG force push vào branch chung** (main, develop)
6. **KHÔNG merge PR của chính mình** (trừ khi là maintainer)

---

## 🛠️ Các Lệnh Git Hữu Ích

### Xem thay đổi

```bash
# Xem status
git status

# Xem diff (thay đổi chưa staged)
git diff

# Xem diff đã staged
git diff --staged

# Xem lịch sử commit
git log --oneline -10
```

### Undo thay đổi

```bash
# Bỏ thay đổi chưa staged (chưa git add)
git restore <file>

# Bỏ tất cả thay đổi chưa staged
git restore .

# Unstage file (đã git add nhưng chưa commit)
git restore --staged <file>

# Sửa commit message của commit cuối (chưa push)
git commit --amend -m "new message"

# Xóa commit cuối (chưa push) nhưng giữ thay đổi
git reset --soft HEAD~1
```

### Branch management

```bash
# Xem tất cả branches
git branch -a

# Xóa branch local
git branch -d branch-name

# Xóa branch remote
git push origin --delete branch-name

# Đổi tên branch hiện tại
git branch -m new-name
```

---

## 📝 Template Pull Request

Copy template này khi tạo PR:

```markdown
## 📋 Mô tả
[Mô tả ngắn gọn về những gì PR này làm]

## 🔄 Thay đổi
- [ ] Thay đổi 1
- [ ] Thay đổi 2
- [ ] Thay đổi 3

## 🧪 Testing
- [ ] Đã test trên local
- [ ] Đã test các edge cases
- [ ] Không có breaking changes

## 📸 Screenshots (nếu có)
[Thêm ảnh chụp màn hình nếu là UI changes]

## ✅ Checklist
- [ ] Code đã được review bởi chính mình
- [ ] Không có linter errors
- [ ] Đã update documentation (nếu cần)
- [ ] Đã test và hoạt động đúng
```

---

## 🆘 Xử Lý Conflicts

Khi merge/rebase, nếu có conflict:

```bash
# Git sẽ báo conflict, mở file có conflict
# Tìm các dòng:
<<<<<<< HEAD
Code từ branch hiện tại
=======
Code từ branch merge vào
>>>>>>> branch-name

# Sửa conflict, giữ code đúng, xóa các markers
# Sau đó:
git add .
git commit -m "fix: resolve merge conflicts"
```

---

## 📚 Tài Liệu Tham Khảo

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**Chúc bạn làm việc hiệu quả! 🚀**

