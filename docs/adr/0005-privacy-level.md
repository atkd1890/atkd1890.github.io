# 0005. Mức riêng tư: kín đáo, không ẩn danh tuyệt đối

Ngày: 2026-11-12

## Bối cảnh

Plan gốc coi ATKD Coding là persona ẩn danh: không để ai nối được với tên thật. Thực tế:

- Persona nằm trên tài khoản GitHub `atkd1890`, và hub atkd1890.me công khai tài khoản đó cùng LinkedIn.
- Ba commit squash merge trên `main` mang tên và email theo profile GitHub, vì GitHub ghi tác giả của merge trên web theo profile. Leak guard lúc đó chỉ quét nội dung, không quét metadata commit.

Chủ dự án xác nhận không cần ẩn danh tuyệt đối.

## Quyết định

- Mức riêng tư là **kín đáo**: nối persona với tài khoản GitHub, hub hay tên thật đều chấp nhận được.
- Vẫn giữ kín: nơi làm việc, khách hàng, tên repo private, code private, email cá nhân, SĐT, địa chỉ. Lý do là NDA, chống spam và sự chuyên nghiệp.
- Mọi commit dùng `atkd1890` + email noreply của GitHub. Profile GitHub để email private. History trên `main` đã được viết lại một lần để đồng nhất 20 commit đầu; bản cũ lưu ở bundle ngoài repo.
- Leak guard kiểm tra thêm tên và email tác giả, committer: trong PR là các commit của PR, khi deploy là commit mới nhất trên `main`. Chỉ chấp nhận email noreply của GitHub, không chấp nhận chuỗi trong denylist.

## Hệ quả

- Tên thật vẫn nằm trong denylist, nên không xuất hiện trong nội dung site, dù việc nối danh tính là chấp nhận được.
- Viết lại history làm đổi mọi mã commit. Commit cũ vẫn có thể mở được qua mã hash từ trang PR cho tới khi GitHub Support xoá.
- Commit của Dependabot và GitHub dùng email noreply nên vẫn qua kiểm tra.
