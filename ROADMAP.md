# Roadmap

Chỉ ghi việc còn mở. Xong thì xoá khỏi đây; quyết định ghi ở [docs/adr](docs/adr/README.md), thay đổi người xem thấy được ghi ở [CHANGELOG.md](CHANGELOG.md). Specs ở [README.md](README.md) và [docs/content.md](docs/content.md), rule cho agent ở [CLAUDE.md](CLAUDE.md).

Tag vai trò, Definition of done của từng vai trò ở CLAUDE.md. Task không có tag là phần lõi của phase.

| Tag        | Vai trò  | Bằng chứng để lại                                                          |
| ---------- | -------- | -------------------------------------------------------------------------- |
| `[design]` | Designer | Brand, token, artboard trong artifact, case study `atkd-ui`                 |
| `[eng]`    | Engineer | Code qua type-check, ngân sách hiệu năng, Web Components                    |
| `[ops]`    | DevOps   | Workflow, branch protection, Dependabot, runbook trong README, "Proof of craft" |
| `[qa]`     | Tester   | Unit, e2e, visual, axe, Lighthouse CI, link checker, canary của leak guard  |
| `[sec]`    | Security | Leak guard, secret scanning, CSP, `security.txt`                           |
| `[mkt]`    | Marketer | Định vị, giọng văn, lịch nội dung, SEO, launch, đo lường không analytics    |
| `[pm]`     | PM       | Project board, ADR, changelog, retro                                       |

## Mục lục

- [Cần chủ dự án quyết định](#cần-chủ-dự-án-quyết-định)
- [Chủ dự án tự làm](#chủ-dự-án-tự-làm)
- [Phase 1 — Hạ tầng còn thiếu](#phase-1--hạ-tầng-còn-thiếu)
- [Phase 2 — Data pipeline còn thiếu](#phase-2--data-pipeline-còn-thiếu)
- [Phase 2.5 — Design direction](#phase-25--design-direction)
- [Phase 3 — Home + craft](#phase-3--home--craft)
- [Phase 4 — Case study](#phase-4--case-study)
- [Phase 5 — Blog](#phase-5--blog)
- [Phase 6 — Tools, lab, uses, colophon](#phase-6--tools-lab-uses-colophon)
- [Phase 7 — SEO, share, search](#phase-7--seo-share-search)
- [Phase 8 — Snapshot theo năm](#phase-8--snapshot-theo-năm)
- [Phase 9 — Kiểm tra](#phase-9--kiểm-tra)
- [Phase 10 — Launch và tăng trưởng](#phase-10--launch-và-tăng-trưởng)
- [Định kỳ](#định-kỳ)

## Cần chủ dự án quyết định

- [ ] `[mkt]` Ngôn ngữ site và blog: chỉ EN, hay EN + VI/JA?
- [ ] `[mkt]` Câu định vị ở hero.
- [ ] `[design]` `atkd-ui` có chuyển sang public để site này và hub cùng import token không? Đây là tầng bằng chứng mạnh nhất; repo còn private thì site không được copy CSS từ đó.
- [ ] `[design]` Duyệt canvas [ATKD Coding Design](https://claude.ai/artifact/RXYDQoYg6Z91vRdaQEk6rR) (comment trực tiếp trên artboard), gồm màu 4 era đang đề xuất.
- [ ] Thư viện nào tách ra open source trước.
- [ ] Đề bài game cho series benchmark (thể loại, phạm vi, rubric).
- [ ] Đề tài cho 1–2 explainer tương tác.
- [ ] Có bật giscus không.
- [ ] Handle/link kênh YouTube ATKD Coding.
- [ ] Có dùng chung Action để tự cập nhật profile README `atkd1890/atkd1890` không (repo này chưa tồn tại).

## Chủ dự án tự làm

- [ ] `[sec]` Sửa profile GitHub: name, ẩn email, location, bio, twitter, tắt hireable. Phải xong trước khi giới thiệu site.
- [ ] `[sec]` Bổ sung denylist: SĐT, địa chỉ, nơi làm hiện tại, khách hàng khác ([hướng dẫn](README.md#cập-nhật-denylist)).
- [ ] `[sec]` Xem lại các mục denylist ngắn dễ chặn nhầm (mục #6 trùng một từ tiếng Nhật thông dụng, mục #7 ngắn); cân nhắc đổi sang dạng domain.
- [ ] `[sec]` History cũ có thể còn trong cache, fork hoặc Wayback: gửi yêu cầu gỡ nếu cần, hoặc nhờ GitHub Support xoá commit cũ còn truy cập được qua hash.

## Phase 1 — Hạ tầng còn thiếu

- [ ] `[ops]` Branch protection cho `main`: bắt buộc qua PR, `PR check` phải pass, cấm force-push
- [ ] `[ops]` Pin mọi action theo commit SHA, `permissions` tối thiểu cho từng job; Dependabot cho npm + GitHub Actions
- [ ] `[sec]` Bật secret scanning + push protection cho repo
- [ ] `[eng]` Format và lint: Prettier (cùng cấu hình với hub), Stylelint, ESLint; chạy trong `pr.yml`
- [ ] `[pm]` GitHub Project board: mỗi phase là một milestone, mỗi task là một issue có label vai trò

## Phase 2 — Data pipeline còn thiếu

- [ ] `[sec]` Leak guard bắt thêm theo mẫu như PII scan của hub: email ngoài domain cho phép, SĐT VN/JP; vẫn không in giá trị bị khớp
- [ ] `[qa]` Kiểm chứng quyền Metadata đủ cho mọi field sau mỗi lần đổi query (lỗi thiếu quyền chỉ lộ trên CI)

## Phase 2.5 — Design direction

- [ ] `[design]` Brand: favicon/app icon từ mark `<CO/>`, chốt màu 4 era
- [ ] `[design]` Type scale, grid, spacing, elevation dưới dạng token; tương phản đạt WCAG AA cả light lẫn dark
- [ ] `[design]` Motion principles: thời lượng, easing, chỗ được dùng; bản reduced-motion
- [ ] `[design]` Sound design: bộ âm click/hover nhỏ, âm lượng, chỗ được phát (mặc định tắt)
- [ ] `[design]` Template OG image theo khuôn OG của hub (nền tối, tên lớn, dải màu persona slate `#5B6472`)
- [ ] `[mkt]` Positioning: câu định vị, 3 thông điệp chính, đối tượng đọc (engineer, tech lead, founder)
- [ ] `[mkt]` Style guide giọng văn: số liệu trước tính từ, độ dài câu, cách viết tiêu đề, từ cấm

## Phase 3 — Home + craft

- [ ] Đủ 8 section theo [docs/content.md](docs/content.md#home). Mobile-first, kiểm tra ở 375px
- [ ] Command palette ⌘K, phím tắt (`g h`, `g b`, `/`, `?`)
- [ ] Nút âm thanh (mặc định tắt), theme toggle
- [ ] `[eng]` Ngân sách hiệu năng: JS mỗi trang ≤ 30 KB gzip, CSS ≤ 20 KB, không font chặn render; CI fail nếu vượt
- [ ] `[qa]` Playwright e2e: palette, phím tắt, theme toggle, âm thanh mặc định tắt
- [ ] `[qa]` Visual regression: 375/1280 × light/dark, so với baseline
- [ ] `[qa]` axe-core trong CI: 0 lỗi mức serious/critical
- [ ] `[design]` So triển khai với mockup, ghi chênh lệch

## Phase 4 — Case study

- [ ] Template `/work/<codename>` theo khung case study/postmortem
- [ ] 1 bài nháp mẫu từ dữ liệu chủ dự án đưa, không bịa số
- [ ] `[design]` Case study `atkd-ui`: vấn đề → token → component → áp dụng cho nhiều repo
- [ ] `[mkt]` Mỗi case study có 1 câu tóm tắt dùng được cho mạng xã hội + OG riêng

## Phase 5 — Blog

- [ ] `/blog`, `/blog/<slug>`, lọc type/tag/series, lưu trữ theo năm, `/blog/series/<id>`
- [ ] Layout riêng theo type (til/link gọn, deep-dive đầy đủ)
- [ ] `/feed.xml` + `/feed/<type>.xml`
- [ ] Validate frontmatter, badge "AI-assisted"
- [ ] Sinh `release` tự động từ GitHub Releases
- [ ] Issue template `blog-idea`, labels `blog-idea` / `blog-draft`, PR template (checklist: leak guard, số liệu có nguồn, ảnh sạch EXIF)
- [ ] Nút "New post" mở trình soạn của GitHub với frontmatter điền sẵn
- [ ] 1 bài `til` + 1 bài `link` mẫu viết tay, để test luồng PR → merge → publish
- [ ] Hạ tầng explainer tương tác + 1 component demo
- [ ] `[qa]` Validate feed (Atom hợp lệ), test bộ lọc type/tag/series
- [ ] `[mkt]` Lịch nội dung: nhịp xuất bản mục tiêu cho từng type (vd til 3/tuần, log 1/tuần, deep-dive 1/quý)
- [ ] `[mkt]` Cross-post có `canonical` trỏ về site (dev.to, Zenn/Qiita nếu có bài JA)

## Phase 6 — Tools, lab, uses, colophon

- [ ] `/tools` từ topic `atkd-tool`, kèm 1 repo tool mẫu để test
- [ ] `/lab`: kiến trúc ATKD OS (Mermaid, mức trừu tượng), danh sách thí nghiệm, `lab/benchmark/SPEC.md` (nháp, chờ duyệt), bảng xếp hạng benchmark
- [ ] `/uses`: khung + `TODO`
- [ ] `/colophon`: pipeline thật, sinh một phần từ cấu hình (version 11ty, workflows)
- [ ] `[ops]` "Proof of craft" trên `/colophon`, tự cập nhật từ CI: điểm Lighthouse, số test, thời gian build, dung lượng JS/CSS, số ADR, lần deploy gần nhất
- [ ] `[pm]` `/colophon` liệt kê ADR và CHANGELOG

## Phase 7 — SEO, share, search

- [ ] OG image sinh lúc build (home, case study, blog, tool)
- [ ] Pagefind, sitemap, robots, canonical
- [ ] `[mkt]` JSON-LD (Person là persona, không tên thật; BlogPosting; SoftwareApplication cho tool)
- [ ] `[sec]` CSP qua `<meta>`, SRI cho mọi script ngoài, `/.well-known/security.txt` (hi@atkd1890.me)

## Phase 8 — Snapshot theo năm

- [ ] Workflow `snapshot-YYYY` → `/YYYY/`. Test bằng tag thử rồi xoá

## Phase 9 — Kiểm tra

- [ ] Lighthouse ≥ 95, check link ngoài, leak guard pass, đọc tay lại toàn bộ output
- [ ] Test bàn phím (palette, phím tắt), reduced-motion, âm thanh mặc định tắt
- [ ] `[qa]` Lighthouse CI trên mỗi PR với budget
- [ ] `[qa]` Link checker theo cron hằng tuần, tự mở issue khi có link chết
- [ ] `[qa]` HTML validation; test trên Safari iOS, Chrome Android, Firefox
- [ ] `[ops]` Uptime check theo cron, mở issue khi site không trả 200
- [ ] `[ops]` Diễn tập rollback (re-run `Deploy` của commit trước) một lần, ghi thời gian khôi phục vào README

## Phase 10 — Launch và tăng trưởng

- [ ] `[mkt]` Điều kiện launch: profile GitHub đã sửa, có ít nhất 1 case study, 5 bài blog, 1 tool
- [ ] `[mkt]` Bài launch: "Building a GitHub-native site" (deep-dive, chính site là case study)
- [ ] `[mkt]` Kênh: Show HN, Reddit (r/webdev, r/gamedev tùy bài), X, cộng đồng VN/JP, YouTube ATKD Coding
- [ ] `[mkt]` Đo lường không analytics: GitHub traffic API (views/clones/referrers), stars, ước lượng RSS; tổng hợp tự động vào `log` hằng tuần
- [ ] `[mkt]` Profile README `atkd1890/atkd1890` đồng bộ dữ liệu với site
- [ ] `[pm]` Retro sau launch: viết thành 1 bài `note` hoặc postmortem

## Định kỳ

- Trước ngày hết hạn của `SHOWCASE_TOKEN` `[sec]`: tạo token mới, `gh secret set SHOWCASE_TOKEN`. Hết hạn thì site tự quay về snapshot.
- Khi đổi việc, có khách hàng mới hoặc đổi thông tin liên lạc `[sec]`: cập nhật denylist, `npm run secrets:push`.
- Khi thêm dự án vào showcase `[pm]`: thêm vào `showcase.yml` và mapping, `npm run secrets:push`.
- Khi repo không có commit 60 ngày `[ops]`: GitHub tắt cron, bật lại workflow `Deploy` ở tab Actions.
