# atkd1890.github.io — ATKD Coding

Home của **ATKD Coding**: hành trình của một lead engineer qua bốn giai đoạn mobile → indie game → system → AI.

Đây không phải resume và không có nút "hire me". Đây là nơi trưng bày, dựng theo kiểu **GitHub-native**: GitHub đảm nhận mọi vai trò.

| Vai trò | Thành phần GitHub |
|---|---|
| CMS | Repo này: issue là ý tưởng, PR là bản nháp, merge là xuất bản |
| Nguồn dữ liệu | GitHub GraphQL API: số liệu tổng hợp, tools, releases, stars |
| CI | GitHub Actions: build, validate, leak guard, cập nhật hằng ngày |
| Hosting | GitHub Pages (source = GitHub Actions) |

Repo này public, nên bản thân nó cũng là một phần của showcase.

> Trạng thái: đang làm lại từ đầu. Các phase nằm ở [ROADMAP.md](ROADMAP.md).

## Nguyên tắc

Phần lớn công việc nằm trong repo private và không được public. Vì vậy:

1. **Chỉ hiện những gì được khai báo.** Site chỉ hiển thị nội dung có trong `src/_data/showcase.yml`, không tự động liệt kê repo private.
2. **Dùng codename.** Tên repo private không bao giờ xuất hiện trong HTML. Mỗi dự án có một codename.
3. **Repo private chỉ đóng góp số liệu.** Chỉ có số liệu tổng hợp, không có code.
4. **Code chỉ ở hai dạng.** Hoặc là đoạn trích viết lại, hoặc nằm trong repo public (thư viện tách ra, tools, demo mới).
5. **Dự án công ty/khách hàng chỉ mô tả trừu tượng.** Nêu domain, quy mô, vai trò; không nêu tên.

## Các tầng bằng chứng (từ yếu đến mạnh)

| Tầng | Hình thức | Lộ gì |
|---|---|---|
| Signals | Số liệu tổng hợp: ngôn ngữ, commit theo năm, heatmap, số repo theo domain/era | Chỉ con số |
| Repo cards | Codename, era, domain, vai trò, stack, năm, 1 dòng mô tả, trạng thái | Metadata đã duyệt |
| Case study / postmortem | Bối cảnh → vấn đề → ràng buộc → kiến trúc (Mermaid) → quyết định và trade-off → kết quả có số → bài học | Tư duy, không code |
| Excerpts | Đoạn code ngắn viết lại để minh họa pattern | Kỹ năng, không IP |
| Demos | Video/GIF, bản build chơi được (WebGL), demo tĩnh tại `/<repo>` | Sản phẩm, không source |
| Open source / tools | Thư viện tách từ dự án private, tool HTML một file làm bằng AI | Code thật |

## Cấu trúc site

```
/                   Home (one-page)
/work/<codename>    Case study / postmortem
/blog               Mọi bài; lọc theo type / tag / series; lưu trữ theo năm
/blog/<slug>        Bài viết
/blog/series/<id>   Trang series (vd benchmark)
/tools              Danh mục tool HTML một file (mỗi tool là một repo public → /<repo>)
/lab                AI & ATKD OS: kiến trúc, thí nghiệm, bảng xếp hạng benchmark
/uses               Phần cứng, tool, AI stack, agent
/colophon           Site này được build thế nào
/<repo>             Project page của repo public (GitHub tự serve)
/<YYYY>/            Snapshot theo năm, đóng băng từ tag snapshot-YYYY
/feed.xml           Atom feed mọi bài; /feed/<type>.xml cho từng loại
/404
```

## Stack

- [Eleventy](https://www.11ty.dev/) v3 (ESM) + Nunjucks. Không dùng framework UI; chỉ dùng vanilla JS / Web Components khi cần.
- CSS thuần, design tokens trên `:root`. Dark mode theo hệ thống, có nút đổi tay.
- Mermaid render ra SVG lúc build.
- Pagefind cho tìm kiếm, index lúc build.
- `src/_data/github.js` gọi GitHub GraphQL, cache bằng `@11ty/eleventy-fetch`. Không có token thì fallback sang snapshot.
- GitHub Actions:
  - deploy khi push lên `main`, cron hằng ngày và `workflow_dispatch`;
  - workflow riêng cho PR: validate, leak guard, preview artifact.
- Không có file CNAME. Không dùng analytics, tối đa là beacon Cloudflare Web Analytics.

## Hợp đồng nội dung

Site chỉ biết đến hợp đồng này, không biết gì về agent viết bài. Agent nằm ở một repo khác.

- Bài viết đặt tại `src/blog/YYYY/YYYY-MM-DD-<slug>.md`, ảnh đặt tại `src/blog/YYYY/<slug>/`.
- Frontmatter được validate lúc build; sai thì build fail:

```yaml
title: ""
slug: ""
date: 2026-11-12
type: til | link | log | release | note | deep-dive | case-study | cross
tags: []
series: null           # vd benchmark
lang: en
summary: ""            # meta, OG, danh sách bài
url: null              # bắt buộc với type link
codenames: []          # liên kết sang /work/<codename>
source: human | agent  # bài do agent viết có badge "AI-assisted"
agent_run: null        # id lần chạy agent, để truy vết
draft: false
```

Quy trình xuất bản:

1. Ý tưởng = issue có label `blog-idea`.
2. Bản nháp = PR từ branch `post/<slug>`, label `blog-draft`, tham chiếu issue gốc.
3. CI trên PR: validate frontmatter, leak guard, build preview (artifact).
4. Merge là xuất bản, đóng PR là bỏ bài.

Bài `release` được sinh trong CI từ GitHub Releases của các repo public. Site không gọi LLM và không chứa secret của agent.

## Leak guard

Bắt buộc. Vi phạm thì build hoặc PR fail.

- Quét `_site/` và mọi file `.md` thay đổi trong PR, tìm:
  - tên repo private (lấy từ API lúc build, không lưu trong repo);
  - các mục trong denylist (lưu trong secret, không commit dạng plaintext).
- Kiểm tra EXIF của toàn bộ ảnh.
- `github.js` chỉ xuất các field nằm trong whitelist.
- Feed `link` lấy từ stars loại bỏ repo private và repo của các tổ chức liên quan đến công việc (danh sách lưu trong secret).

## Chạy local

Yêu cầu Node 22 (xem `.nvmrc`).

```bash
npm ci
npm start        # dev server tại http://localhost:8080
npm run build    # build ra _site/
```

`SHOWCASE_TOKEN` là tùy chọn khi chạy local. Không có token thì build dùng snapshot.

### Cấu trúc

```
eleventy.config.js
lib/                showcase-schema.js, github-api.js, github-data.js, leak-guard.js (logic thuần, có test)
scripts/            leak-guard.js (CLI), push-secrets.sh
config/examples/    template dữ liệu giả cho các file riêng tư
tests/              node --test
docs/               design/DESIGN.md, adr/
src/
  _data/            site.js, showcase.yml (+ showcase.js validate), github.js, snapshot/
  _includes/        layouts/, interactive/ (Web Components cho explainer)
  assets/           css/, js/, img/
  blog/ work/ lab/ tools/
.github/workflows/  deploy.yml (push main + cron + manual), pr.yml (build + preview artifact)
```

### Bật GitHub Pages (làm một lần)

Settings → Pages → Build and deployment → Source: **GitHub Actions**. Workflow `Deploy` sẽ lo phần còn lại.

### Secrets (Settings → Secrets and variables → Actions)

| Secret | Bắt buộc | Nội dung |
|---|---|---|
| `LEAK_DENYLIST` | **Có** (deploy fail nếu thiếu) | Mỗi dòng một chuỗi cấm: tên thật, công ty/khách hàng, email cá nhân, SĐT, địa chỉ, path máy local, tên service nội bộ. Khớp không phân biệt hoa thường và dấu |
| `SHOWCASE_REPOS` | Nên có | JSON `{"codename": "owner/repo"}`, hoặc một danh sách `["owner/a", "owner/b"]` khi một codename gồm nhiều repo, cho các mục `repo: "@secret"`. Xem [ADR 0002](docs/adr/0002-private-repo-mapping-in-secrets.md) |
| `SHOWCASE_TOKEN` | Nên có | Fine-grained PAT, tất cả repo, chỉ Metadata read-only (xem bên dưới) |
| `STARS_EXCLUDE_OWNERS` | Tùy chọn | Danh sách owner/org cách nhau bằng dấu phẩy, sẽ bị loại khỏi feed stars |

`GITHUB_TOKEN` do Actions tự cấp, dùng cho dữ liệu public: heatmap, contributions theo năm (cả private, vì profile đã bật "Include private contributions"), tools, releases, stars.

**Tạo `SHOWCASE_TOKEN` với quyền tối thiểu** (github.com → Settings → Developer settings → Fine-grained tokens), xem [ADR 0004](docs/adr/0004-metadata-only-token.md):

- Resource owner: `atkd1890`. Đặt hạn dùng và lịch nhắc gia hạn.
- Repository access: **All repositories**. Không phải sửa token mỗi khi tạo repo mới, và leak guard tự biết tên mọi repo private.
- Repository permissions: **chỉ Metadata: Read-only**. **Không cấp Contents**, nên token không đọc được code. Account permissions: không cấp gì.
- Token chỉ được truyền vào job deploy trên `main`, không bao giờ vào workflow PR.

Không có token thì build dùng `src/_data/snapshot/github.json` và không bao giờ crash.

**Chạy local với dữ liệu thật** (đọc file ở `../.config/atkd-coding/` cạnh repo và dùng token của `gh`):

```bash
npm run build:live
```

```bash
npm run leak-guard:local
```

### Kiểm tra

```bash
npm run check    # typecheck (tsc --checkJs) + unit test (node --test) + leak guard self-test
```

## Tùy chỉnh và bảo trì (checklist cho chủ site)

Mọi thứ chủ site phải tự điền hoặc cập nhật đều có trong bảng này. Dữ liệu riêng tư **không bao giờ nằm trong repo**: file thật để ở `../.config/atkd-coding/`, tức `~/git/atkd1890/.config/atkd-coding/` ngay cạnh thư mục repo (quyền 600). Template dữ liệu giả để ở [`config/examples/`](config/examples/).

| Mục | Nằm ở đâu | Khi nào cần sửa | Cách làm |
|---|---|---|---|
| Denylist chống lộ thông tin | Secret `LEAK_DENYLIST` ← `../.config/atkd-coding/leak-denylist.txt` | Đổi việc, có khách hàng mới, đổi SĐT hay địa chỉ, gặp chuỗi mới cần giấu | [Cập nhật denylist](#cập-nhật-denylist) |
| Mapping codename → repo | Secret `SHOWCASE_REPOS` ← `../.config/atkd-coding/showcase-repos.json` | Thêm hoặc bớt dự án trong showcase | Sửa file rồi `npm run secrets:push` |
| Danh sách dự án | [`src/_data/showcase.yml`](src/_data/showcase.yml) | Thêm dự án, đổi trạng thái, thêm số liệu hay bằng chứng | Sửa file, mở PR. `repo` chỉ được là `"@secret"` hoặc `null` |
| Token đọc metadata | Secret `SHOWCASE_TOKEN` (không có file) | **Trước khi hết hạn** (xem ngày trên trang token) | Tạo token mới như mục Secrets, rồi `gh secret set SHOWCASE_TOKEN` |
| Loại owner khỏi feed stars | Secret `STARS_EXCLUDE_OWNERS` ← `../.config/atkd-coding/stars-exclude-owners.txt` | Khi vào org của công ty hoặc khách hàng | Sửa file rồi `npm run secrets:push` |
| Câu định vị, email, link | [`src/_data/site.js`](src/_data/site.js) | Chốt tagline, có kênh YouTube | Sửa file, mở PR |
| Design (màu, font, component) | [`docs/design/DESIGN.md`](docs/design/DESIGN.md) + `src/assets/css/main.css` + canvas thiết kế | Khi đổi design hub hoặc persona | Sửa cả ba cho khớp nhau |
| Profile GitHub | github.com/settings/profile | Trước khi giới thiệu site | Đổi name, ẩn email, tắt hireable (ROADMAP Phase 0) |

Các mục sẽ thêm vào bảng ở các phase sau: bài blog (Phase 5), `/uses` và đề bài benchmark (Phase 6).

### Cập nhật denylist

1. Lần đầu trên máy mới, tạo file từ template:
   ```bash
   mkdir -p ../.config/atkd-coding && chmod 700 ../.config ../.config/atkd-coding
   ```
   ```bash
   cp -n config/examples/leak-denylist.example.txt ../.config/atkd-coding/leak-denylist.txt
   ```
2. Sửa `../.config/atkd-coding/leak-denylist.txt`:
   - Mỗi dòng một chuỗi. Dòng bắt đầu bằng `#` là ghi chú.
   - Khớp theo chuỗi con, không phân biệt hoa thường hay dấu.
   - **Không** bỏ qua khoảng trắng hay gạch nối, nên mỗi định dạng SĐT phải ghi một dòng riêng.
   - Tránh từ quá chung chung, vì sẽ chặn nhầm và làm deploy fail.
   - Không ghi những thứ site được phép hiện: `atkd1890`, `hi@atkd1890.me`, các codename.
3. Kiểm tra trên máy trước:
   ```bash
   npm run build:live && npm run leak-guard:local
   ```
4. Đẩy lên GitHub. Lệnh này **ghi đè** toàn bộ secret, nên file phải chứa đủ mọi mục:
   ```bash
   npm run secrets:push
   ```
5. Chạy lại deploy để áp dụng ngay (nếu không thì chờ cron hằng ngày):
   ```bash
   gh workflow run Deploy
   ```

Khi deploy fail vì leak guard, log chỉ in `file:dòng` và số thứ tự mục (ví dụ `denylist entry #7`), không in giá trị. Số thứ tự đếm từ 0, chỉ tính các dòng có hiệu lực (bỏ ghi chú và dòng ngắn). Hãy sửa nội dung bị bắt. Chỉ xoá mục khỏi denylist khi chắc chắn đó là bắt nhầm.

## License

- Nội dung (bài viết, case study, hình ảnh): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), xem [LICENSE-CONTENT](LICENSE-CONTENT)
- Code: MIT, xem [LICENSE](LICENSE)

## Liên hệ

hi@atkd1890.me · [atkd1890.me](https://atkd1890.me)
