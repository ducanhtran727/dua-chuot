# Hạt giống dưa chuột bụi

Mở dist/index.html để xem trang. Khi đưa lên hosting tĩnh, xuất bản toàn bộ thư mục dist.

## Kết nối Google Sheets

1. Tạo Google Sheet. Sao chép ID nằm giữa /d/ và /edit trong URL.
2. Trong Sheet, mở **Tiện ích mở rộng → Apps Script**. Dán nội dung Code.gs rồi điền ID vào SHEET_ID.
3. Chọn **Triển khai → Lần triển khai mới → Ứng dụng web**. Chạy dưới tài khoản của bạn và cấp quyền truy cập cho **Bất kỳ ai** để khách có thể gửi form. Script tạo tab Don hang nếu cần.
4. Dán URL kết thúc bằng /exec vào ORDER_SCRIPT_URL trong dist/config.js. Xuất bản lại dist lên hosting nếu đã triển khai trang.
5. Gửi thử một đơn và đối chiếu dòng mới trong tab Don hang. Có thể xóa dòng thử sau khi kiểm tra.

Form gửi POST dạng application/x-www-form-urlencoded với các trường name, phone, address, quantity. Địa chỉ được nhập trong một ô văn bản. Nếu dùng script riêng, trả JSON {"ok":true} sau khi ghi thành công để trang xác nhận đơn.

