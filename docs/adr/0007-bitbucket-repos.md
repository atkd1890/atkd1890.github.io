# 0007. Repo cũ trên Bitbucket: import repo cá nhân, giữ nguyên repo khách hàng

Ngày: 2026-11-12

## Bối cảnh

Nhiều dự án cũ (giai đoạn mobile và indie game) nằm trong repo private trên Bitbucket. Hai giai đoạn này hiện chưa có dữ liệu trên GitHub, nên Trajectory và Signals phải dùng dữ liệu mẫu (ADR 0005, `placeholder: true`).

Site build trên GitHub Actions nên đọc được API của bất kỳ dịch vụ nào; vấn đề không nằm ở hosting mà ở chỗ dữ liệu ở đâu và ai sở hữu repo.

## Các phương án

| Phương án                                             | Hoạt động cũ hiện trong heatmap GitHub   | Quyền của token                                                 | Rủi ro hợp đồng                          | Công sức                             |
| ----------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------- | ---------------------------------------- | ------------------------------------ |
| Chuyển hết sang GitHub                                | Có (nếu email cũ được gắn vào tài khoản) | Chỉ Metadata, như hiện tại                                      | **Cao** với repo của công ty, khách hàng | Import từng repo                     |
| Giữ ở Bitbucket, đọc qua API                          | Không, phải tự cộng                      | Bitbucket không có quyền "chỉ metadata": token đọc được cả code | Thấp                                     | Viết adapter Bitbucket               |
| Dựng site riêng ngoài GitHub Pages                    | Không                                    | Như trên                                                        | Thấp                                     | Cao, và không cần thiết              |
| **Kết hợp: import repo cá nhân, giữ repo khách hàng** | Có cho phần cá nhân                      | Chỉ Metadata cho phần đã import                                 | Thấp                                     | Import một phần, adapter chỉ khi cần |

## Quyết định

- **Repo của riêng chủ dự án** (dự án cá nhân, game indie) được **import sang GitHub dưới dạng private**, giữ nguyên lịch sử commit. Email cũ dùng để commit được thêm vào tài khoản GitHub (để private), để các commit cũ được tính vào contribution calendar.
- **Repo của công ty hoặc khách hàng** **giữ nguyên trên Bitbucket**, không sao chép đi đâu. Nếu cần đưa vào showcase, chỉ ở mức thẻ hoặc case study trừu tượng (ADR 0005); số liệu, nếu có, đọc qua API Bitbucket bằng adapter riêng, làm sau.
- Không dựng site thứ hai; GitHub Pages vẫn là hosting duy nhất.
- Repo import vào được đưa lên site đúng như mọi repo private khác: codename trong `showcase.yml`, mapping trong secret `SHOWCASE_REPOS`, leak guard tự biết tên repo nhờ token "All repositories".

## Hệ quả

- Hai giai đoạn mobile và indie game có dữ liệu thật thay cho dữ liệu mẫu, sau khi import.
- Contribution calendar chỉ tính commit có email đã xác minh trên tài khoản; email cũ nào không thể xác minh (hộp thư đã mất) thì commit đó không được tính.
- Việc phân loại "của riêng" hay "của khách hàng" là của chủ dự án, từng repo một. Khi không chắc, mặc định là của khách hàng và giữ nguyên.
- Adapter Bitbucket (token chỉ đọc, số commit theo năm, tên repo cho leak guard) chỉ làm khi có repo khách hàng thật sự cần số liệu.
