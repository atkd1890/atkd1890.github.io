# 0009. Snapshot theo năm nằm ở nhánh `snapshots`, Deploy ghép vào mỗi lần build

Ngày: 2026-11-12

## Bối cảnh

Mỗi cuối năm, site cần một bản đóng băng ở `/YYYY/` để người đọc thấy được hành trình qua từng năm ([docs/content.md](../content.md#snapshot-theo-năm)). GitHub Pages chỉ phục vụ đúng artifact của lần deploy gần nhất, nên mọi bản cũ phải có mặt trong từng lần deploy. Template dùng đường dẫn tuyệt đối từ gốc (`/assets/…`, `/blog/…`).

## Các phương án

| Phương án                                           | Lưu ở đâu | Bản cũ có đổi theo code mới không          | Ghi chú                                                           |
| --------------------------------------------------- | --------- | ------------------------------------------ | ----------------------------------------------------------------- |
| Build lại mọi năm từ tag ở mỗi lần deploy           | Không lưu | Không, nhưng dữ liệu GitHub là của hôm nay | Deploy chậm dần; số liệu năm cũ sai                               |
| Artifact của Actions                                | Artifact  | Không                                      | Artifact hết hạn sau tối đa 90 ngày                               |
| Thêm `pathPrefix` cho toàn site                     |           |                                            | Phải sửa mọi template; JS và JSON trong trang vẫn cần xử lý riêng |
| **Nhánh `snapshots`, viết lại đường dẫn sau build** | Git       | Không                                      | Bản lưu là file tĩnh, có lịch sử, không hết hạn                   |

## Quyết định

- Tag `snapshot-YYYY` chạy workflow `Snapshot`: build ở tag đó với dữ liệu thật (`SNAPSHOT_YEAR` bật banner "bản lưu" và `noindex`), sinh OG, qua leak guard, rồi `scripts/snapshot.js` chuyển mọi đường dẫn từ gốc sang `/YYYY/` (`lib/snapshot.js`). Kết quả được commit vào thư mục `YYYY/` của nhánh `snapshots` bằng identity noreply, rồi Deploy chạy lại.
- Deploy lấy nhánh `snapshots` (nếu có) và giải nén vào `_site/` sau bước OG, trước Lighthouse, ngân sách và leak guard.
- Bản lưu không có `sitemap.xml`, `robots.txt`, `security.txt`, 404; các file này chỉ thuộc site đang chạy. Tìm kiếm trong bản lưu dùng index riêng của nó: bảng lệnh tải Pagefind theo đường dẫn tương đối và đặt `baseUrl`.

## Hệ quả

- Bản lưu không bao giờ đổi theo code hay dữ liệu mới. Muốn làm lại một năm thì chạy lại workflow với tag đó.
- Leak guard ở mỗi lần Deploy quét cả bản lưu. Thêm một mục denylist khớp nội dung cũ sẽ làm Deploy fail cho tới khi bản lưu được làm lại; đây là chủ ý.
- Link tới site đang chạy trong bản lưu (banner, `security.txt`) viết dạng `//atkd1890.github.io/…` để bước viết lại đường dẫn không đụng tới.
- Nhánh `snapshots` không có branch protection và không bao giờ merge vào `main`.
