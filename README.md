# Liên Chiểu Xanh — website demo

Website tĩnh để minh họa ý tưởng thi. Mở `index.html` để xem trang người dân; chọn **Điều phối (demo)** để xem quy trình tiếp nhận và duyệt kết quả trong `admin.html`.

## Đưa lên GitHub Pages

1. Tạo một repository GitHub mới và tải **toàn bộ sáu tệp** trong thư mục này lên **gốc repository**: `index.html`, `admin.html`, `app.js`, `admin.js`, `style.css`, `app.css`. Tệp `README.md` cũng có thể tải lên.
2. Mở **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**, nhánh `main` và thư mục `/ (root)`.
3. Truy cập địa chỉ GitHub Pages khi GitHub báo trang đã xuất bản. Trang điều phối ở đường dẫn `/admin.html` hoặc liên kết trong menu.

Có thể thử ngay trên máy bằng cách mở `index.html`, nhưng chạy qua GitHub Pages hoặc một web server cục bộ sẽ phù hợp hơn khi kiểm tra toàn bộ luồng.

## Luồng thử nghiệm

- Chọn khu vực để xem **lịch minh họa**. Lựa chọn muốn nhận nhắc giờ chỉ lưu cục bộ; nút **Xem lời nhắc mẫu** không tạo thông báo tự động.
- Báo một điểm rác kèm vị trí, loại, mô tả và ảnh tùy chọn. Trên cùng trình duyệt, mở trang điều phối để phân luồng, nộp ảnh/xác nhận kết quả, duyệt công bố. Quay về trang người dân để xem trạng thái và ảnh đã duyệt.
- Tạo yêu cầu đồ cồng kềnh; đăng ký một ca tình nguyện; thử biểu mẫu thông tin vi phạm. Biểu mẫu vi phạm **không lưu và không gửi** nội dung hoặc tệp.

## Giới hạn

Lịch, điểm rác mẫu, hoạt động và số liệu là giả định. Báo cáo, yêu cầu cồng kềnh, ảnh và ca tình nguyện chỉ lưu bằng `localStorage` trong **trình duyệt đang sử dụng**, không đồng bộ giữa các máy. Trang điều phối **không có đăng nhập hay phân quyền**; bất kỳ ai biết đường dẫn có thể dùng trang mô phỏng trên thiết bị của họ. Không sử dụng bản này để tiếp nhận báo cáo thật, đặc biệt thông tin nhận dạng cá nhân hoặc tố giác hành vi vi phạm. Bản triển khai thực tế cần máy chủ, cơ sở dữ liệu, xác thực, quy trình kiểm duyệt và lịch được đơn vị thu gom xác nhận.

Kênh phản ánh chính thức của thành phố: <https://gopy.danang.gov.vn/>.
