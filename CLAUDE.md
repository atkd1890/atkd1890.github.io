# Rule cho agent

Đọc trước khi làm việc: specs ở [README.md](README.md), việc còn mở ở [ROADMAP.md](ROADMAP.md), quyết định đã chốt ở [docs/adr](docs/adr/README.md).

Design: spec ở [docs/design.md](docs/design.md), hình ở artifact https://claude.ai/artifact/RXYDQoYg6Z91vRdaQEk6rR (private, cần đăng nhập đúng tài khoản). Khi làm giao diện, đọc bằng tool Artifact (action `read`): `project/canvas.json` rồi chỉ các artboard liên quan.

- Tokens, chữ, component: `Main.dc.html`
- Home: `HomeMobile.dc.html` (390px), `HomeDesktop.dc.html` (1440px, có palette ⌘K)
- Blog và bài viết: `Blog.dc.html`
- Case study: `CaseStudy.dc.html`

Phần core (token, font, góc vuông, motif terminal) đồng bộ với design hub atkd1890.me, persona "Coding — Terminal". docs/design.md là spec, artifact chỉ tham khảo về hình ảnh; hai bên lệch nhau thì hỏi chủ dự án.

## Persona và quyền riêng tư

Mức riêng tư là **kín đáo, không phải ẩn danh tuyệt đối** ([ADR 0005](docs/adr/0005-privacy-level.md)): người xem nối được ATKD Coding với tài khoản GitHub hay với hub cũng không sao. Cái phải giữ là dữ liệu công việc và thông tin liên lạc cá nhân. Các luật này luôn được ưu tiên hơn sự tiện lợi.

- Không ghi tên thật, nơi làm việc cũ hay hiện tại, tên khách hàng, email cá nhân, SĐT, địa chỉ, path máy local vào nội dung site hay file được commit. Liên hệ chỉ dùng `hi@atkd1890.me`.
- Tác giả và committer của mọi commit dùng email noreply của GitHub. Leak guard kiểm tra cả metadata commit trong PR và trên `main`.
- Tên repo private không bao giờ xuất hiện trong HTML, feed, JSON, OG image, commit message, PR, docs hay `showcase.yml`. Dùng codename dạng kebab-case, không trùng hay gần giống tên repo. Mapping codename → repo chỉ nằm trong secret `SHOWCASE_REPOS` ([ADR 0002](docs/adr/0002-private-repo-mapping-in-secrets.md)).
- Chỉ hiện những gì `showcase.yml` khai báo. Repo private chỉ đóng góp số liệu, không commit code, dữ liệu hay chữ copy từ repo private.
- Dự án công ty/khách hàng chỉ mô tả trừu tượng: domain, quy mô, vai trò.
- THN là org riêng, không nằm trong tài khoản này. Tool hay dự án của THN chỉ đưa vào khi chủ dự án duyệt từng cái.
- Không bịa link, số liệu, trích dẫn hay chi tiết dự án. Chưa có thì để `TODO`, hoặc dùng demo data có `placeholder: true` và nhãn "demo data" trên site; ghi việc còn thiếu vào ROADMAP.
- Site không gọi LLM và không chứa secret của agent. Agent viết blog nằm ở repo `atkd-stack`; repo này chỉ định nghĩa hợp đồng nội dung và CI gác cổng.
- Không đụng tới repo atkd1890.me (hub); hub chỉ link sang đây. Muốn đổi bên đó thì đề xuất cho chủ dự án.

## Code

- Eleventy v3 (ESM), Nunjucks. CSS thuần chỉ dùng token, không hardcode màu, font, bo góc (Stylelint chặn).
- Không thêm script inline: CSP chỉ cho phép script inline chống nháy theme, bằng hash ([ADR 0008](docs/adr/0008-build-time-search-og-csp.md)).
- JS cho người xem: vanilla hoặc Web Components, chỉ tải ở trang cần dùng. Component cho explainer nằm ở `src/_includes/interactive/`. Mermaid và Pagefind chạy lúc build.
- File trong `src/_data/*.js` chỉ được có `export default`; logic để ở `lib/` và có test.
- Ba ngôn ngữ VI (mặc định), EN, JA ([ADR 0006](docs/adr/0006-i18n.md)). Không hardcode chữ giao diện trong template: thêm key vào `src/_data/i18n.js` cho cả 3 ngôn ngữ. Nội dung cần dịch dùng map `{vi, en, ja}` và filter `tr`. Trang mới phân trang theo `i18n.langs` (alias `L`) và khai báo `basePath`.
- Dữ liệu GitHub chỉ đi qua `whitelist()` trong `lib/github-data.js`, mọi số liệu gắn theo codename. Không có token thì dùng snapshot (chỉ số liệu tổng hợp), không bao giờ crash.
- Leak guard bắt buộc trong CI. Không ghi denylist hay tên repo private ra đĩa trong repo, kể cả log thành artifact. Log chỉ in `file:dòng` và số thứ tự luật.
- Mỗi trang có link "Edit on GitHub" trỏ tới file nguồn.
- Blog: theo [docs/content.md → Viết một bài](docs/content.md#viết-một-bài). Media chỉ từ thứ có thật: ảnh chụp bằng `npm run screenshot`, sơ đồ Mermaid qua `npm run diagrams`, số liệu có nguồn. Không dùng ảnh AI tạo hay ảnh stock. Bài do agent soạn có `source: agent`.

## Việc chủ dự án tự làm

Thứ gì chủ dự án phải tự điền hoặc cập nhật về sau (secret, file riêng tư, chữ `TODO`, token có hạn, cài đặt trên giao diện web) thì trong cùng thay đổi phải thêm vào bảng "Tùy chỉnh và bảo trì" của README: nằm ở đâu, khi nào sửa, cách làm. Nếu chứa dữ liệu riêng tư thì thêm template dữ liệu giả ở `config/examples/`. File thật nằm ở `../.config/atkd1890.github.io/` cạnh repo (thư mục cha không phải git repo), đẩy lên bằng `npm run secrets:push`, không bao giờ commit.

## Definition of done

Site phải chứng minh một người làm được mọi vai trò. Trước khi báo xong một task, tự kiểm tra đủ các vai trò dưới đây; vai trò nào không liên quan thì ghi "không áp dụng" trong báo cáo, không bỏ qua im lặng.

- **design:** chỉ dùng token; đúng docs/design.md và artifact hoặc đã hỏi khi lệch; kiểm tra ở 375px và 1280px, light và dark; tương phản đạt WCAG AA; focus nhìn rõ.
- **eng:** `npm run check` qua; trong ngân sách hiệu năng; không tải JS ở trang không cần.
- **ops:** workflow `Deploy` và `PR check` xanh; action pin theo SHA; secret mới có ghi phạm vi trong README.
- **qa:** logic mới có unit test; hành vi giao diện có e2e trong `tests/e2e/`; `npm run test:e2e` qua, gồm axe không có lỗi serious hay critical; `npm run budget`, `npm run validate:html`, `npm run links` và `npm run lighthouse` qua; đổi giao diện thì chạy `npm run test:visual` và cập nhật baseline nếu thay đổi là cố ý.
- **sec:** leak guard sạch, kể cả `npm run leak-guard:local` với dữ liệu thật; không lộ tên riêng hay danh tính trong output, commit, PR.
- **mkt:** mỗi trang public có title, summary, OG image; chữ theo giọng văn (số liệu trước tính từ).
- **pm:** xoá task đã xong khỏi ROADMAP, thêm việc mới phát sinh; quyết định có ảnh hưởng lâu dài ghi ADR; thay đổi người xem thấy được ghi CHANGELOG.

## Giọng văn và craft

- Show off nhưng có số liệu. Ưu tiên con số và sơ đồ hơn tính từ.
- Mobile-first, kiểm tra ở 375px. Lighthouse ≥ 95.
- ⌘K / Ctrl+K mở command palette (điều hướng, tìm kiếm Pagefind, đổi theme). Phím tắt `g h`, `g b`, `/`, `?`.
- Nút âm thanh **mặc định tắt**. Tôn trọng `prefers-reduced-motion`. Micro-interaction không được làm chậm hay chặn việc đọc.
- License: nội dung CC BY 4.0, code MIT; ghi ở README, footer và `/colophon`.

## Git

- Identity của repo là `atkd1890 <2776097+atkd1890@users.noreply.github.com>`. Kiểm tra `git config user.email` trước khi commit, không bao giờ commit bằng email cá nhân. Merge trên GitHub dùng tên và email theo profile, nên profile phải để email private.
- Nhánh mặc định là `main`. History cũ chỉ nằm trong bundle ở `../_archive/`, không push lại.
- Commit nhỏ theo task, message dạng `type: mô tả` (`feat`, `fix`, `docs`, `test`, `ci`, `chore`), không chứa tên repo private.
- `main` được bảo vệ: làm trên nhánh riêng, mở PR, chờ `check` và `gitleaks` xanh rồi squash merge. Không push thẳng lên `main`, kể cả khi admin bypass được. Nhánh trên GitHub tự xoá sau khi merge; ở local `fetch.prune` đã bật, nhánh local tự xoá sau merge.
- Không push hay merge nếu chủ dự án chưa bảo. Ngoại lệ duy nhất: PR patch và minor của Dependabot tự merge khi CI xanh ([ADR 0010](docs/adr/0010-dependabot-auto-merge.md)); bản major vẫn chờ chủ dự án.
- Docs viết lại cho đúng hiện trạng, không nối thêm ghi chú hay ngày vào dòng cũ.
