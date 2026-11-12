# Design — ATKD Coding

Tài liệu nguồn chuẩn cho giao diện của site. Lấy từ bản thiết kế hub atkd1890.me (persona **5 · Coding — Terminal** + phần nền chung), rồi mở rộng cho một site nhiều trang.

**Canvas thiết kế:** [ATKD Coding Design](https://claude.ai/artifact/RXYDQoYg6Z91vRdaQEk6rR) (private). Có 5 artboard: Foundations, Home mobile 390, Home desktop 1440 (có palette ⌘K mở được), Blog (index ⇄ post, lọc theo type), Case study. Tất cả có nút đổi light/dark. Canvas là bản nhìn, file này là bản chữ; khi lệch nhau thì sửa cả hai.

**Nguyên tắc đồng bộ:** đồng bộ ở mức **core** (token màu, font, hình dạng, motif, kích thước chạm, theme contract). Không tái hiện 100%: bio page bên hub là one-page cho mobile, còn site này có home, blog, case study, lab, tools…

## Mục lục

- [1. Bản sắc: "Terminal"](#1-bản-sắc-terminal)
- [2. Token màu](#2-token-màu)
- [3. Chữ](#3-chữ)
- [4. Hình dạng và kích thước](#4-hình-dạng-và-kích-thước)
- [5. Thanh điều khiển](#5-thanh-điều-khiển)
- [6. Motion](#6-motion)
- [7. Liên kết với hub](#7-liên-kết-với-hub)
- [8. Phần site tự thiết kế thêm](#8-phần-site-tự-thiết-kế-thêm-ngoài-phạm-vi-hub)

## 1. Bản sắc: "Terminal"

- Mỗi khối nội dung là **một lệnh terminal**: nhãn section viết dạng prompt (`$ whoami`, `$ ls work/`, `$ git log --oneline`, `$ cat`, `$ mail`).
- Logo mark: `<CO/>` trong khung vuông viền accent.
- Thanh tiêu đề kiểu cửa sổ shell: `~/atkd-coding — zsh`.
- Con trỏ khối nhấp nháy ở CTA chính (tắt khi `prefers-reduced-motion`).
- Link trong danh sách có tiền tố `->` màu accent.
- Commit hash và các số liệu nhỏ dùng màu `--hash`.
- Cột số dòng (gutter) chỉ dùng làm trang trí ở hero/home, không dùng trong bài viết dài.
- Decor: cảnh phòng server (rack, màn hình, dev đeo headphone, vầng sáng accent), SVG `aria-hidden`.

## 2. Token màu

Theo theme contract của hub, mỗi persona bắt buộc có đủ `--bg --fg --muted --line --accent` cho cả light và dark. Coding có thêm `--prompt`, `--hash`, `--panel`, `--inv`.

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `--bg` | `#F4F5F8` | `#0D1117` | Nền trang |
| `--fg` | `#1E2330` | `#E6EDF3` | Chữ chính |
| `--muted` | `#5A6172` | `#8F9AAA` | Chữ phụ, gutter, nhãn |
| `--line` | `#CBD0DB` | `#2A3340` | Viền, kẻ |
| `--panel` | `#E7E9F0` | `#161B22` | Thanh tiêu đề, nền link/card |
| `--accent` | `#4338CA` | `#7DD3FC` | CTA, logo, link, focus glow |
| `--prompt` | `#0F6B62` | `#5EEAD4` | Dòng `$ lệnh` |
| `--hash` | `#9A3412` | `#FDBA74` | Hash, số liệu nhỏ, highlight phụ |
| `--inv` | `#FFFFFF` | `#0D1117` | Chữ trên nền accent |

- **Màu đại diện của Coding trên hub:** `#5B6472` (slate), dùng cho avatar `CO` và dải màu trên OG image.
- **Mở rộng cho site (chưa có ở hub):** 4 màu era cho timeline Trajectory sẽ chốt ở Phase 2.5. Chúng phải khác nhau cả về độ sáng, không chỉ hue, và đạt 3:1 trên `--bg`.
- Mọi cặp chữ/nền đạt WCAG AA (4.5:1), kể cả nhãn 11–13px.

## 3. Chữ

- **Display / UI / code:** JetBrains Mono 400 và 700, tự host (subset latin + vietnamese, gói `@fontsource/jetbrains-mono`, OFL-1.1). Đây là webfont duy nhất (theo contract: tối đa 1 webfont, đủ dấu tiếng Việt).
- **Body dài** (blog, case study): font hệ thống sans. Đây là điểm **mở rộng** so với hub: bài dài đọc bằng monospace rất mệt.
- **`:lang(ja)`:** luôn dùng font hệ thống (`Hiragino Sans`, `Yu Gothic`, `Noto Sans JP`).
- H1 hero: 700, line-height ~1.02, letter-spacing −0.03em.

## 4. Hình dạng và kích thước

- **Góc vuông** (`--radius: 0`). Đây là đặc trưng của Coding; hub mặc định bo 10–14px, nhưng persona này không bo.
- Viền 1px `--line`. Nền card/link dùng `--panel`.
- Vùng chạm tối thiểu `--tap-min: 44px`; nút chính ≥ 60px; dòng link ≥ 52px.
- Gutter `16px` trên mobile.
- Breakpoint: mobile < 1024px, desktop ≥ 1024px (theo hub).
- Icon: SVG nét (stroke) 1.8, `currentColor`, không dùng emoji.
- Focus: outline 3px, offset 2px, màu `--accent`.

## 5. Thanh điều khiển

Giống hub: nút ngôn ngữ `VI EN JA` (44×44, đang chọn thì màu `--accent`, còn lại `--muted`) và nút light/dark (icon trăng). Có nút ngôn ngữ hay không còn tùy câu hỏi mở 1 trong ROADMAP. Site thêm nút âm thanh (mặc định tắt) và gợi ý ⌘K.

## 6. Motion

- Chỉ có: con trỏ nhấp nháy (`steps(1)`, 1.1s), hover/focus ngắn (≤ 150ms).
- `prefers-reduced-motion: reduce` → tắt toàn bộ animation.

## 7. Liên kết với hub

- Home của Coding trên hub trỏ về `atkd1890.github.io`. Footer site này trỏ lại `atkd1890.me`.
- OG image theo khuôn của hub: nền tối, tên lớn, 1 câu, dải màu persona. Bản Coding dùng JetBrains Mono và màu slate.
- Wordmark hub `atkd1890` (Space Grotesk) **không** dùng ở đây. Site dùng wordmark "ATKD Coding" bằng JetBrains Mono cùng mark `<CO/>`.

## 8. Phần site tự thiết kế thêm (ngoài phạm vi hub)

Repo card, badge tầng bằng chứng, timeline era, stat tile, heatmap, stream item, command palette, layout bài blog/case study, bảng benchmark. Tất cả chỉ được dùng token ở trên. Mockup duyệt ở Phase 2.5.
