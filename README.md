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

Sẽ bổ sung ở Phase 1 (scaffold).

## License

- Nội dung (bài viết, case study, hình ảnh): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Code: MIT

File LICENSE sẽ được thêm ở Phase 1.

## Liên hệ

hi@atkd1890.me · [atkd1890.me](https://atkd1890.me)
