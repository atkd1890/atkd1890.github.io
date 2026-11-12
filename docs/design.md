# Design — ATKD Coding

Tài liệu nguồn chuẩn cho giao diện của site. Lấy từ bản thiết kế hub atkd1890.me (persona **5 · Coding — Terminal** + phần nền chung), rồi mở rộng cho một site nhiều trang.

**Canvas thiết kế:** [ATKD Coding Design](https://claude.ai/artifact/RXYDQoYg6Z91vRdaQEk6rR) (private). Có 6 artboard: Foundations, Home mobile 390, Home desktop 1440 (có palette ⌘K mở được), Blog (index ⇄ post, lọc theo type), Case study, Nhận diện (favicon, OG image). Canvas là bản nhìn, file này là bản chữ; khi lệch nhau thì sửa cả hai.

**Nguyên tắc đồng bộ:** đồng bộ ở mức **core** (token màu, font, hình dạng, motif, kích thước chạm, theme contract). Không tái hiện 100%: bio page bên hub là one-page cho mobile, còn site này có home, blog, case study, lab, tools…

## Mục lục

- [1. Bản sắc: "Terminal"](#1-bản-sắc-terminal)
- [2. Token màu](#2-token-màu)
- [3. Chữ](#3-chữ)
- [4. Khoảng cách, hình dạng, kích thước](#4-khoảng-cách-hình-dạng-kích-thước)
- [5. Thanh điều khiển](#5-thanh-điều-khiển)
- [6. Motion](#6-motion)
- [7. Âm thanh](#7-âm-thanh)
- [8. Icon và OG image](#8-icon-và-og-image)
- [9. Liên kết với hub](#9-liên-kết-với-hub)
- [10. Phần site tự thiết kế thêm](#10-phần-site-tự-thiết-kế-thêm)

## 1. Bản sắc: "Terminal"

- Mỗi khối nội dung là **một lệnh terminal**: nhãn section viết dạng prompt (`$ whoami`, `$ ls work/`, `$ git log --oneline`, `$ cat`, `$ mail`).
- Logo mark: `<CO/>` trong khung vuông viền accent. Wordmark: "ATKD Coding" **một dòng**.
- Thanh tiêu đề kiểu cửa sổ shell: `~/atkd-coding — zsh`.
- Con trỏ khối nhấp nháy ở CTA chính (tắt khi `prefers-reduced-motion`).
- Link trong danh sách có tiền tố `->` màu accent.
- Commit hash và các số liệu nhỏ dùng màu `--hash`.
- Decor: cảnh phòng server (rack, màn hình, dev đeo headphone, vầng sáng accent), SVG `aria-hidden`.

## 2. Token màu

Theo theme contract của hub, mỗi persona bắt buộc có đủ `--bg --fg --muted --line --accent` cho cả light và dark. Coding có thêm `--prompt`, `--hash`, `--panel`, `--inv`, `--sys`.

| Token      | Light     | Dark      | Dùng cho                         |
| ---------- | --------- | --------- | -------------------------------- |
| `--bg`     | `#F4F5F8` | `#0D1117` | Nền trang                        |
| `--fg`     | `#1E2330` | `#E6EDF3` | Chữ chính                        |
| `--muted`  | `#5A6172` | `#8F9AAA` | Chữ phụ, nhãn                    |
| `--line`   | `#CBD0DB` | `#2A3340` | Viền, kẻ                         |
| `--panel`  | `#E7E9F0` | `#161B22` | Thanh tiêu đề, nền tile/card     |
| `--accent` | `#4338CA` | `#7DD3FC` | CTA, logo, link, focus           |
| `--prompt` | `#0F6B62` | `#5EEAD4` | Dòng `$ lệnh`                    |
| `--hash`   | `#9A3412` | `#FDBA74` | Hash, số liệu nhỏ, highlight phụ |
| `--inv`    | `#FFFFFF` | `#0D1117` | Chữ trên nền accent              |
| `--sys`    | `#5A6172` | `#C3CAD5` | Màu phụ trong biểu đồ ngôn ngữ   |

**Màu 4 era** (mở rộng so với hub, đã chốt). Khác nhau cả hue lẫn độ sáng, đạt AA khi làm chữ trên `--bg` và `--panel`:

| Token              | Light     | Dark      |
| ------------------ | --------- | --------- |
| `--era-mobile`     | `#9A3412` | `#FED7AA` |
| `--era-indie-game` | `#0F766E` | `#2DD4BF` |
| `--era-system`     | `#3F4656` | `#8F9AAA` |
| `--era-ai`         | `#312E81` | `#7DD3FC` |

- Heatmap dùng `--heat-0` … `--heat-4` (đậm dần theo accent), chỉ là hình trang trí; số liệu luôn có bản chữ đi kèm.
- **Màu đại diện của Coding trên hub:** `#5B6472` (slate).
- **Kiểm tra tự động:** `tests/contrast.test.js` đọc token trong `main.css` và fail nếu cặp chữ/nền nào dưới 4.5:1, nếu 4 màu era quá gần nhau về độ sáng, hoặc nếu token dark trong media query lệch với bản `data-theme='dark'`.

## 3. Chữ

- **Display / UI / code:** JetBrains Mono 400 và 700, tự host (subset latin + vietnamese, gói `@fontsource/jetbrains-mono`, OFL-1.1). Đây là webfont duy nhất.
- **Body dài** (blog, case study): font hệ thống sans. Đây là điểm **mở rộng** so với hub: bài dài đọc bằng monospace rất mệt.
- **`:lang(ja)`:** luôn dùng font hệ thống.
- **Thang chữ** `--fs-N` = N px: 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24. Tiêu đề co giãn: `--fs-h1` (hero), `--fs-h2` (section), `--fs-stat` (số trong tile).
- H1 hero: 700, line-height 1.05, letter-spacing −0.03em, một dòng.

## 4. Khoảng cách, hình dạng, kích thước

- **Khoảng cách** `--sp-N` = N × 2px: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64. `gap`, `padding`, `margin` chỉ dùng các token này.
- **Grid:** nội dung đọc rộng tối đa `--measure` (46rem), home rộng `--wide` (75rem). Gutter 16px trên mobile, 32px từ 1024px.
- **Góc vuông** (`--radius: 0`). Đây là đặc trưng của Coding; hub mặc định bo góc, persona này không.
- **Elevation:** chỉ dialog có bóng (`--shadow-dialog`) và nền mờ phía sau (`--backdrop`). Card dùng viền 1px `--line`, không đổ bóng.
- Vùng chạm tối thiểu `--tap-min: 44px`; nút chính ≥ 60px; dòng link ≥ 52px.
- Breakpoint: mobile < 1024px, desktop ≥ 1024px (theo hub).
- Icon: SVG nét 1.8, `currentColor`, không dùng emoji.
- Focus: outline 3px, offset 2px, màu `--accent`.

## 5. Thanh điều khiển

Trên mobile: nhãn shell + ⌘K + âm thanh + theme, một hàng. Từ 1024px có thêm điều hướng section. Nút ngôn ngữ `VI EN JA` như hub chỉ thêm khi chốt câu hỏi ngôn ngữ trong ROADMAP.

## 6. Motion

- **Ít và có lý do.** Chỉ có: con trỏ nhấp nháy (`steps(1)`, `--blink` 1.1s) và đổi màu khi hover/focus (`--dur` 150ms, `--ease`). Không có chuyển động trang trí khi cuộn, không parallax.
- Chuyển động không bao giờ chặn việc đọc hay làm chậm tương tác.
- `prefers-reduced-motion: reduce` tắt toàn bộ animation và transition (có e2e kiểm tra).

## 7. Âm thanh

- **Mặc định tắt**, chỉ bật khi người xem bấm; lựa chọn được lưu.
- Âm tổng hợp bằng Web Audio, không tải file: sóng vuông 50ms, âm lượng 0.04, kiểu UI game cũ.
- Chỉ phát khi có hành động: bấm link/nút (880 Hz), mở palette (660 Hz), di chuyển trong palette (990 Hz), chọn mục (1100 Hz), bật/tắt âm (1320/440 Hz). Không phát khi hover hay cuộn.
- Nút có `aria-pressed` để trình đọc màn hình biết trạng thái.

## 8. Icon và OG image

- **Favicon:** `src/assets/icons/favicon.svg`, chữ "CO" trong khung, tự đổi màu theo light/dark. Ở ≤ 32px chỉ dùng "CO" vì `<CO/>` không đọc được.
- **Touch icon và manifest:** PNG 180/192/512 có đủ `<CO/>`, render bằng `node scripts/gen-icons.js` với chính JetBrains Mono của site; file kết quả được commit.
- **OG image 1200×630** (artboard Nhận diện), mọi trang đều có, chụp lúc build bằng `scripts/og.js` với CSS của site: nền tối cố định, thanh shell kèm mã ngôn ngữ, dòng lệnh theo loại trang (`cat` cho bài viết, `cd` cho trang khác), badge theo type của bài, tiêu đề tự co từ 60px xuống 40px để vừa tối đa 3 dòng, mô tả tối đa 2 dòng, mark + "ATKD Coding" + domain, dải 4 màu era ở đáy. Chữ lấy từ `og:title`, `og:description` và `article:section` của trang đã build.

## 9. Liên kết với hub

- Home của Coding trên hub trỏ về `atkd1890.github.io`. Footer site này trỏ lại `atkd1890.me`.
- OG image theo tinh thần của hub (nền tối, tên lớn, 1 câu, dải màu), nhưng dải màu là 4 era thay vì 7 persona.
- Wordmark hub `atkd1890` (Space Grotesk) **không** dùng ở đây. Site dùng "ATKD Coding" bằng JetBrains Mono cùng mark `<CO/>`.

## 10. Phần site tự thiết kế thêm

Repo card, badge tầng bằng chứng, timeline era, stat tile, heatmap, stream item, command palette, dialog phím tắt, layout bài blog/case study, bảng benchmark. Tất cả chỉ dùng token ở trên.
