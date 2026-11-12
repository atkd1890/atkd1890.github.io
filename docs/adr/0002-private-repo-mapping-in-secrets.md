# 0002. Tên repo private nằm trong secret, không nằm trong `showcase.yml`

Ngày: 2026-11-12

## Bối cảnh

Schema đầu tiên của `showcase.yml` có field `repo: owner/private-repo`, chỉ để lấy số liệu. Nhưng repo này public, nên commit field đó là công khai luôn tên mọi repo private. Điều này phá luật "tên private không bao giờ ra ngoài".

## Quyết định

- Trong `showcase.yml`, `repo` chỉ được là `null` hoặc `"@secret"`. Bộ validate từ chối mọi giá trị khác, nên ghi tên thật là build fail.
- Mapping codename → repo nằm trong secret `SHOWCASE_REPOS` dạng JSON. Một codename có thể gồm nhiều repo. Ở local đọc từ file ngoài repo (`SHOWCASE_REPOS_FILE`).
- `lib/github-data.js` gắn mọi kết quả theo codename, và `whitelist()` dựng lại payload chỉ từ các key được phép.
- Snapshot commit trong repo (`src/_data/snapshot/github.json`) chỉ chứa số liệu tổng hợp.

## Hệ quả

- Thêm một dự án cần hai bước: một mục trong `showcase.yml` và một key trong secret.
- Leak guard lấy danh sách tên repo từ chính secret này, nên mapping cũng là nguồn để phát hiện.
- PR từ fork không thấy secret: build bằng snapshot và chạy leak guard bản rút gọn.
