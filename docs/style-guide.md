# Giọng văn

> **Nháp, chờ chủ dự án duyệt.** Áp dụng cho chữ trên site, bài blog và PR do agent soạn. Site có 3 ngôn ngữ, **tiếng Việt là mặc định** ([ADR 0006](adr/0006-i18n.md)); viết bản VI trước, EN và JA là bản dịch.

## Mục lục

- [Nguyên tắc](#nguyên-tắc)
- [Câu và đoạn](#câu-và-đoạn)
- [Tiêu đề](#tiêu-đề)
- [Số liệu và định dạng](#số-liệu-và-định-dạng)
- [Từ không dùng](#từ-không-dùng)
- [Motif terminal trong chữ](#motif-terminal-trong-chữ)
- [Bài do agent viết](#bài-do-agent-viết)

## Nguyên tắc

- **Show off bằng số, không bằng tính từ.** "Trang chủ chỉ có 3.7 KB JS" thay cho "siêu nhanh".
- **Cụ thể trước, khái quát sau.** Mở bằng một việc đã xảy ra, rồi mới rút ra bài học.
- **Kể như một thiết kế có chủ đích:** ràng buộc → quyết định → kết quả. Không kể quá trình thử sai.
- **Rõ ràng về giới hạn hiện tại:** cái gì chưa làm, cái gì là demo data, số nào đo ở môi trường nào.
- **Ngôi thứ nhất, giọng trò chuyện**, như đang giải thích cho một đồng nghiệp giỏi.

## Câu và đoạn

- Câu trung bình dưới 20 từ; một ý mỗi câu.
- Đoạn 1–4 câu. Bài dài chia section có tiêu đề cụ thể.
- Ưu tiên câu chủ động.
- Dùng danh sách và bảng khi có từ 3 mục so sánh trở lên.

## Tiêu đề

- Nói kết quả hoặc góc nhìn cụ thể, không nói chung chung: "Dựng portfolio trên GitHub khi phần lớn công việc là private" hơn "Ghi chép về website".
- Viết hoa kiểu câu (sentence case), không chấm cuối.
- Tối đa khoảng 60 ký tự để OG image không phải co chữ quá nhỏ.

## Số liệu và định dạng

- Mọi số có nguồn: link tới commit, workflow run, file, hoặc ghi rõ "measured on …".
- Không làm tròn cho đẹp; ghi đơn vị (KB gzipped, ms, %, contributions).
- Ngày ISO `2026-11-12`. Phần trăm có một chữ số thập phân khi cần.
- Không có số thì để `TODO`, không đoán.

## Từ không dùng

passionate, rockstar, ninja, guru, seamless, cutting-edge, game-changer, revolutionary, leverage (động từ), synergy, world-class, best-in-class, "simply", "just" (khi việc không hề đơn giản).

## Motif terminal trong chữ

- Nhãn section dạng lệnh (`$ ls work/`) chỉ dùng làm nhãn, không thay tiêu đề.
- Chú thích ngắn dạng `# …` cho trạng thái, ví dụ trạng thái trống.
- Không lạm dụng: body text vẫn là văn xuôi bình thường.

## Bài do agent viết

- Frontmatter `source: agent`, `agent_run` trỏ về lần chạy; site tự hiện nhãn "AI-assisted".
- Agent không được thêm số liệu không có trong dữ liệu đầu vào.
- Người duyệt sửa giọng văn theo file này trước khi merge.
