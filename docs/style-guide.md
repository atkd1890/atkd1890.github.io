# Giọng văn

> **Nháp, chờ chủ dự án duyệt.** Áp dụng cho chữ trên site, bài blog và PR do agent soạn. Ngôn ngữ site còn chờ quyết định (ROADMAP); hiện viết tiếng Anh.

## Mục lục

- [Nguyên tắc](#nguyên-tắc)
- [Câu và đoạn](#câu-và-đoạn)
- [Tiêu đề](#tiêu-đề)
- [Số liệu và định dạng](#số-liệu-và-định-dạng)
- [Từ không dùng](#từ-không-dùng)
- [Motif terminal trong chữ](#motif-terminal-trong-chữ)
- [Bài do agent viết](#bài-do-agent-viết)

## Nguyên tắc

- **Show off bằng số, không bằng tính từ.** "Home page ships 3.7 KB of JS" thay cho "blazing fast".
- **Cụ thể trước, khái quát sau.** Mở bằng một việc đã xảy ra, rồi mới rút ra bài học.
- **Thật thà về giới hạn.** Nói rõ cái gì chưa làm, cái gì là demo data, cái gì đo ở môi trường nào.
- **Ngôi thứ nhất, giọng trò chuyện**, như đang giải thích cho một đồng nghiệp giỏi.

## Câu và đoạn

- Câu trung bình dưới 20 từ; một ý mỗi câu.
- Đoạn 1–4 câu. Bài dài chia section có tiêu đề cụ thể.
- Ưu tiên câu chủ động.
- Dùng danh sách và bảng khi có từ 3 mục so sánh trở lên.

## Tiêu đề

- Nói kết quả hoặc điều bất ngờ, không nói chung chung: "My leak guard caught me leaking" hơn "Notes on security".
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
