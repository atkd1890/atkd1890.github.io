# Changelog

Thay đổi người xem thấy được trên atkd1890.github.io. Thay đổi nội bộ (test, CI, docs) xem ở git log.

## 2026-11-12 — Tìm kiếm, chia sẻ và các trang mới

- Bảng lệnh ⌘K tìm được trong nội dung mọi bài viết, theo ngôn ngữ của trang; phím `/` mở thẳng ô tìm.
- Mỗi trang có ảnh chia sẻ riêng (OG image) theo phong cách terminal, cả 3 ngôn ngữ; có `sitemap.xml`, `robots.txt` và dữ liệu có cấu trúc cho bài viết.
- Trang mới: `/colophon` (site dựng thế nào, số liệu craft đọc thẳng từ repo), `/uses`, `/tools`, `/lab`, mỗi trang đủ 3 ngôn ngữ; footer có link tới `/uses` và `/colophon`.
- Release của các tool public hiện cùng bài viết ở `/blog/`, feed và trang chủ.
- Feed theo loại (`/feed/<type>.xml`) đã có bài; trước đây luôn rỗng.
- Content-Security-Policy chặn mọi script không phải của site; `/.well-known/security.txt` cho báo lỗ hổng.

## 2026-11-12 — Bản dịch và breadcrumb

- Bài đầu tiên có bản tiếng Anh và tiếng Nhật, kèm sơ đồ và ảnh chụp theo đúng ngôn ngữ.
- Breadcrumb `~ / blog / …` ở mọi trang trừ trang chủ; nhãn `~/atkd-coding` trên thanh tiêu đề dẫn về trang chủ.
- Thời gian đọc chính xác hơn (không đếm chữ trong sơ đồ); mục lục bài tiếng Nhật đủ các mục.

## 2026-11-12 — Blog

- `/blog/` với bộ lọc theo loại, thẻ, series và năm, ở cả 3 ngôn ngữ; feed Atom `/feed.xml` và `/feed/<type>.xml`.
- Trang bài viết: mục lục, thời gian đọc, series, bản dịch, nhãn "AI hỗ trợ viết", sơ đồ và ảnh chụp tự đổi theo theme.
- Mục "Bài viết" trên trang chủ hiện các bài mới nhất; phím `g b` mở blog.

## 2026-11-12 — Ba ngôn ngữ

- Site có 3 ngôn ngữ: tiếng Việt (mặc định), English ở `/en/`, 日本語 ở `/ja/`. Nút VI/EN/JA trên thanh tiêu đề, dùng được cả khi tắt JavaScript.
- Bảng lệnh, phím tắt và thông báo theo ngôn ngữ của trang.

## 2026-11-12 — Nhận diện

- Favicon `CO` tự đổi màu theo light/dark, touch icon và web app manifest từ mark `<CO/>`.
- Màu 4 era trên timeline mới: khác nhau cả sắc lẫn độ sáng, dễ phân biệt hơn với người mù màu.

## 2026-11-12 — Accessibility

- Nút mở palette và nút đóng palette có tên đọc được khớp với chữ hiển thị, cho trình đọc màn hình và điều khiển bằng giọng nói.

## 2026-11-12 — Craft

- Command palette ⌘K / Ctrl+K (cả `/`): đi tới section, dự án, link, đổi theme, bật âm thanh.
- Phím tắt `g h`, `g w`, `g s`, `g b`, `?` (bảng phím tắt).
- Nút đổi light/dark, lưu lựa chọn, không nháy màu khi tải lại.
- Nút âm thanh kiểu game, mặc định tắt.
- Tiêu đề "ATKD Coding" một dòng; trên mobile thanh tiêu đề gọn một hàng.

## 2026-11-12 — Home

- Home đủ 8 section theo design "Terminal": hero kèm cảnh phòng server, timeline 4 era, 6 dự án tiêu biểu theo codename, Signals với số liệu thật (contributions, ngôn ngữ, heatmap 52 tuần), Stream/Tools/Lab ở trạng thái trống.
- Thanh tiêu đề có điều hướng tới từng section.

## 2026-11-12 — Rebuild

- Gỡ toàn bộ site Jekyll cũ, thay bằng trang placeholder theo giao diện "Terminal" của persona ATKD Coding, light và dark.
- Footer ghi nguồn dữ liệu (live hoặc snapshot) và tổng contributions, cập nhật hằng ngày.
- Thêm trang 404, link "Edit on GitHub" trên mỗi trang, license CC BY 4.0 cho nội dung và MIT cho code.
