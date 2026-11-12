# 0004. `SHOWCASE_TOKEN` cho mọi repo nhưng chỉ có quyền Metadata

Ngày: 2026-11-12

## Bối cảnh

Kế hoạch đầu cho token quyền Contents trên một danh sách repo chọn tay, để đếm commit theo từng repo và từng năm. Cách này có hai cái giá:

- Mỗi lần thêm repo vào showcase phải sửa token.
- Leak guard chỉ biết tên các repo trong danh sách, repo private khác phải tự thêm vào denylist.

Chủ dự án muốn không phải bảo trì.

## Các phương án

| Phương án                       | Bảo trì                    | Đọc được code         | Leak guard biết mọi tên private | Số commit theo codename |
| ------------------------------- | -------------------------- | --------------------- | ------------------------------- | ----------------------- |
| Chọn repo, Contents + Metadata  | Sửa token mỗi repo mới     | Có, repo đã chọn      | Không                           | Có                      |
| Mọi repo, Contents + Metadata   | Không                      | **Có, mọi repo**      | Có                              | Có                      |
| **Mọi repo, chỉ Metadata**      | Không                      | **Không**             | Có                              | Không                   |

## Quyết định

Mọi repo, **chỉ Metadata: Read-only**. Số liệu theo năm lấy từ contribution calendar công khai. Chủ dự án đã bật "Include private contributions", nên việc trong repo private hiện ở đó dưới dạng con số; token nào cũng đọc được, kể cả `GITHUB_TOKEN` của Actions.

## Hệ quả

- Không phải sửa token khi thêm repo. Leak guard tự liệt kê mọi tên repo private.
- Token bị lộ chỉ lộ tên repo, ngôn ngữ và ngày tháng, không lộ code.
- Số liệu theo codename chỉ còn ngôn ngữ, ngày tạo và ngày push gần nhất. Signals báo contributions theo năm, không phải commit; chữ trên site phải ghi "contributions".
- Contributions chỉ tính commit có email gắn với tài khoản, việc cũ dưới email chưa gắn không hiện.
