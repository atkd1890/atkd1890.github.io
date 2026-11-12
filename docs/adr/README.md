# Quyết định

Mỗi quyết định mới một file `NNNN-tieu-de.md`: bối cảnh, quyết định, hệ quả.

| #                                               | Quyết định                                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| [0001](0001-github-native-eleventy.md)          | Site GitHub-native trên Eleventy                                                  |
| [0002](0002-private-repo-mapping-in-secrets.md) | Tên repo private nằm trong secret, không nằm trong `showcase.yml`                 |
| [0003](0003-leak-guard.md)                      | Leak guard là bước build bắt buộc                                                 |
| [0004](0004-metadata-only-token.md)             | `SHOWCASE_TOKEN` cho mọi repo nhưng chỉ có quyền Metadata                         |
| [0005](0005-privacy-level.md)                   | Mức riêng tư: kín đáo, không ẩn danh tuyệt đối                                    |
| [0006](0006-i18n.md)                            | Ba ngôn ngữ VI, EN, JA; mặc định tiếng Việt                                       |
| [0007](0007-bitbucket-repos.md)                 | Repo ngoài GitHub: import repo cá nhân, giữ nguyên repo khách hàng và đọc qua API |
| [0008](0008-build-time-search-og-csp.md)        | Tìm kiếm, OG image và CSP sinh lúc build, không có dịch vụ chạy                   |

## Quyết định trước khi có ADR

Chốt trong Phase 0, ngày 2026-11-12.

| Chủ đề           | Quyết định                                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site cũ          | Bỏ hết nội dung Jekyll cũ (có tên thật, email, công ty, analytics ID); backup bằng `git bundle` ngoài repo; nhánh `main` mới với lịch sử git mới, `master` cũ đã xoá trên remote |
| Identity commit  | `atkd1890` + email noreply của GitHub, đặt ở git config của repo; hook `pre-commit` và leak guard chặn email khác                                                                |
| Showcase         | 6 dự án thật dưới codename kebab-case + 2 mục demo data cho era mobile và indie-game, vì hai era này không có dữ liệu trên GitHub                                                |
| THN              | Là org riêng ngoài tài khoản này. Các bot tài chính cá nhân trong tài khoản không thuộc THN                                                                                      |
| Dự án khách hàng | Hiện dạng codename, mô tả trừu tượng; tên khách hàng nằm trong denylist                                                                                                          |
| Heatmap          | Bật "Include private contributions" trên profile, để contribution calendar công khai có cả việc trong repo private (dạng con số)                                                 |
| Design           | Đồng bộ ở mức core với design hub, persona "Coding — Terminal"; không tái hiện 100% vì hub là one-page                                                                           |
| File riêng tư    | Để ở `../.config/atkd1890.github.io/` cạnh repo, đẩy lên secret bằng `npm run secrets:push`; template dữ liệu giả ở `config/examples/`                                           |
