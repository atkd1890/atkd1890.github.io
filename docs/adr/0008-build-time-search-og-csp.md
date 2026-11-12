# 0008. Tìm kiếm, OG image và CSP sinh lúc build, không có dịch vụ chạy

Ngày: 2026-11-12

## Bối cảnh

Phase 7 cần ba thứ mà site tĩnh thường phải nhờ dịch vụ ngoài: tìm kiếm toàn văn, ảnh chia sẻ (OG) cho từng trang, và header bảo mật. GitHub Pages không chạy code phía server và không cho đặt header HTTP. Nguyên tắc của repo là không có gì phải vận hành ([ADR 0001](0001-github-native-eleventy.md)) và chỉ tải JS ở trang cần dùng.

## Các phương án

| Việc     | Phương án                                     | Chạy ở đâu                 | Chi phí cho người xem                   | Ghi chú                                    |
| -------- | --------------------------------------------- | -------------------------- | --------------------------------------- | ------------------------------------------ |
| Tìm kiếm | Dịch vụ search (Algolia…)                     | Bên thứ ba                 | Gọi API ngoài, cần key                  | Thêm một nơi giữ dữ liệu                   |
| Tìm kiếm | **Pagefind, index lúc build**                 | `_site/pagefind/`          | 0 KB cho tới khi gõ từ 2 ký tự trong ⌘K | Mỗi ngôn ngữ một index, theo `<html lang>` |
| OG image | Một ảnh chung cho cả site                     | Commit sẵn                 | Không                                   | Link chia sẻ nào cũng giống nhau           |
| OG image | Vẽ bằng thư viện SVG → PNG                    | Lúc build                  | Không                                   | Cần font TTF riêng, tiếng Nhật phức tạp    |
| OG image | **Chụp bằng Playwright từ HTML đã build**     | Lúc build, Chromium có sẵn | Không                                   | Dùng đúng CSS và token của site            |
| Bảo mật  | Header HTTP                                   | Không làm được trên Pages  |                                         |                                            |
| Bảo mật  | **CSP qua `<meta>`, script inline bằng hash** | Trong HTML                 | Không                                   | Không đặt được `frame-ancestors` qua meta  |

## Quyết định

- **Pagefind** index `_site/` sau Eleventy (`scripts/postbuild.js`). Chỉ trang có `data-pagefind-body` (bài viết và các trang nội dung) vào index; trang chủ, danh sách blog và 404 không vào. Bảng lệnh ⌘K tải `/pagefind/pagefind.js` bằng dynamic import khi người xem gõ từ 2 ký tự, nên ngân sách JS của trang không đổi.
- **OG image** cho mọi trang, chụp bằng Playwright (`scripts/og.js`) từ `og:title` và `og:description` trong HTML đã build. Đường dẫn ảnh suy ra từ URL trang (`lib/seo.js`), nên template không cần biết ảnh đã có hay chưa.
- **CSP qua `<meta>`**: script chỉ từ chính site, script inline duy nhất (chống nháy theme) cho phép bằng hash SHA-256 tính lúc build; `'wasm-unsafe-eval'` cho Pagefind; style inline được phép vì sơ đồ Mermaid và thanh tỉ lệ ngôn ngữ cần. Không dùng `upgrade-insecure-requests`: site đã chạy HTTPS, còn WebKit áp thư này cho cả `http://localhost` và làm hỏng bản chạy ở local.

## Hệ quả

- Không có dịch vụ ngoài, không có key, không có gì phải gia hạn. Thêm trang là có OG, có trong sitemap và tìm kiếm.
- Build cần Chromium của Playwright: workflow `Deploy` cài thêm bước `npx playwright install --with-deps chromium` (khoảng 30 giây). Ở local, `npm run og` chạy riêng sau `npm run build`.
- Đổi script inline thì hash tự cập nhật; thêm script inline thứ hai thì phải tính hash cho nó, nếu không trình duyệt sẽ chặn. Test e2e ghi lại mọi vi phạm CSP.
- Leak guard không đọc chữ trong ảnh OG, nhưng chữ đó lấy từ HTML mà leak guard đã quét.
