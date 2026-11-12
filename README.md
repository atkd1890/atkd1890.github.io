# atkd1890.github.io

Home của **ATKD Coding**: hành trình của một lead engineer qua bốn giai đoạn mobile → indie game → system → AI. Đây không phải resume, không có nút "hire me".

> **Trạng thái:** production tại https://atkd1890.github.io, deploy từ nhánh `main` qua GitHub Actions. Việc còn mở ở [ROADMAP.md](ROADMAP.md), quyết định đã chốt ở [docs/adr](docs/adr/README.md), rule cho agent ở [CLAUDE.md](CLAUDE.md).

## Mục lục

- [Specs](#specs)
  - [GitHub-native](#github-native)
  - [Nguyên tắc](#nguyên-tắc)
  - [Các tầng bằng chứng](#các-tầng-bằng-chứng)
  - [Các trang](#các-trang)
  - [Stack](#stack)
  - [Hợp đồng nội dung](#hợp-đồng-nội-dung)
  - [Schema `showcase.yml`](#schema-showcaseyml)
  - [Leak guard](#leak-guard)
- [Cấu trúc repo](#cấu-trúc-repo)
- [Chạy và phát triển ở local](#chạy-và-phát-triển-ở-local)
  - [Cài đặt](#cài-đặt)
  - [Các lệnh](#các-lệnh)
  - [Tái hiện production ở local](#tái-hiện-production-ở-local)
  - [Sửa nội dung](#sửa-nội-dung)
  - [Sửa design](#sửa-design)
  - [Kiểm tra trước khi push](#kiểm-tra-trước-khi-push)
  - [Debug ở local](#debug-ở-local)
- [Deploy production và xử lý sự cố](#deploy-production-và-xử-lý-sự-cố)
  - [Luồng deploy](#luồng-deploy)
  - [Cấu hình GitHub](#cấu-hình-github)
  - [Đưa thay đổi lên production](#đưa-thay-đổi-lên-production)
  - [Khi production gặp sự cố](#khi-production-gặp-sự-cố)
- [Tùy chỉnh và bảo trì](#tùy-chỉnh-và-bảo-trì)
  - [Cập nhật denylist](#cập-nhật-denylist)
- [Roadmap](#roadmap)
- [License và liên hệ](#license-và-liên-hệ)

## Specs

### GitHub-native

GitHub đảm nhận mọi vai trò. Repo public nên bản thân repo cũng là một phần của showcase.

| Vai trò       | Thành phần GitHub                                               |
| ------------- | --------------------------------------------------------------- |
| CMS           | Repo này: issue là ý tưởng, PR là bản nháp, merge là xuất bản   |
| Nguồn dữ liệu | GitHub GraphQL API: số liệu tổng hợp, tools, releases, stars    |
| CI            | GitHub Actions: build, validate, leak guard, cập nhật hằng ngày |
| Hosting       | GitHub Pages (source = GitHub Actions)                          |

atkd1890.me (hub tổng, repo khác) chỉ link sang đây. Repo này không đụng tới repo hub.

### Nguyên tắc

Phần lớn công việc nằm trong repo private và không được public. Vì vậy:

1. **Chỉ hiện những gì được khai báo.** Site chỉ hiển thị nội dung có trong `src/_data/showcase.yml`, không tự động liệt kê repo private.
2. **Dùng codename.** Tên repo private không bao giờ xuất hiện trong HTML hay trong repo. Mỗi dự án có một codename dạng kebab-case.
3. **Repo private chỉ đóng góp số liệu.** Chỉ có số liệu tổng hợp, không có code.
4. **Code chỉ ở hai dạng.** Hoặc là đoạn trích viết lại, hoặc nằm trong repo public (thư viện tách ra, tools, demo mới).
5. **Dự án công ty/khách hàng chỉ mô tả trừu tượng.** Nêu domain, quy mô, vai trò; không nêu tên.
6. **Không bịa số.** Chưa có thì để `TODO`, hoặc dùng demo data có nhãn.

### Các tầng bằng chứng

Từ yếu đến mạnh:

| Tầng                    | Hình thức                                                                                               | Lộ gì                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------- |
| Signals                 | Số liệu tổng hợp: ngôn ngữ, contributions theo năm, heatmap, số dự án theo era                          | Chỉ con số             |
| Repo cards              | Codename, era, domain, vai trò, stack, năm, 1 dòng mô tả, trạng thái                                    | Metadata đã duyệt      |
| Case study / postmortem | Bối cảnh → vấn đề → ràng buộc → kiến trúc (Mermaid) → quyết định và trade-off → kết quả có số → bài học | Tư duy, không code     |
| Excerpts                | Đoạn code ngắn viết lại để minh họa pattern                                                             | Kỹ năng, không IP      |
| Demos                   | Video/GIF, bản build chơi được (WebGL), demo tĩnh tại `/<repo>`                                         | Sản phẩm, không source |
| Open source / tools     | Thư viện tách từ dự án private, tool HTML một file làm bằng AI                                          | Code thật              |

### Các trang

```
/                   Home (one-page): Hero → Trajectory → Selected work → Signals → Stream → Tools → Lab → Footer
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

Hiện đang chạy: trang placeholder `/` và `/404`. Các trang khác làm theo phase trong ROADMAP.

### Stack

- [Eleventy](https://www.11ty.dev/) v3 (ESM) + Nunjucks. Không dùng framework UI; chỉ dùng vanilla JS / Web Components khi cần.
- CSS thuần, design tokens trên `:root`, light và dark. Đồng bộ ở mức core với design hub, persona "Coding — Terminal" ([docs/design.md](docs/design.md)).
- Font duy nhất là JetBrains Mono, tự host (latin + vietnamese). Body dài dùng font hệ thống.
- Mermaid render ra SVG lúc build. Pagefind cho tìm kiếm, index lúc build.
- Dữ liệu GitHub qua GraphQL, cache 1 giờ bằng `@11ty/eleventy-fetch`. Không có token thì dùng snapshot.
- Kiểm thử: `node:test` cho unit test, `tsc --checkJs` cho type-check, Prettier (cùng cấu hình với hub) cho format, gitleaks quét secret trong commit.
- Không có file CNAME. Không dùng analytics, tối đa là beacon Cloudflare Web Analytics.

### Hợp đồng nội dung

Site chỉ biết đến hợp đồng này, không biết gì về agent viết bài. Agent nằm ở repo khác (`atkd-stack`).

- Bài viết đặt tại `src/blog/YYYY/YYYY-MM-DD-<slug>.md`, ảnh đặt tại `src/blog/YYYY/<slug>/`.
- Frontmatter được validate lúc build; sai thì build fail:

```yaml
title: ''
slug: ''
date: 2026-11-12
type: til | link | log | release | note | deep-dive | case-study | cross
tags: []
series: null # vd benchmark
lang: en
summary: '' # meta, OG, danh sách bài
url: null # bắt buộc với type link
codenames: [] # liên kết sang /work/<codename>
source: human | agent # bài do agent viết có badge "AI-assisted"
agent_run: null # id lần chạy agent, để truy vết
draft: false
```

Quy trình xuất bản:

1. Ý tưởng = issue có label `blog-idea`.
2. Bản nháp = PR từ branch `post/<slug>`, label `blog-draft`, tham chiếu issue gốc.
3. CI trên PR: validate frontmatter, leak guard, build preview (artifact).
4. Merge là xuất bản, đóng PR là bỏ bài.

Bài `release` được sinh trong CI từ GitHub Releases của các repo public. Site không gọi LLM và không chứa secret của agent.

### Schema `showcase.yml`

Validate lúc build bằng `lib/showcase-schema.js`. Sai thì build fail kèm tên field.

```yaml
- codename: signal-desk # kebab-case, không giống tên repo private
  repo: '@secret' # hoặc null. Không bao giờ là tên thật: mapping nằm trong secret SHOWCASE_REPOS
  public_repo: null # owner/name nếu repo public
  era: mobile | indie-game | system | ai
  domain: Signal bot for personal finance
  role: TODO
  stack: [Python]
  years: '2026–'
  status: shipped | live | archived | wip
  summary: 'TODO'
  metrics: [] # [{label, value}], chỉ số liệu đã duyệt
  evidence: [card] # card | case-study | demo | open-source
  media: []
  demo_url: null # https
  featured: true
  placeholder: false # true = demo data, hiện nhãn "demo data", bắt buộc repo: null
  order: 2
```

### Leak guard

Bắt buộc. Vi phạm thì build hoặc PR fail. Lý do ở [ADR 0003](docs/adr/0003-leak-guard.md).

- Quét `_site/` và mọi file `.md` thay đổi trong PR, tìm:
  - tên repo private, khớp nguyên từ (lấy từ `SHOWCASE_REPOS` và từ API, không lưu trong repo);
  - các mục trong denylist, không phân biệt hoa thường và dấu (secret `LEAK_DENYLIST`);
  - EXIF trong ảnh JPEG, PNG, WebP;
  - chuỗi canary cài sẵn (self-test chạy mỗi lần CI).
- Log chỉ in `file:dòng` và số thứ tự luật, không in giá trị bị khớp, vì log CI là public.
- `lib/github-data.js` chỉ xuất các field nằm trong whitelist, mọi số liệu gắn theo codename.
- Feed `link` lấy từ stars loại bỏ repo private và các owner trong secret `STARS_EXCLUDE_OWNERS`.

## Cấu trúc repo

```
src/_data/          site.js, showcase.yml (+ showcase.js validate), github.js, snapshot/github.json
src/_includes/      layouts/, interactive/ (Web Components cho explainer)
src/assets/         css/, fonts (copy lúc build từ @fontsource)
src/blog/ work/ lab/ tools/
lib/                Logic thuần, có test: showcase-schema, github-api, github-data, github-load, leak-guard
scripts/            leak-guard.js (CLI), push-secrets.sh
tests/              Unit test (node:test)
types/              Khai báo type cho package không có type
config/examples/    Template dữ liệu giả cho các file riêng tư
docs/               content.md, design.md, adr/
.github/workflows/  deploy.yml, pr.yml
eleventy.config.js  mise.toml  .nvmrc  tsconfig.json
```

Ngoài repo, ngay cạnh nó:

```
~/git/atkd1890/
├── .config/atkd1890.github.io/   File riêng tư: leak-denylist.txt, showcase-repos.json (quyền 600)
├── _archive/                     Bundle git history cũ, không commit vào đâu
└── atkd1890.github.io/           Repo này
```

## Chạy và phát triển ở local

### Cài đặt

Runtime quản lý bằng [mise](https://mise.jdx.dev), phiên bản Node ghim trong `mise.toml`. `.nvmrc` giữ cùng phiên bản cho GitHub Actions, có test kiểm tra hai file khớp nhau. Đổi Node thì sửa cả hai. Nếu shell chưa kích hoạt mise, thêm `mise exec --` trước các lệnh `npm`.

```sh
mise install
npm ci
```

Muốn chạy với dữ liệu thật thì cần thêm `gh` đã đăng nhập (`gh auth login`) và thư mục `../.config/atkd1890.github.io/`. Xem [Tái hiện production ở local](#tái-hiện-production-ở-local).

### Các lệnh

| Lệnh                       | Dùng khi                                                                         |
| -------------------------- | -------------------------------------------------------------------------------- |
| `npm start`                | Sửa code và xem ngay tại http://localhost:8080, dữ liệu từ snapshot              |
| `npm run start:live`       | Như trên nhưng với dữ liệu GitHub thật                                           |
| `npm run build`            | Build ra `_site/` bằng snapshot                                                  |
| `npm run build:live`       | Build với dữ liệu thật, giống production                                         |
| `npm run check`            | Format check, type-check, unit test và leak guard self-test, như bước đầu của CI |
| `npm run format`           | Format code và docs bằng Prettier                                                |
| `npm run leak-guard:local` | Quét `_site/` bằng denylist và mapping thật, như bước cuối của CI                |
| `npm test`                 | Chỉ chạy unit test                                                               |
| `npm run typecheck`        | Chỉ chạy `tsc --checkJs`                                                         |
| `npm run secrets:push`     | Đẩy file trong `../.config/atkd1890.github.io/` lên GitHub secret (ghi đè)       |
| `npm run clean`            | Xoá `_site/` và `.cache/`                                                        |

### Tái hiện production ở local

Production build trên GitHub Actions với 3 secret. Ở local, `gh auth token` thay cho `GITHUB_TOKEN` và `SHOWCASE_TOKEN`, còn file trong `../.config/atkd1890.github.io/` thay cho `SHOWCASE_REPOS` và `LEAK_DENYLIST`.

1. Lần đầu trên máy mới, tạo thư mục riêng tư từ template, rồi điền giá trị thật:
   ```sh
   mkdir -p ../.config/atkd1890.github.io && chmod 700 ../.config ../.config/atkd1890.github.io
   cp -n config/examples/leak-denylist.example.txt ../.config/atkd1890.github.io/leak-denylist.txt
   cp -n config/examples/showcase-repos.example.json ../.config/atkd1890.github.io/showcase-repos.json
   ```
2. Chạy đúng các bước như workflow `Deploy`:
   ```sh
   npm ci && npm run check && npm run clean && npm run build:live && npm run leak-guard:local
   ```
3. Xem kết quả: `npm run start:live`, mở http://localhost:8080. Footer ghi `Data live, N contributions` là đang dùng dữ liệu thật; `Data snapshot (demo)` là không lấy được dữ liệu.

Xem bản preview của một PR mà không cần build: tải artifact rồi mở bằng server tĩnh bất kỳ.

```sh
gh run download <run-id> -n preview-<số-PR> -D /tmp/preview
npx -y serve /tmp/preview
```

Khác biệt còn lại so với production: token của `gh` có nhiều quyền hơn `SHOWCASE_TOKEN` (chỉ Metadata), nên một lỗi thiếu quyền chỉ lộ ra trên CI.

### Sửa nội dung

| Muốn đổi                                | Sửa ở                                                       |
| --------------------------------------- | ----------------------------------------------------------- |
| Dự án trong showcase                    | `src/_data/showcase.yml` (và mapping nếu `repo: "@secret"`) |
| Câu định vị, email, link                | `src/_data/site.js`                                         |
| Timeline 4 era (năm, 1 câu "đã làm gì") | [`src/_data/eras.js`](src/_data/eras.js)                    | Khi chốt số năm và nội dung từng era | Thay các giá trị `TODO`, mở PR |
| Nội dung trang placeholder              | `src/index.njk`                                             |
| Snapshot dùng khi không có token        | `src/_data/snapshot/github.json`, chỉ chứa số liệu tổng hợp |

Chưa có dữ liệu thì để `TODO`, không điền đoán. Có thể sửa thẳng trên github.com hoặc github.dev (bấm `.` trong repo) rồi mở PR.

### Sửa design

Spec ở [docs/design.md](docs/design.md). Hình ở artifact [ATKD Coding Design](https://claude.ai/artifact/RXYDQoYg6Z91vRdaQEk6rR) (private, cần đúng tài khoản). Phần core đồng bộ với design hub.

| Muốn đổi                    | Sửa ở                                                         |
| --------------------------- | ------------------------------------------------------------- |
| Token màu, font, kích thước | `src/assets/css/main.css` (`:root`) và docs/design.md mục 2–4 |
| Khung trang, footer         | `src/_includes/layouts/base.njk`                              |
| Font tự host                | `eleventy.config.js` (passthrough) và `@font-face` trong CSS  |

Quy tắc giữ nguyên khi sửa: chỉ dùng token, góc vuông, vùng bấm tối thiểu 44px, tiếng Nhật dùng font hệ thống, đạt WCAG AA ở cả light và dark.

### Kiểm tra trước khi push

```sh
npm run check
npm run build:live && npm run leak-guard:local
```

Kiểm tra bằng mắt ở 375px và 1280px, cả light và dark.

### Debug ở local

| Hiện tượng                                      | Nguyên nhân thường gặp                                    | Cách xử lý                                                              |
| ----------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| `node` sai phiên bản                            | Shell chưa kích hoạt mise                                 | `mise install`, hoặc chạy `mise exec -- npm …`                          |
| Build fail, báo `showcase.yml is invalid`       | Sai schema, codename trùng, `repo` là tên thật            | Sửa theo dòng báo lỗi                                                   |
| Footer ghi `Data snapshot (demo)`               | Không có token, hoặc gọi API lỗi                          | Xem dòng `[github] …` trong output; kiểm tra `gh auth status`           |
| Log `[github] no mapping for codename …`        | Codename có `repo: "@secret"` nhưng chưa có trong mapping | Thêm vào `showcase-repos.json`                                          |
| Dữ liệu không đổi sau khi sửa                   | Cache 1 giờ trong `.cache/`                               | `npm run clean`                                                         |
| Template không thấy dữ liệu từ `src/_data/*.js` | File data có named export, Eleventy lấy cả module         | Chỉ để `export default`; test `data-files` sẽ báo                       |
| `leak-guard: no denylist configured`            | Thiếu file denylist                                       | Tạo từ template, xem bước 1 ở trên                                      |
| Leak guard báo `denylist entry #N`              | Nội dung chứa chuỗi cấm                                   | Sửa nội dung. N đếm từ 0, chỉ tính dòng có hiệu lực trong file denylist |

## Deploy production và xử lý sự cố

### Luồng deploy

| Sự kiện                             | Workflow      | Kết quả                                                                          |
| ----------------------------------- | ------------- | -------------------------------------------------------------------------------- |
| Push lên `main`                     | `Deploy`      | Check, build với dữ liệu thật, leak guard, deploy lên https://atkd1890.github.io |
| Hằng ngày 06:17 JST                 | `Deploy`      | Như trên, để cập nhật số liệu                                                    |
| Chạy tay (`gh workflow run Deploy`) | `Deploy`      | Như trên                                                                         |
| PR vào `main`                       | `PR check`    | Check, build bằng dữ liệu public, leak guard, bản preview làm artifact 7 ngày    |
| Push lên `main` hoặc PR             | `Secret scan` | gitleaks quét secret trong toàn bộ history                                       |

Leak guard fail thì không deploy, site giữ bản cũ. Workflow PR không bao giờ nhận `SHOWCASE_TOKEN`. Action pin theo commit SHA, Dependabot cập nhật npm và action hằng tuần.

### Cấu hình GitHub

| Ở đâu                                      | Cấu hình                                                                                                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settings → Pages                           | Source: **GitHub Actions**. Không dùng custom domain                                                                                                                  |
| Settings → Branches → `main`               | Bắt buộc qua PR, check `check` và `gitleaks` phải xanh, nhánh phải mới nhất, lịch sử thẳng (squash/rebase), cấm force-push và xoá. Admin vẫn bypass được khi khẩn cấp |
| Settings → Code security                   | Secret scanning và push protection bật                                                                                                                                |
| Settings → Secrets and variables → Actions | `LEAK_DENYLIST` (bắt buộc), `SHOWCASE_REPOS`, `SHOWCASE_TOKEN`, `STARS_EXCLUDE_OWNERS` (tùy chọn)                                                                     |
| Profile → Contribution settings            | Bật **Private contributions**, để heatmap và số liệu theo năm có cả việc trong repo private                                                                           |

`GITHUB_TOKEN` do Actions tự cấp, dùng cho dữ liệu public: heatmap, contributions theo năm, tools, releases, stars.

**`SHOWCASE_TOKEN`** là fine-grained PAT, quyền tối thiểu theo [ADR 0004](docs/adr/0004-metadata-only-token.md):

- Resource owner `atkd1890`, có hạn dùng (đặt lịch nhắc gia hạn).
- Repository access: **All repositories**. Không phải sửa token khi tạo repo mới, và leak guard tự biết tên mọi repo private.
- Repository permissions: **chỉ Metadata: Read-only**, không cấp Contents nên token không đọc được code. Account permissions: không cấp gì.

**`SHOWCASE_REPOS`** là JSON `{"codename": "owner/repo"}`, hoặc danh sách `["owner/a", "owner/b"]` khi một codename gồm nhiều repo. Lý do không để trong repo: [ADR 0002](docs/adr/0002-private-repo-mapping-in-secrets.md).

### Đưa thay đổi lên production

1. Làm trên nhánh riêng, chạy [Kiểm tra trước khi push](#kiểm-tra-trước-khi-push), mở PR.
2. Xem `PR check` xanh, tải bản preview nếu cần.
3. Merge vào `main`, xem workflow `Deploy` xanh rồi mở site kiểm tra.

### Khi production gặp sự cố

**Khôi phục trước, tìm nguyên nhân sau.** Chạy lại workflow `Deploy` của commit tốt gần nhất (Actions → run đó → Re-run all jobs). Sau đó revert commit lỗi trên `main`, nếu không lần cron sau sẽ đưa lỗi trở lại.

```sh
gh run list --workflow Deploy --limit 5
gh run rerun <run-id-của-bản-tốt>
```

| Hiện tượng                      | Nguyên nhân thường gặp                                             | Cách xử lý                                                                                  |
| ------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Deploy fail ở bước `Leak guard` | Nội dung chứa chuỗi cấm, hoặc thiếu `LEAK_DENYLIST`                | Đọc `file:dòng` trong log, sửa nội dung; thiếu secret thì đặt lại                           |
| Deploy fail ở `npm run check`   | Sai format, test hoặc type-check lỗi                               | Chạy `npm run check` ở local                                                                |
| Toàn site 404                   | Pages source không phải GitHub Actions                             | Settings → Pages → Source: GitHub Actions, rồi chạy lại `Deploy`                            |
| Footer ghi `Data snapshot`      | `SHOWCASE_TOKEN` hết hạn hoặc thiếu quyền                          | Xem dòng `[github]` trong log build, tạo token mới                                          |
| Số liệu cũ                      | Cron không chạy (repo không hoạt động 60 ngày thì GitHub tắt cron) | Bật lại workflow ở tab Actions, chạy tay một lần                                            |
| Lộ thông tin cá nhân            | Nội dung lọt qua leak guard                                        | Revert, chạy lại `Deploy`, thêm chuỗi đó vào denylist, gỡ khỏi Google bằng công cụ Removals |

## Tùy chỉnh và bảo trì

Mọi thứ chủ site phải tự điền hoặc cập nhật đều có trong bảng này. Dữ liệu riêng tư **không bao giờ nằm trong repo**: file thật để ở `../.config/atkd1890.github.io/`, tức `~/git/atkd1890/.config/atkd1890.github.io/` ngay cạnh repo (quyền 600). Template dữ liệu giả để ở [`config/examples/`](config/examples/).

| Mục                         | Nằm ở đâu                                                         | Khi nào cần sửa                                         | Cách làm                                                                                   |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Denylist chống lộ thông tin | Secret `LEAK_DENYLIST` ← `leak-denylist.txt`                      | Đổi việc, có khách hàng mới, đổi SĐT hay địa chỉ        | [Cập nhật denylist](#cập-nhật-denylist)                                                    |
| Mapping codename → repo     | Secret `SHOWCASE_REPOS` ← `showcase-repos.json`                   | Thêm hoặc bớt dự án trong showcase                      | Sửa file rồi `npm run secrets:push`                                                        |
| Danh sách dự án             | [`src/_data/showcase.yml`](src/_data/showcase.yml)                | Thêm dự án, đổi trạng thái, thêm số liệu hay bằng chứng | Sửa file, mở PR                                                                            |
| Token đọc metadata          | Secret `SHOWCASE_TOKEN` (không có file)                           | **Trước khi hết hạn** (xem ngày trên trang token)       | Tạo token mới theo [Cấu hình GitHub](#cấu-hình-github), rồi `gh secret set SHOWCASE_TOKEN` |
| Loại owner khỏi feed stars  | Secret `STARS_EXCLUDE_OWNERS` ← `stars-exclude-owners.txt`        | Khi vào org của công ty hoặc khách hàng                 | Sửa file rồi `npm run secrets:push`                                                        |
| Câu định vị, email, link    | [`src/_data/site.js`](src/_data/site.js)                          | Chốt tagline, có kênh YouTube                           | Sửa file, mở PR                                                                            |
| Design                      | [`docs/design.md`](docs/design.md) + `main.css` + canvas thiết kế | Khi đổi design hub hoặc persona                         | Sửa cả ba cho khớp nhau                                                                    |
| Phiên bản Node              | `mise.toml` + `.nvmrc`                                            | Khi nâng Node                                           | Sửa cả hai, `mise install`, `npm run check`                                                |
| Profile GitHub              | github.com/settings/profile                                       | Trước khi giới thiệu site                               | Đổi name, ẩn email, tắt hireable                                                           |

Các mục sẽ thêm vào bảng ở các phase sau: bài blog (Phase 5), `/uses` và đề bài benchmark (Phase 6).

### Cập nhật denylist

1. Lần đầu trên máy mới, tạo file từ template (xem bước 1 của [Tái hiện production ở local](#tái-hiện-production-ở-local)).
2. Sửa `../.config/atkd1890.github.io/leak-denylist.txt`:
   - Mỗi dòng một chuỗi. Dòng bắt đầu bằng `#` là ghi chú, dòng ngắn hơn 3 ký tự bị bỏ qua.
   - Khớp theo chuỗi con, không phân biệt hoa thường hay dấu.
   - **Không** bỏ qua khoảng trắng hay gạch nối, nên mỗi định dạng SĐT phải ghi một dòng riêng.
   - Tránh từ quá chung chung, vì sẽ chặn nhầm và làm deploy fail.
   - Không ghi những thứ site được phép hiện: `atkd1890`, `hi@atkd1890.me`, các codename.
3. Kiểm tra ở local:
   ```sh
   npm run build:live && npm run leak-guard:local
   ```
4. Đẩy lên GitHub. Lệnh này **ghi đè** toàn bộ secret, nên file phải chứa đủ mọi mục:
   ```sh
   npm run secrets:push
   ```
5. Chạy lại deploy để áp dụng ngay (nếu không thì chờ cron hằng ngày):
   ```sh
   gh workflow run Deploy
   ```

## Roadmap

Việc cần làm, phần hoãn lại và câu hỏi còn mở: [ROADMAP.md](ROADMAP.md). Thay đổi người xem thấy được: [CHANGELOG.md](CHANGELOG.md).

## License và liên hệ

- Nội dung (bài viết, case study, hình ảnh): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), xem [LICENSE-CONTENT](LICENSE-CONTENT).
- Code: MIT, xem [LICENSE](LICENSE).
- Liên hệ: hi@atkd1890.me · [atkd1890.me](https://atkd1890.me)
