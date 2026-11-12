# Quyết định

Mỗi quyết định mới một file `NNNN-tieu-de.md`: bối cảnh, quyết định, hệ quả.

| #                                               | Quyết định                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| [0001](0001-github-native-eleventy.md)          | Site GitHub-native trên Eleventy                                            |
| [0002](0002-private-repo-mapping-in-secrets.md) | Tên repo private nằm trong secret, không nằm trong `showcase.yml`           |
| [0003](0003-leak-guard.md)                      | Leak guard là bước build bắt buộc                                           |
| [0004](0004-metadata-only-token.md)             | `SHOWCASE_TOKEN` cho mọi repo nhưng chỉ có quyền Metadata                   |

## Quyết định trước khi có ADR

Chốt trong Phase 0, ngày 2026-11-12.

| Chủ đề          | Quyết định                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Site cũ         | Bỏ hết nội dung Jekyll cũ (có tên thật, email, công ty, analytics ID); backup bằng `git bundle` ngoài repo; nhánh `main` mới với lịch sử git mới, `master` cũ đã xoá trên remote |
| Identity commit | `ATKD Coding` + email noreply của GitHub, đặt ở git config của repo                                                                         |
| Showcase        | 6 dự án thật dưới codename kebab-case + 2 mục demo data cho era mobile và indie-game, vì hai era này không có dữ liệu trên GitHub           |
| THN             | Là org riêng ngoài tài khoản này. Các bot tài chính cá nhân trong tài khoản không thuộc THN                                                  |
| Dự án khách hàng | Hiện dạng codename, mô tả trừu tượng; tên khách hàng nằm trong denylist                                                                    |
| Heatmap         | Bật "Include private contributions" trên profile, để contribution calendar công khai có cả việc trong repo private (dạng con số)            |
| Design          | Đồng bộ ở mức core với design hub, persona "Coding — Terminal"; không tái hiện 100% vì hub là one-page                                      |
| File riêng tư   | Để ở `../.config/atkd1890.github.io/` cạnh repo, đẩy lên secret bằng `npm run secrets:push`; template dữ liệu giả ở `config/examples/`       |
