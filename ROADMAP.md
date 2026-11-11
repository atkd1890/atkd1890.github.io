# ROADMAP — Rebuild atkd1890.github.io

Tổng quan dự án ở [README.md](README.md), luật cho agent ở [CLAUDE.md](CLAUDE.md). File này giữ chiến lược nội dung, thiết kế trang, các phase và câu hỏi mở.

## Bối cảnh

- Site Jekyll cũ (1 file `index.md`, commit cuối 2022) được làm lại từ đầu.
- Đây là home của persona ATKD Coding. atkd1890.me (hub tổng, repo khác) chỉ link sang qua `/coding`.
- Mục tiêu là show off năng lực của một lead engineer qua 4 giai đoạn: mobile → indie game → system → AI. Không phải resume, không có CTA tuyển dụng.
- Ranh giới: tool/niche Việt–Nhật thuộc THN, chỉ đưa vào khi được duyệt.

## Chiến lược nội dung

- **Volume do agent lo**: TIL, link, log, release, benchmark. Mỗi bài tốn vài phút, xuất bản đều.
- **Bài đinh do người lo**: 1–2 explainer tương tác và vài case study/postmortem. Đây là phần tạo danh tiếng.
- **Code thật là đồ mới**: `/tools` và các demo làm trong kỷ nguyên AI. Public được vì không dính NDA.

## Home (theo thứ tự)

1. **Hero**: "ATKD Coding" + 1 câu định vị (placeholder: "Lead engineer. Mobile → indie games → systems → AI.") + dòng live "Now shipping: …" (chỉ hiện codename).
2. **Trajectory**: timeline 4 era. Mỗi era có khoảng năm, stack, 1 câu "đã làm gì", số liệu tổng hợp và 1 dự án tiêu biểu.
3. **Selected work**: 4–6 repo card, có badge tầng bằng chứng.
4. **Signals**: dashboard tự cập nhật hằng ngày.
5. **Stream**: dòng thời gian trộn mọi type. Deep-dive nổi lên đầu, bên dưới là til/link/log dạng gọn.
6. **Tools & playground**: tool mới nhất + demo/game chơi được.
7. **Lab (teaser)**: kết quả benchmark mới nhất + 1–2 thí nghiệm AI.
8. **Footer**: link về atkd1890.me, GitHub, YouTube ATKD Coding (TODO), hi@atkd1890.me, RSS, /uses, /colophon, các năm lưu trữ.

## Blog

### Loại bài (`type`)

| type | Nguồn | Công sức của chủ site |
|---|---|---|
| `til` | Commit, session Claude Code, ý tưởng 1 dòng | 0–1 dòng |
| `link` | Link/repo hay + 1–3 câu nhận xét (GitHub stars, bookmark) | 0, chỉ merge |
| `log` | Build log hằng tuần, map hoạt động sang codename | 0, chỉ merge |
| `release` | Tự sinh từ GitHub Releases của repo public | 0 |
| `note` | Ghi chú/ý kiến ngắn | 1 dòng |
| `deep-dive` | Bài kỹ thuật dài, có thể là explainer tương tác | Duyệt kỹ / tự viết |
| `case-study` | Từ `showcase.yml` + tài liệu dự án, gồm cả postmortem game cũ | Duyệt kỹ |
| `cross` | Chuyển thể video YouTube ATKD Coding (từ transcript) | 0, chỉ merge |

### Series

- `series` là field tùy chọn. Mỗi series có trang riêng `/blog/series/<id>`.
- Series đầu tiên là **`benchmark`**: mỗi model/agent mới phải dựng cùng một prototype game nhỏ theo một đề bài cố định (`lab/benchmark/SPEC.md`). Mỗi lần chạy có bản build chơi được, điểm theo rubric, thời gian/chi phí và nhận xét. Kết quả gom thành bảng xếp hạng ở `/lab`.

### Explainer tương tác

- Bài `deep-dive` được nhúng Web Components từ `src/_includes/interactive/`. JS chỉ load trên trang có dùng.
- Mục tiêu: 1–2 bài đinh về game/system (đề tài chốt sau).

## /tools

- Mỗi tool là một repo public `atkd1890/tool-<name>` gồm 1 file HTML, bật Pages → `/tool-<name>`.
- Danh mục lấy từ GitHub API: repo public có topic `atkd-tool` (description, topics, ngày tạo, link).
- Mỗi tool ghi "built with" (model/agent) + link prompt/transcript nếu có.

## Hạ tầng thêm

- Snapshot theo năm: tag `snapshot-YYYY` → build vào `/YYYY/`, giữ cố định ở các lần deploy sau (lưu dạng artifact hoặc branch `snapshots`).
- Secret `SHOWCASE_TOKEN`: fine-grained PAT chỉ đọc, giới hạn đúng các repo trong `showcase.yml`, quyền tối thiểu.
- giscus (tùy chọn) cho `/blog/*`, `/work/*`.

---

## Phases

### Phase 0 — Audit (KHÔNG push, KHÔNG xoá history)

- [x] Đọc repo hiện tại, giữ lại phần tái chế được, dọn working tree
- [x] Soạn README.md, CLAUDE.md, ROADMAP.md
- [x] Quét git history để tìm dữ liệu nhạy cảm
- [x] Kiểm tra profile GitHub + repo profile README
- [x] Bảng nháp phân loại repo (chỉ nằm local, không commit)
- [x] Liệt kê repo có Pages, Releases, mẫu stars
- [x] Bundle history cũ ra ngoài repo (local), tạo orphan `main` với identity persona + email noreply
- [x] Chốt danh sách showcase (xem "Showcase đã chốt" bên dưới)
- [ ] Force-push `main`, đổi default branch, xoá `master` trên remote
- [ ] *(defer, chủ site làm sau)* Sửa profile GitHub: name, ẩn email, location, bio, twitter, tắt hireable. Không chặn các phase khác, nhưng phải xong trước khi site được quảng bá

#### Showcase đã chốt (codename tạm, dạng kebab-case dễ hiểu)

Codename không được trùng hoặc gần trùng tên repo private.

| codename | era | domain | tầng bằng chứng |
|---|---|---|---|
| `atkd-os` | ai | Lab AI cá nhân, chạy trên Mac và máy GPU | card + case-study (kiến trúc ở /lab) |
| `signal-desk` | ai / system | Bot tín hiệu cho tài chính cá nhân | card + case-study |
| `deal-hunters` | system | Nhóm bot tự động hoá tài chính cá nhân | card (gộp, chỉ số liệu tổng hợp) |
| `atkd-ui` | system | Design system dùng chung cho mọi repo trong tài khoản: thể hiện tư duy designer, không chỉ engineer | card + case-study, có thể nâng lên open-source |
| `shift-board` | system | Sản phẩm freelance cho một khách hàng doanh nghiệp: quản lý chấm công/ca làm. Chỉ mô tả trừu tượng, tên khách hàng phải nằm trong denylist | card |
| `mmo-ui-kit` | indie-game | Bộ UI/script cho client một game MMO (2016–2020) | card |
| `demo-mobile-*` | mobile | **Demo data / lorem ipsum** | card placeholder |
| `demo-game-*` | indie-game | **Demo data / lorem ipsum** | card placeholder |

Demo data phải có cờ `placeholder: true` và hiện nhãn "demo data" trên site cho tới khi được thay bằng dữ liệu thật.

#### Kết quả Phase 0 (đã lược thông tin nhạy cảm)

**Repo hiện tại.** Có 3 file tracked: `index.md`, `_config.yml` (Jekyll minimal theme + Google Analytics UA), `.deepsource.toml`. Toàn bộ đã bị loại khỏi working tree vì:
- `index.md` chứa tên thật, Gmail, tên các công ty cũ/hiện tại, link mạng xã hội cá nhân và vị trí. Tất cả đều vi phạm luật persona.
- `_config.yml` dùng Jekyll và chứa analytics ID (UA, đã ngừng hoạt động).
- `.deepsource.toml` là cấu hình của bot DeepSource, không còn dùng.

**Giữ lại để tái chế** (không có thông tin định danh):
- Danh sách stack cũ, làm gợi ý cho timeline Trajectory: Obj-C/Swift, Android, Unity, React Native, HTML/CSS, React, Node, PHP, Python, MySQL, REST, AWS, GCP. Phần Adobe, Ableton, SEO/SEM, social thuộc persona khác, không dùng.
- Link về hub atkd1890.me.
- Không giữ link mạng xã hội cá nhân, vì chúng nối handle với danh tính thật.

**Git history (13 commit, public).** Có Gmail trong author và nội dung, tên thật trong author, tên công ty trong nội dung, UA analytics ID và địa danh. Đề xuất (chờ duyệt):
1. `git bundle create ~/<nơi-an-toàn>/atkd1890.github.io-legacy.bundle --all` (chỉ để local).
2. Tạo branch orphan `main` với identity persona + email noreply.
3. Đổi default branch sang `main`, chuyển Pages source sang Actions (chủ site tự bấm), rồi force-push / xoá `master` trên remote.
4. Ghi chú: bản cũ có thể còn trong cache, fork hoặc Wayback. Force-push không xoá được những bản đó.

**Profile GitHub.** Name, public email (Gmail), location, bio, twitter và `hireable: true` đang public. Repo `atkd1890/atkd1890` không tồn tại. → Chủ site tự sửa trên github.com/settings/profile (chi tiết trong báo cáo local).

**Hạn chế dữ liệu cho Signals.** Tài khoản chỉ có 12 repo (11 tự tạo, 1 fork). Phần lớn tạo năm 2026, tổng khoảng 140 commit. Contribution calendar gần như trống trong 2012–2025. Hệ quả: era mobile và indie-game **không có dữ liệu trên GitHub**. Signals sẽ chỉ phản ánh giai đoạn AI, trừ khi bổ sung nguồn khác (xem câu hỏi 10).

**Pages / Releases / Stars.** Chỉ repo này đang bật Pages (legacy build từ `master`). Không repo nào có Releases, nên feed `release` sẽ trống cho tới khi có tool/thư viện public. Có khoảng 510 stars. Trong 30 star gần nhất có khoảng 1/3 là repo private của chính mình, nên filter trong leak guard là bắt buộc.

### Phase 1 — Scaffold & deploy

- [x] Init Eleventy v3 (ESM), cấu trúc `src/_data`, `src/_includes`, `src/work`, `src/blog`, `src/lab`, `src/tools`, `src/assets`
- [x] `.gitignore`, `package.json`, `eleventy.config.js`
- [x] Workflow deploy Pages + workflow PR
- [x] Hướng dẫn bật Pages source = GitHub Actions (chủ site tự bấm, xem README)
- [x] LICENSE (CC BY 4.0 cho nội dung + MIT cho code), cập nhật README phần local dev
- [ ] Trang placeholder lên được `atkd1890.github.io`

### Phase 2 — Data pipeline

- [ ] `showcase.yml` với các mục `TODO` + validate schema
- [ ] `github.js`: stats (ngôn ngữ, commit theo năm, heatmap, repo theo era/domain, hoạt động gần nhất → codename), tools (topic `atkd-tool`), releases, stars
- [ ] Không có token → fallback snapshot, không crash
- [ ] Xác minh quyền tối thiểu của `SHOWCASE_TOKEN`
- [ ] Leak guard script + chạy trong CI

### Phase 3 — Home + craft

- [ ] Đủ 8 section theo thứ tự. Mobile-first, kiểm tra ở 375px
- [ ] Command palette ⌘K, phím tắt (`g h`, `g b`, `/`, `?`)
- [ ] Nút âm thanh (mặc định tắt), theme toggle, link "edit on GitHub"

### Phase 4 — Case study `/work/<codename>`

- [ ] Template theo khung case study/postmortem
- [ ] 1 bài nháp mẫu từ dữ liệu chủ site đưa, không bịa số

### Phase 5 — Blog

- [ ] `/blog`, `/blog/<slug>`, lọc type/tag/series, lưu trữ theo năm, `/blog/series/<id>`
- [ ] Layout riêng theo type (til/link gọn, deep-dive đầy đủ)
- [ ] `/feed.xml` + `/feed/<type>.xml`
- [ ] Validate frontmatter, badge "AI-assisted"
- [ ] Sinh `release` tự động từ GitHub Releases
- [ ] Issue template `blog-idea`, labels `blog-idea` / `blog-draft`, PR template (checklist: leak guard, số liệu có nguồn, ảnh sạch EXIF)
- [ ] 1 bài `til` + 1 bài `link` mẫu viết tay, để test luồng PR → merge → publish
- [ ] Hạ tầng explainer tương tác + 1 component demo

### Phase 6 — /tools, /lab, /uses, /colophon

- [ ] `/tools` từ topic `atkd-tool`, kèm 1 repo tool mẫu để test
- [ ] `/lab`: kiến trúc ATKD OS (Mermaid, mức trừu tượng), danh sách thí nghiệm, `lab/benchmark/SPEC.md` (nháp, chờ duyệt), bảng xếp hạng benchmark
- [ ] `/uses`: khung + `TODO`
- [ ] `/colophon`: pipeline thật, sinh một phần từ cấu hình (version 11ty, workflows)

### Phase 7 — SEO / share / search

- [ ] OG image sinh lúc build (home, case study, blog, tool)
- [ ] Pagefind, sitemap, robots, 404, canonical

### Phase 8 — Snapshot theo năm

- [ ] Workflow `snapshot-YYYY` → `/YYYY/`. Test bằng tag thử rồi xoá

### Phase 9 — Kiểm tra

- [ ] Lighthouse ≥ 95, check link ngoài, leak guard pass, đọc tay lại toàn bộ output
- [ ] Test bàn phím (palette, phím tắt), reduced-motion, âm thanh mặc định tắt

---

## Câu hỏi mở

1. Ngôn ngữ site và blog: chỉ EN, hay EN + VI/JA?
2. Câu định vị ở hero.
3. ~~Dự án THN / công ty-khách hàng~~ → THN là org riêng, không nằm trong tài khoản này. Dự án công ty/khách hàng thì chỉ hiện dạng codename, mô tả trừu tượng.
4. Thư viện nào tách ra open source trước?
5. Đề bài game cho series benchmark (thể loại, phạm vi, rubric).
6. Đề tài cho 1–2 explainer tương tác.
7. Có bật giscus không?
8. Handle/link kênh YouTube ATKD Coding.
9. Có dùng chung Action để tự cập nhật profile README `atkd1890/atkd1890` không? (Repo này hiện chưa tồn tại.)
10. ~~Nguồn số liệu era mobile/indie-game~~ → tạm dùng demo data / lorem ipsum, có gắn nhãn.
11. ~~`repo: null`~~ → cho phép, dùng cho dự án không nằm trên GitHub và cho demo data.
12. ~~Display name persona~~ → `ATKD Coding`.
13. *(mới)* `atkd-ui` có chuyển repo sang public để chính site này dùng tokens của nó không? Đây là tầng bằng chứng mạnh nhất. Nếu repo vẫn private thì site không được copy CSS từ đó.

## TODO tồn đọng

- Hero tagline, link YouTube, nội dung `/uses`: chờ chủ site.
