# 0003. Leak guard là bước build bắt buộc

Ngày: 2026-11-12

## Bối cảnh

Site được build từ nguồn private và một phần do agent viết. Chỉ một lần sơ suất (tên thật, nơi làm việc, tên repo private, GPS trong ảnh) là persona mất tác dụng. Review bằng người không theo kịp bài agent viết hằng ngày.

## Quyết định

`scripts/leak-guard.js` chạy trên `_site/` đã build và trên các file Markdown mà PR thay đổi. Fail khi gặp:

- **tên repo private**, khớp nguyên từ, lấy từ `SHOWCASE_REPOS` và mọi repo private mà token liệt kê được (ADR 0004);
- **mục trong denylist**, không phân biệt hoa thường và dấu, lấy từ secret `LEAK_DENYLIST` (tên, nơi làm việc, khách hàng, email, SĐT, địa chỉ, path local);
- **EXIF** trong ảnh JPEG, PNG, WebP;
- **chuỗi canary** cài sẵn. Self-test cài nó vào mỗi lần CI để chứng minh guard vẫn hoạt động.

Log chỉ in file, dòng và số thứ tự luật, không in giá trị bị khớp, vì log CI là public. Deploy trên `main` cũng fail nếu chưa có denylist.

## Hệ quả

- Bắt nhầm sẽ chặn deploy. Cách sửa là viết lại nội dung, không nới luật.
- Tên repo chung chung chỉ khớp khi đúng nguyên từ, nên văn xuôi trùng chữ vẫn qua.
- Guard không bắt được thứ không có trong danh sách, nên denylist phải được cập nhật.
