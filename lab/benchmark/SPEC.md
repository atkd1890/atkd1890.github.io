# Benchmark: một prototype game, mọi model

> **Trạng thái:** nháp, chờ chủ dự án duyệt. Đề bài game và trọng số rubric là phần chủ dự án chốt (ROADMAP → "Cần chủ dự án quyết định"). Khi đã duyệt, mọi lần chạy dùng đúng bản này; muốn đổi thì tăng phiên bản đề bài và không so điểm giữa hai phiên bản.

## Mục lục

- [Mục tiêu](#mục-tiêu)
- [Luật chạy](#luật-chạy)
- [Đề bài](#đề-bài)
- [Đầu ra](#đầu-ra)
- [Rubric](#rubric)
- [Ghi kết quả](#ghi-kết-quả)

## Mục tiêu

So các model và agent trên cùng một việc có thật: dựng một prototype game nhỏ chơi được trong trình duyệt. Kết quả là số liệu so sánh được qua thời gian, không phải cảm nhận.

## Luật chạy

- Một prompt cố định (mục [Đề bài](#đề-bài)), gửi nguyên văn. Không gợi ý thêm, không sửa code bằng tay.
- Agent được tự chạy và tự sửa lỗi; giới hạn thời gian và số lượt do chủ dự án chốt (`TODO`).
- Mỗi model chạy 3 lần, lấy điểm trung vị.
- Ghi lại: model, phiên bản, ngày chạy, công cụ (CLI, IDE, API), thời gian, chi phí nếu có.
- Runner nằm ở atkd-stack (Phase 5 của repo đó); repo này chỉ giữ đề bài và hiển thị kết quả.

## Đề bài

`TODO`: chủ dự án chọn một trong các hướng dưới đây, rồi viết lại thành prompt cuối cùng.

| Hướng                                  | Vì sao hợp                              | Rủi ro                             |
| -------------------------------------- | --------------------------------------- | ---------------------------------- |
| Puzzle trên lưới (kiểu xếp ô, nối màu) | Luật rõ, dễ chấm đúng sai               | Ít đo được phần đồ hoạ và cảm giác |
| Arcade top-down một màn                | Đo vòng lặp game, va chạm, input        | Chấm "vui" khó khách quan          |
| Roguelike nhỏ theo lượt                | Đo sinh map, trạng thái, nhiều hệ thống | Dễ vượt thời gian giới hạn         |

Ràng buộc chung cho mọi hướng: một file `index.html`, không thư viện ngoài, chơi được bằng bàn phím và cảm ứng, chạy ở 375px và 1280px.

## Đầu ra

- `index.html` chạy được khi mở trực tiếp, không cần build.
- `NOTES.md` do agent viết: đã làm gì, chưa làm được gì.
- Log của lần chạy (do runner lưu, không do model tự khai).

## Rubric

Thang mỗi tiêu chí 0–4. Trọng số là đề xuất, chủ dự án chốt (`TODO`).

| Tiêu chí              | Cách chấm                                     | Trọng số đề xuất |
| --------------------- | --------------------------------------------- | ---------------- |
| Chạy được             | Mở là chơi được, không lỗi console            | 25%              |
| Đúng đề bài           | Đủ các luật và ràng buộc trong đề             | 25%              |
| Chơi được trên mobile | Cảm ứng, bố cục ở 375px                       | 15%              |
| Chất lượng code       | Đọc được, không lặp, xử lý trạng thái rõ ràng | 15%              |
| Hiệu năng             | Khung hình ổn định, kích thước file           | 10%              |
| Trau chuốt            | Âm thanh, hiệu ứng, màn hướng dẫn             | 10%              |

Phần "Chạy được", "Đúng đề bài", "Hiệu năng" nên được chấm tự động bằng Playwright khi có thể; phần còn lại do người chấm, ghi rõ ai chấm.

## Ghi kết quả

Mỗi lần chạy thành một bài `deep-dive` thuộc series `benchmark`, kèm bảng điểm, bản build chơi được và log. Bảng xếp hạng ở `/lab` đọc từ các bài này.
