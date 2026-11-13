# 0010. Dependabot: gộp theo tuần, tự merge bản patch và minor trừ gói đổi giao diện

Ngày: 2026-11-13

## Bối cảnh

Dependabot mở mỗi package một PR, mỗi tuần. Sau một tuần đã có 5 PR mở cùng lúc. `main` bắt nhánh phải mới nhất trước khi merge, nên merge một PR làm các PR còn lại phải rebase và chạy lại CI. Chủ dự án muốn không phải dọn tay, còn rule chung của repo là không merge khi chủ dự án chưa bảo.

## Các phương án

| Phương án                                    | Việc tay mỗi tuần         | Rủi ro                                            |
| -------------------------------------------- | ------------------------- | ------------------------------------------------- |
| Để nguyên, merge tay                         | Nhiều PR, rebase lẫn nhau | PR tồn đọng, bản vá bảo mật trễ                   |
| Tắt Dependabot                               | Không                     | Dependency cũ dần, lỗ hổng không ai thấy          |
| Gộp, merge tay                               | Khoảng 1 PR               | Vẫn phải nhớ merge                                |
| **Gộp, tự merge patch và minor khi CI xanh** | Chỉ bản major             | Một bản minor lỗi lọt qua nếu test không bắt được |

## Quyết định

- `dependabot.yml` gộp các bản patch và minor thành một PR mỗi tuần cho npm, một PR cho GitHub Actions. Bản major đi riêng.
- Gói đổi giao diện người xem thấy (`@11ty/*`, `@fontsource/*`, `mermaid`) vào nhóm riêng `npm-visual`. CI không có visual regression (baseline chỉ đúng trên macOS), nên nhóm này luôn chờ người chạy `npm run test:visual` rồi merge; workflow để lại một comment nhắc khi PR mở.
- Workflow `Dependabot auto-merge` bật auto-merge (squash) cho mọi PR Dependabot còn lại không phải major. GitHub chỉ merge sau khi `check` (gồm unit, e2e trên 4 trình duyệt, Lighthouse, leak guard) và `gitleaks` xanh.
- Đây là ngoại lệ duy nhất của rule "không merge khi chủ dự án chưa bảo", do chủ dự án chốt ngày 2026-11-13. Bản major và nhóm `npm-visual` vẫn chờ người.

## Hệ quả

- Không còn PR Dependabot tồn đọng, trừ bản major và nhóm `npm-visual`.
- Cách này dựa vào check bắt buộc của branch protection, có miễn phí vì repo public. Repo private ở gói Free không có check bắt buộc, `--auto` sẽ merge ngay, nên không áp dụng nguyên mẫu này được.
- Merge do `GITHUB_TOKEN` thực hiện không kích hoạt workflow khác, nên `Deploy` không chạy ngay sau đó; cron hằng ngày sẽ deploy. Các bản này hầu hết là devDependency, không đổi site người xem thấy.
- Commit trên `main` có tác giả `dependabot[bot]` với email noreply của GitHub, leak guard chấp nhận.
