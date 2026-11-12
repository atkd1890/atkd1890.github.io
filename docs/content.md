# Nội dung

Spec về nội dung của site: chiến lược, từng section của home, các loại bài, series, `/tools`. Mọi trang có 3 ngôn ngữ, tiếng Việt mặc định ([ADR 0006](adr/0006-i18n.md)). Phần kỹ thuật (hợp đồng frontmatter, schema, leak guard) ở [README](../README.md#specs).

## Mục lục

- [Chiến lược](#chiến-lược)
- [Home](#home)
- [Blog](#blog)
  - [Loại bài](#loại-bài)
  - [Series](#series)
  - [Explainer tương tác](#explainer-tương-tác)
- [Viết một bài](#viết-một-bài)
- [Tools](#tools)
- [Snapshot theo năm](#snapshot-theo-năm)

## Chiến lược

- **Volume do agent lo**: TIL, link, log, release, benchmark. Mỗi bài tốn vài phút, xuất bản đều.
- **Bài đinh do người lo**: 1–2 explainer tương tác và vài case study/postmortem. Đây là phần tạo danh tiếng.
- **Code thật là đồ mới**: `/tools` và các demo làm trong kỷ nguyên AI. Public được vì không dính NDA.
- Giọng văn: show off nhưng có số liệu. Ưu tiên con số và sơ đồ hơn tính từ.

## Home

Theo thứ tự, mockup ở artboard `HomeMobile` và `HomeDesktop`:

1. **Hero**: "ATKD Coding" + 1 câu định vị (placeholder: "Lead engineer. Mobile → indie games → systems → AI.") + dòng live "Now shipping: …" (chỉ hiện codename).
2. **Trajectory**: timeline 4 era. Mỗi era có khoảng năm, stack, 1 câu "đã làm gì", số liệu tổng hợp và 1 dự án tiêu biểu. Gợi ý stack lấy từ site cũ: Obj-C/Swift, Android, Unity, React Native, HTML/CSS, React, Node, PHP, Python, MySQL, REST, AWS, GCP.
3. **Selected work**: 4–6 repo card, có badge tầng bằng chứng.
4. **Signals**: dashboard tự cập nhật hằng ngày. Era mobile và indie-game không có dữ liệu trên GitHub, nên Signals chủ yếu phản ánh giai đoạn AI; hai era đó tạm dùng demo data có nhãn.
5. **Stream**: dòng thời gian trộn mọi type. Deep-dive nổi lên đầu, bên dưới là til/link/log dạng gọn.
6. **Tools & playground**: tool mới nhất + demo/game chơi được.
7. **Lab (teaser)**: kết quả benchmark mới nhất + 1–2 thí nghiệm AI.
8. **Footer**: link về atkd1890.me, GitHub, YouTube ATKD Coding (TODO), hi@atkd1890.me, RSS, /uses, /colophon, các năm lưu trữ.

## Blog

### Loại bài

| type         | Nguồn                                                         | Công sức của chủ site |
| ------------ | ------------------------------------------------------------- | --------------------- |
| `til`        | Commit, session Claude Code, ý tưởng 1 dòng                   | 0–1 dòng              |
| `link`       | Link/repo hay + 1–3 câu nhận xét (GitHub stars, bookmark)     | 0, chỉ merge          |
| `log`        | Build log hằng tuần, map hoạt động sang codename              | 0, chỉ merge          |
| `release`    | Tự sinh từ GitHub Releases của repo public                    | 0                     |
| `note`       | Ghi chú/ý kiến ngắn                                           | 1 dòng                |
| `deep-dive`  | Bài kỹ thuật dài, có thể là explainer tương tác               | Duyệt kỹ / tự viết    |
| `case-study` | Từ `showcase.yml` + tài liệu dự án, gồm cả postmortem game cũ | Duyệt kỹ              |
| `cross`      | Chuyển thể video YouTube ATKD Coding (từ transcript)          | 0, chỉ merge          |

### Series

- `series` là field tùy chọn. Mỗi series có trang riêng `/blog/series/<id>`.
- Series đầu tiên là **`benchmark`**: mỗi model/agent mới phải dựng cùng một prototype game nhỏ theo một đề bài cố định (`lab/benchmark/SPEC.md`). Mỗi lần chạy có bản build chơi được, điểm theo rubric, thời gian/chi phí và nhận xét. Kết quả gom thành bảng xếp hạng ở `/lab`.

### Explainer tương tác

- Bài `deep-dive` được nhúng Web Components từ `src/_includes/interactive/`. JS chỉ load trên trang có dùng.
- Mục tiêu: 1–2 bài đinh về game/system (đề tài chốt sau).

## Viết một bài

- **File**: `src/blog/<năm>/<YYYY-MM-DD>-<slug>.md` cho bản tiếng Việt, thêm `.en.md` hoặc `.ja.md` cho bản dịch, cùng `slug`. URL: `/blog/<slug>/`, `/en/blog/<slug>/`, `/ja/blog/<slug>/`.
- **Frontmatter** theo hợp đồng ở README, có thêm `interactive: [<component>]` (tuỳ chọn). Sai một field là build fail kèm tên file và field.
- **Nháp**: `draft: true` chỉ build khi `DRAFTS=1` (preview của PR, e2e), không bao giờ lên production.
- **Ảnh** đặt cạnh bài: `src/blog/<năm>/<slug>/…`.
- **Ảnh chụp màn hình thật**, có light và dark, tự đổi theo theme:
  ```sh
  npm run screenshot -- https://atkd1890.github.io/ src/blog/2026/<slug>/home 1280 800
  ```
  Trong bài: `{% shot "/blog/2026/<slug>/home", "Mô tả", 1280, 800 %}`.
- **Sơ đồ**: viết Mermaid vào `src/blog/<năm>/<slug>/<tên>.mmd`, chạy `npm run diagrams` để sinh `.svg` (màu là biến CSS, tự đổi theo theme), commit cả hai. Trong bài: `{% diagram "blog/2026/<slug>/<tên>", "Mô tả" %}`.
- **Component tương tác**: Web Component ở `src/_includes/interactive/<tên>.js`, chỉ tải ở bài liệt kê nó trong `interactive`. Hiện có `leak-guard-demo` (gõ một câu, xem leak guard có chặn không, với denylist giả).
- **Bài do agent soạn**: `source: agent` và `agent_run`; site hiện nhãn "AI hỗ trợ viết".
- **Quy trình**: issue `blog-idea` → nhánh `post/<slug>` → PR có label `blog-draft` → CI (schema, leak guard trên cả nháp, e2e, preview artifact) → merge là xuất bản. Trang `/blog/` có nút "Viết bài mới trên GitHub" mở sẵn frontmatter.

## Tools

- Mỗi tool là một repo public `atkd1890/tool-<name>` gồm 1 file HTML, bật Pages → `/tool-<name>`.
- Danh mục lấy từ GitHub API: repo public có topic `atkd-tool` (description, topics, ngày tạo, link). Thêm tool không cần sửa site.
- Mỗi tool ghi "built with" (topic `built-with-<model>`) + link prompt/transcript nếu có.

## Snapshot theo năm

- Tag `snapshot-YYYY` → build vào `/YYYY/`, giữ cố định ở các lần deploy sau (lưu dạng artifact hoặc branch `snapshots`).
- giscus (tùy chọn) cho `/blog/*`, `/work/*`.
