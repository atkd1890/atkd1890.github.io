# 0001. Site GitHub-native trên Eleventy

Ngày: 2026-11-12

## Bối cảnh

Site phải cho thấy năng lực của một lead engineer, trong khi phần lớn công việc nằm trong repo private. Site cũng phải gần như không tốn công vận hành, và agent phải xuất bản được mà không cần giữ secret của site.

## Quyết định

GitHub đảm nhận mọi vai trò:

- Repo là CMS: issue là ý tưởng, PR là bản nháp, merge là xuất bản.
- GraphQL API là nguồn dữ liệu.
- Actions là CI.
- Pages là hosting.

Generator là Eleventy v3 (ESM) với Nunjucks, không dùng framework UI. JS cho người xem là vanilla hoặc Web Components, chỉ tải ở trang cần dùng.

## Hệ quả

- Không có server, database hay trang đăng nhập CMS. Mọi thay đổi nội dung là một diff có thể review.
- Repo public nên bản thân nó là một phần của showcase. Vì vậy chống lộ thông tin phải làm lúc build (ADR 0002, 0003).
- Sửa nội dung bằng trình soạn của GitHub (web, mobile, github.dev) hoặc ở local, không có WYSIWYG.
- Eleventy không có type, nên config chỉ type lỏng (`any`).
