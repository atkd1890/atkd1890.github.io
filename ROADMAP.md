# Roadmap

Chỉ ghi việc còn mở. Xong thì xoá khỏi đây; quyết định ghi ở [docs/adr](docs/adr/README.md), thay đổi người xem thấy được ghi ở [CHANGELOG.md](CHANGELOG.md). Specs ở [README.md](README.md) và [docs/content.md](docs/content.md), rule cho agent ở [CLAUDE.md](CLAUDE.md).

Tag vai trò, Definition of done của từng vai trò ở CLAUDE.md. Task không có tag là phần lõi của phase.

| Tag        | Vai trò  | Bằng chứng để lại                                                               |
| ---------- | -------- | ------------------------------------------------------------------------------- |
| `[design]` | Designer | Brand, token, artboard trong artifact, case study `atkd-ui`                     |
| `[eng]`    | Engineer | Code qua type-check, ngân sách hiệu năng, Web Components                        |
| `[ops]`    | DevOps   | Workflow, branch protection, Dependabot, runbook trong README, "Proof of craft" |
| `[qa]`     | Tester   | Unit, e2e, visual, axe, Lighthouse CI, link checker, canary của leak guard      |
| `[sec]`    | Security | Leak guard, secret scanning, CSP, `security.txt`                                |
| `[mkt]`    | Marketer | Định vị, giọng văn, lịch nội dung, SEO, launch, đo lường không analytics        |
| `[pm]`     | PM       | Project board, ADR, changelog, retro                                            |

## Mục lục

- [Cần chủ dự án quyết định](#cần-chủ-dự-án-quyết-định)
- [Chủ dự án tự làm](#chủ-dự-án-tự-làm)
- [Phase 1 — Hạ tầng còn thiếu](#phase-1--hạ-tầng-còn-thiếu)
- [Phase 2 — Data pipeline còn thiếu](#phase-2--data-pipeline-còn-thiếu)
- [Phase 3 — Home + craft](#phase-3--home--craft)
- [Phase 4 — Case study](#phase-4--case-study)
- [Phase 5 — Blog](#phase-5--blog)
- [Phase 6 — Tools, lab, uses, colophon](#phase-6--tools-lab-uses-colophon)
- [Phase 8 — Snapshot theo năm](#phase-8--snapshot-theo-năm)
- [Phase 9 — Kiểm tra](#phase-9--kiểm-tra)
- [Phase 10 — Launch và tăng trưởng](#phase-10--launch-và-tăng-trưởng)
- [Định kỳ](#định-kỳ)

## Cần chủ dự án quyết định

- [ ] `[mkt]` Câu định vị ở hero: chọn từ [docs/positioning.md](docs/positioning.md) (4 phương án), duyệt 3 thông điệp và người đọc.
- [ ] `[mkt]` Duyệt [docs/style-guide.md](docs/style-guide.md) (giọng văn, từ không dùng).
- [ ] `[design]` `atkd-ui` có chuyển sang public để site này và hub cùng import token không? Đây là tầng bằng chứng mạnh nhất; repo còn private thì site không được copy CSS từ đó.
- [ ] `[design]` Duyệt canvas [ATKD Coding Design](https://claude.ai/artifact/RXYDQoYg6Z91vRdaQEk6rR) (comment trực tiếp trên artboard), gồm màu 4 era đang đề xuất.
- [ ] Thư viện nào tách ra open source trước.
- [ ] Đề bài game cho series benchmark (thể loại, phạm vi, rubric).
- [ ] Đề tài cho 1–2 explainer tương tác.
- [ ] Có bật giscus không.
- [ ] Handle/link kênh YouTube ATKD Coding.
- [ ] Có dùng chung Action để tự cập nhật profile README `atkd1890/atkd1890` không (repo này chưa tồn tại).

## Chủ dự án tự làm

- [ ] Liệt kê các nơi đang có repo khách hàng (Bitbucket và các tài khoản khác) và phân loại từng repo: của riêng (import) hay của khách hàng (giữ nguyên, đọc qua API) ([ADR 0007](docs/adr/0007-bitbucket-repos.md))
- [ ] Import repo cá nhân từ Bitbucket sang GitHub (private): github.com/new/import, từng repo (chủ dự án làm sau)
- [ ] Thêm các email cũ từng dùng để commit vào github.com/settings/emails (để private), để commit cũ được tính vào contribution calendar
- [ ] Sau khi import: thêm codename vào `showcase.yml` + mapping, thay dữ liệu mẫu của era mobile và indie game
- [ ] `[mkt]` Đọc lại bản dịch tiếng Nhật trong `src/_data/i18n.js`, `showcase.yml`, `site.js`, `uses.js`.
- [ ] `[mkt]` Điền phần editor, terminal, phần cứng của `/uses` trong `src/_data/uses.js`.
- [ ] `[qa]` Thử site trên máy thật (iPhone Safari, Android Chrome); CI chỉ giả lập.
- [ ] `[mkt]` Điền `src/_data/eras.js`: khoảng năm và 1 câu "đã làm gì" cho từng era; `role` và `summary` trong `showcase.yml`.
- [ ] `[sec]` Gửi GitHub Support yêu cầu xoá các commit cũ còn truy cập được qua mã hash (3 squash commit trước khi viết lại history có tên và email cá nhân; history Jekyll cũ).
- [ ] `[sec]` Bổ sung denylist: SĐT, địa chỉ, nơi làm hiện tại, khách hàng khác ([hướng dẫn](README.md#cập-nhật-denylist)).
- [ ] `[sec]` Xem lại các mục denylist ngắn dễ chặn nhầm (mục #6 trùng một từ tiếng Nhật thông dụng, mục #7 ngắn); cân nhắc đổi sang dạng domain.

## Phase 1 — Hạ tầng còn thiếu

- [ ] `[pm]` GitHub Project board: mỗi phase là một milestone, mỗi task là một issue có label vai trò

## Phase 2 — Data pipeline còn thiếu

- [ ] Nguồn dữ liệu ngoài GitHub cho repo khách hàng (Bitbucket và các tài khoản khác): token chỉ đọc mỗi nguồn trong secret, mapping ghi nguồn, số liệu theo codename, tên repo vào leak guard (ADR 0007). Làm sau, khi chủ dự án liệt kê đủ các tài khoản

- [ ] `[qa]` Kiểm chứng quyền Metadata đủ cho mọi field sau mỗi lần đổi query (lỗi thiếu quyền chỉ lộ trên CI)

## Phase 3 — Home + craft

- [ ] Mục Lab trên trang chủ hiện thí nghiệm hoặc kết quả benchmark mới nhất khi có (hiện là trạng thái trống + link `/lab`)
- [ ] `[design]` So triển khai với mockup, ghi chênh lệch

## Phase 4 — Case study

- [ ] Template `/work/<codename>` theo khung case study/postmortem
- [ ] 1 bài nháp mẫu từ dữ liệu chủ dự án đưa, không bịa số
- [ ] `[design]` Case study `atkd-ui`: vấn đề → token → component → áp dụng cho nhiều repo
- [ ] `[mkt]` Mỗi case study có 1 câu tóm tắt dùng được cho mạng xã hội + OG riêng

## Phase 5 — Blog

- [ ] 1 bài `til` + 1 bài `link` thật, để thử luồng issue → PR → merge → publish
- [ ] `[mkt]` Lịch nội dung: nhịp xuất bản mục tiêu cho từng type (vd til 3/tuần, log 1/tuần, deep-dive 1/quý)
- [ ] `[mkt]` Cross-post có `canonical` trỏ về site (dev.to, Zenn/Qiita nếu có bài JA)

## Phase 6 — Tools, lab, uses, colophon

- [ ] Repo tool mẫu đầu tiên (public, topic `atkd-tool`) để `/tools` có dữ liệu thật; cần chủ dự án chọn tool
- [ ] `/lab`: bảng xếp hạng benchmark, đọc từ các bài series `benchmark` khi có kết quả đầu tiên
- [ ] `[ops]` Proof of craft trên `/colophon` thêm điểm Lighthouse và thời gian build lấy từ lần chạy CI gần nhất (hiện có số test, dung lượng JS/CSS, số workflow, số ADR, đọc từ repo)

## Phase 8 — Snapshot theo năm

- [ ] Workflow `snapshot-YYYY` → `/YYYY/`. Test bằng tag thử rồi xoá

## Phase 9 — Kiểm tra

- [ ] Đọc tay lại toàn bộ output trước launch (Lighthouse, link, HTML, leak guard đã tự động)
- [ ] `[ops]` Diễn tập rollback (re-run `Deploy` của commit trước) một lần, ghi thời gian khôi phục vào README; cần chủ dự án đồng ý vì chạm production

## Phase 10 — Launch và tăng trưởng

- [ ] `[mkt]` Điều kiện launch: profile GitHub đã sửa, có ít nhất 1 case study, 5 bài blog, 1 tool
- [ ] `[mkt]` Bài launch: "Building a GitHub-native site" (deep-dive, chính site là case study)
- [ ] `[mkt]` Kênh: Show HN, Reddit (r/webdev, r/gamedev tùy bài), X, cộng đồng VN/JP, YouTube ATKD Coding
- [ ] `[mkt]` Đo lường không analytics: GitHub traffic API (views/clones/referrers), stars, ước lượng RSS; tổng hợp tự động vào `log` hằng tuần
- [ ] `[mkt]` Profile README `atkd1890/atkd1890` đồng bộ dữ liệu với site
- [ ] `[pm]` Retro sau launch: viết thành 1 bài `note` hoặc postmortem

## Định kỳ

- Khi có issue "SHOWCASE_TOKEN expires…" `[sec]`: tạo token mới theo hướng dẫn trong issue, rồi đóng issue. Issue tự mở 14 ngày trước hạn.
- Khi đổi việc, có khách hàng mới hoặc đổi thông tin liên lạc `[sec]`: cập nhật denylist, `npm run secrets:push`.
- Khi thêm dự án vào showcase `[pm]`: thêm vào `showcase.yml` và mapping, `npm run secrets:push`.
- Khi repo không có commit 60 ngày `[ops]`: GitHub tắt cron, bật lại workflow `Deploy` ở tab Actions.
