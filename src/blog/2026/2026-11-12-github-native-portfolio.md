---
title: 'Dựng portfolio trên GitHub khi phần lớn công việc là private'
slug: github-native-portfolio
date: 2026-11-12
type: deep-dive
tags: [github, eleventy, privacy, ci, design]
series: null
lang: vi
summary: 'Phần lớn những gì mình làm nằm trong repo private và dưới NDA. Đây là cách mình dựng một portfolio trên GitHub vẫn cho thấy đủ bốn giai đoạn của nghề, mà không để lộ thứ gì không được lộ.'
url: null
codenames: []
source: agent
agent_run: claude-code/2026-11-12
draft: false
interactive: [leak-guard-demo]
---

Nghề của mình đi qua bốn giai đoạn: mobile, indie game, hệ thống, và bây giờ là AI. Nhưng nếu bạn mở tài khoản GitHub của mình ra, bạn sẽ thấy gần như không có gì. Phần lớn công việc nằm trong repo private, repo của công ty, hoặc dưới hợp đồng không cho công khai.

Một portfolio kiểu thông thường là danh sách repo public và vài dòng mô tả. Với mình, cách đó không dùng được. Câu hỏi đặt ra từ đầu là: **làm sao cho người xem thấy đủ năng lực, khi phần lớn bằng chứng không được phép đưa ra?**

Site này, [atkd1890.github.io](https://atkd1890.github.io), là câu trả lời. Bài này kể nó được thiết kế thế nào.

## Tóm tắt

- **GitHub làm mọi vai trò**: repo là CMS, API là nguồn dữ liệu, Actions là CI, Pages là hosting. Không có server, không có database.
- **Riêng tư ngay từ thiết kế**: site chỉ hiện những gì được khai báo; dự án private xuất hiện dưới codename; tên repo thật nằm trong secret; mọi bản build đi qua một "leak guard" trước khi lên mạng.
- **Bằng chứng theo tầng**, từ con số tổng hợp tới code thật, thay cho một danh sách repo.
- **Làm như một team**: 3 workflow, 6 quyết định kiến trúc (ADR), 57 unit test, 64 lượt chạy e2e, kiểm tra accessibility và ngân sách hiệu năng chặn trước mỗi lần merge.
- Trang chủ chỉ tải **3.7 KB JavaScript**, có 3 ngôn ngữ, light/dark, và một command palette ⌘K.

{% shot "/blog/2026/github-native-portfolio/home", "Trang chủ atkd1890.github.io trên desktop", 1280, 800 %}

## Bốn nguyên tắc

Trước khi viết dòng code nào, mình chốt bốn nguyên tắc. Mọi quyết định phía sau đều quay về chúng.

1. **Chỉ hiện những gì được khai báo.** Site không tự liệt kê repo. Muốn một dự án xuất hiện, phải thêm nó vào một file khai báo duy nhất là `showcase.yml`.
2. **Dự án private dùng codename.** Tên repo thật không bao giờ xuất hiện trên site, trong repo public này, hay trong log CI.
3. **Repo private chỉ đóng góp con số.** Không có dòng code nào từ repo private đi ra ngoài.
4. **Code thật là đồ mới.** Phần code người xem đọc được là những thứ làm mới, public từ đầu: thư viện tách ra, tool nhỏ, chính repo của site này.

## Bằng chứng theo tầng

Thay vì một danh sách repo, mỗi dự án được trình bày ở một "tầng bằng chứng", từ yếu tới mạnh:

| Tầng                   | Hình thức                                                 | Lộ gì                  |
| ---------------------- | --------------------------------------------------------- | ---------------------- |
| Số liệu                | Ngôn ngữ, lượt đóng góp theo năm, heatmap                 | Chỉ con số             |
| Thẻ dự án              | Codename, giai đoạn, lĩnh vực, vai trò, stack, năm        | Metadata đã duyệt      |
| Case study, postmortem | Bối cảnh, ràng buộc, kiến trúc, quyết định, kết quả có số | Tư duy, không code     |
| Đoạn trích             | Đoạn code ngắn viết lại để minh hoạ một pattern           | Kỹ năng, không IP      |
| Demo                   | Video, bản build chơi được                                | Sản phẩm, không source |
| Mã nguồn mở, tool      | Thư viện tách ra, tool HTML một file                      | Code thật              |

Một dự án freelance cho khách hàng có thể chỉ dừng ở tầng thẻ: lĩnh vực, quy mô, vai trò. Một design system dùng chung cho mọi repo của mình có thể đi tới case study. Mỗi tầng lộ thêm một chút, và mình chọn tầng cho từng dự án.

## GitHub làm mọi vai trò

Toàn bộ site chạy trên những thứ GitHub đã có sẵn. Không có thành phần nào phải tự vận hành.

{% diagram "blog/2026/github-native-portfolio/architecture", "Kiến trúc: issue và PR là CMS, Actions kiểm tra và build, API cấp số liệu, Pages phục vụ site" %}

- **CMS là repo.** Một ý tưởng bài viết là một issue. Một bản nháp là một pull request. Merge là xuất bản. Mọi thay đổi nội dung đều là một diff có thể review.
- **Nguồn dữ liệu là GitHub API.** Mỗi ngày một lần, Actions đọc số liệu qua GraphQL rồi build lại site, nên trang chủ luôn có số mới mà không ai phải bấm gì.
- **CI là Actions.** Mỗi pull request phải qua đủ các cửa: định dạng, kiểu dữ liệu, unit test, e2e, accessibility, ngân sách hiệu năng, quét secret, và leak guard.
- **Hosting là Pages**, deploy bằng Actions thay vì nhánh `gh-pages`.

Generator là [Eleventy](https://www.11ty.dev/), với Nunjucks và CSS thuần. Không có framework UI; JavaScript chỉ có ở nơi cần tương tác, và chỉ tải ở trang dùng tới nó.

## Riêng tư ngay từ thiết kế

Đây là phần quan trọng nhất của cả hệ thống. Dữ liệu từ repo private đi qua nhiều lớp trước khi chạm tới HTML:

{% diagram "blog/2026/github-native-portfolio/privacy", "Đường đi của dữ liệu private: chỉ metadata, gắn theo codename, qua whitelist, qua leak guard rồi mới deploy" %}

### Codename, và tên thật nằm trong secret

File khai báo dự án nằm trong repo public. Nếu nó chứa tên repo thật thì chính nó đã là một chỗ lộ. Vì vậy trường `repo` chỉ được nhận hai giá trị:

```yaml
- codename: signal-desk
  repo: '@secret' # hoặc null. Không bao giờ là tên thật.
  era: ai
  domain: Bot tín hiệu cho tài chính cá nhân
  evidence: [card, case-study]
```

Bảng nối codename với repo thật nằm trong một GitHub secret. Bộ kiểm tra schema từ chối mọi giá trị khác, nên ghi nhầm tên thật vào file là build fail ngay.

### Token chỉ đọc metadata

Để đọc số liệu từ repo private, site cần một token. Token này chỉ có quyền **Metadata: read-only**: nó thấy tên repo, ngôn ngữ, ngày tạo, ngày push gần nhất, nhưng **không đọc được một dòng code nào**. Lượt đóng góp theo năm lấy từ contribution calendar công khai, vốn đã đếm cả việc trong repo private dưới dạng con số.

Đổi lại, site không đếm được commit theo từng dự án. Mình chấp nhận đánh đổi đó: nếu token có bị lộ, cái mất chỉ là danh sách tên, không phải mã nguồn.

### Whitelist, rồi mới tới template

Mọi dữ liệu từ API đi qua một hàm `whitelist()` dựng lại payload chỉ từ những trường được phép, và mọi số liệu được gắn theo codename trước khi template nhìn thấy. Một trường lạ có lọt vào response của API cũng không thể đi tiếp.

### Leak guard

Lớp cuối cùng chạy trên chính output: toàn bộ HTML đã build, file Markdown thay đổi trong pull request, và cả thông tin tác giả của commit. Nó chặn:

- **tên repo private**, khớp theo nguyên từ để một từ thông dụng trong văn xuôi không bị chặn nhầm;
- **danh sách chuỗi cấm** (tên công ty, khách hàng, thông tin liên lạc cá nhân), khớp không phân biệt hoa thường và **không phân biệt dấu**, nên "Nguyễn" và "nguyen" được coi là một;
- **EXIF** trong ảnh, vì ảnh chụp có thể mang theo toạ độ GPS;
- **email tác giả commit** không phải địa chỉ noreply của GitHub.

Danh sách chuỗi cấm nằm trong secret, và khi chặn, leak guard chỉ in ra tên file, số dòng và số thứ tự của luật, **không bao giờ in giá trị bị khớp**, vì log CI của repo public ai cũng đọc được. Mỗi lần CI chạy, nó còn tự cài một chuỗi "canary" vào một bản build giả để chứng minh mình vẫn bắt được.

Bạn có thể thử ngay dưới đây, với một danh sách cấm giả:

<leak-guard-demo deny="Acme Holdings|Nguyễn Văn A|090-1234-5678" repos="secret-billing-api" value="Dự án cho Acme Holdings, liên hệ Nguyen Van A." label="Gõ một câu để thử" ok="Sạch: câu này sẽ được deploy." blocked="Bị chặn:" deny-name="mục cấm" repo-name="tên repo private" rules="Luật giả lập">Widget này cần JavaScript để chạy.</leak-guard-demo>

Thử bỏ dấu, viết hoa, hoặc viết `secret-billing-api` vào giữa câu: kết quả vẫn như nhau.

## Số liệu mà không lộ gì

Phần "Số liệu" trên trang chủ chỉ có con số: lượt đóng góp 12 tháng qua, số ngày có hoạt động, tỷ lệ ngôn ngữ trên các dự án được trình bày, và một heatmap 52 tuần. Mỗi biểu đồ có kèm mô tả bằng chữ cho trình đọc màn hình.

Khi không có token (ví dụ một pull request từ fork), build dùng một bản snapshot chỉ chứa con số tổng hợp, và trang ghi rõ "dữ liệu mẫu". Site không bao giờ crash vì thiếu dữ liệu.

## Craft

Một portfolio của engineer nên được làm kỹ như một sản phẩm. Vài chi tiết:

- **Design "Terminal"**, đồng bộ ở mức token với persona Coding trên hub [atkd1890.me](https://atkd1890.me): màu, font JetBrains Mono, góc vuông, mỗi khối nội dung mở đầu bằng một dòng lệnh.
- **Command palette ⌘K** để đi tới bất kỳ đâu, kèm phím tắt `g h`, `g b`, `?`. Âm thanh kiểu game có, nhưng mặc định tắt.
- **Ba ngôn ngữ**: tiếng Việt mặc định, tiếng Anh ở `/en/`, tiếng Nhật ở `/ja/`. Nút đổi ngôn ngữ đưa tới đúng trang đó ở ngôn ngữ kia, kể cả khi tắt JavaScript.
- **Accessibility có kiểm tra tự động**: axe chạy trên mọi trang ở cả light và dark, và một bài test đọc bảng token màu để chắc mọi cặp chữ/nền đạt tỷ lệ tương phản WCAG AA.
- **Nhẹ**: trang chủ có khoảng 3.7 KB JavaScript, chưa tới 6 KB CSS sau nén, một webfont tự host. Ngân sách này được kiểm tra trong CI.

{% shot "/blog/2026/github-native-portfolio/home-mobile", "Trang chủ trên điện thoại, chiều rộng 390px", 390, 844 %}

## Làm như một team, dù chỉ có một người

Site này được làm để chứng minh một người có thể đảm nhận mọi vai trò, không chỉ viết code. Vì vậy mỗi việc trong roadmap được gắn một vai trò (design, engineering, DevOps, QA, security, marketing, PM), và mỗi vai trò có "định nghĩa hoàn thành" riêng.

Cụ thể, nhánh `main` được bảo vệ: mọi thay đổi đi qua pull request và chỉ merge được khi các kiểm tra đều xanh. Mỗi quyết định có ảnh hưởng lâu dài được ghi thành một ADR: vì sao chọn GitHub-native, vì sao tên repo nằm trong secret, vì sao leak guard là bắt buộc, vì sao token chỉ đọc metadata, mức riêng tư, và ba ngôn ngữ. Repo public, nên tất cả những thứ đó đều nằm ở đây để ai cũng đọc được.

## Làm cùng AI

Phần lớn code và tài liệu của site được làm cùng Claude Code, theo một cách phân vai rõ ràng: agent đề xuất và triển khai, người quyết định và duyệt. Những quyết định về mức riêng tư, về những gì được hiện ra, về giọng văn, luôn là của người.

Ranh giới được viết thành luật: site không bao giờ gọi một mô hình AI và không giữ secret của agent. Agent viết bài sau này sẽ sống ở một repo private riêng và chỉ được phép mở pull request; nó đi qua đúng những cửa kiểm tra như mọi thay đổi khác. Bài nào do agent soạn, như chính bài này, đều có nhãn "AI hỗ trợ viết" ở đầu trang.

## Tiếp theo

- **Case study** đầu tiên, theo khung bối cảnh, ràng buộc, kiến trúc, quyết định, kết quả, bài học.
- **Agent viết blog**: TIL, link hay và build log hằng tuần, mỗi bài là một pull request chờ duyệt.
- **Series benchmark**: mỗi mô hình AI mới dựng cùng một prototype game theo một đề bài cố định, chấm theo cùng một bộ tiêu chí.

Toàn bộ mã nguồn, quyết định và cấu hình nằm ở [github.com/atkd1890/atkd1890.github.io](https://github.com/atkd1890/atkd1890.github.io). Nếu muốn theo dõi, feed ở [/feed.xml](/feed.xml).
