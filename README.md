# 🚌 VEXE - Online Bus Ticket Booking System (Frontend)

![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)
![Zustand](https://img.shields.io/badge/Zustand-Store-orange.svg)

> **Sinh viên thực hiện:** Lưu Trung Nghĩa - MSSV: 21058181  
> **Môn học:** Đăng ký đề tài WWW  
> **Mô tả:** Giao diện người dùng hiện đại, Responsive và hiệu suất cao cho Hệ thống Đặt Vé Xe Khách (VEXE).

---

## 🏗️ Kiến Trúc Dự Án (Architecture)

Dự án Frontend được xây dựng dựa trên các tiêu chuẩn thiết kế khắt khe để đảm bảo khả năng mở rộng:

1. **Feature-Sliced Design (FSD)**: Code được chia thành các module theo tính năng (`features/admin`, `features/booking`, `features/auth`), giúp tách biệt hoàn toàn logic kinh doanh giữa luồng của khách hàng và luồng quản lý nội bộ.
2. **Fixed Skeleton Architecture**: Các trang Dashboard và Public Layout được thiết kế nguyên khối cố định. Chỉ có dữ liệu nội dung, bảng, và form bên trong thay đổi thông qua React Router (`<Outlet />`), đảm bảo ứng dụng không bao giờ bị "vỡ layout" khi chuyển trang và load trang cực kỳ nhanh.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

* **Interactive Seat Map (Sơ đồ ghế động)**: Render giao diện ghế ngồi 2 tầng trực quan. Khách hàng có thể tương tác chọn ghế, các ghế đã mua sẽ tự động khóa (màu xám).
* **Real-time 5-minute Countdown Timer**: Đồng hồ đếm ngược giữ chỗ thanh toán trong 5 phút. Logic tự động dọn sạch giỏ hàng và đá người dùng về trang tìm kiếm nếu hết giờ.
* **Dynamic RBAC Dashboard**: Bảng điều khiển Admin tự động điều chỉnh các nút thao tác và module hiển thị dựa vào quyền hạn của Staff/Admin nhận được từ Backend.
* **Floating AI Chatbot Widget**: Tích hợp một bong bóng Chatbot lơ lửng cho phép khách hàng tương tác bằng ngôn ngữ tự nhiên để hỏi về thông tin vé, giờ giấc ngay trên màn hình.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Core:** ReactJS, TypeScript, Vite
* **Styling:** Tailwind CSS, Lucide React (Icons)
* **State Management:** Zustand
* **Routing:** React Router DOM
* **API Integration:** Axios (Tích hợp interceptor xử lý Refresh Token 401 tự động)
* **Toast Notifications:** React Hot Toast

---

## ⚙️ Yêu Cầu Môi Trường (Prerequisites)

* **Node.js**: Phiên bản 18.0.0 hoặc mới hơn.
* **NPM** hoặc **Yarn** được cài đặt.

---

## 🚀 Hướng Dẫn Cài Đặt (Environment Setup)

Tạo file `.env` tại thư mục gốc của dự án Frontend và cấu hình địa chỉ trỏ tới Backend API của bạn:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 💻 Hướng Dẫn Chạy Dự Án (Run Instructions)

**1. Cài đặt các thư viện phụ thuộc:**
Mở terminal tại thư mục gốc của project (chứa file `package.json`):
```bash
npm install
```

**2. Khởi động môi trường dev (Vite):**
```bash
npm run dev
```

Hệ thống sẽ tự động khởi động tại: `http://localhost:5173` (hoặc một port khác do Vite cấp phép nếu 5173 bận).

---

## ⚠️ Khắc Phục Sự Cố & Lưu Ý (Troubleshooting)

**1. Lỗi không hiển thị dữ liệu / Trắng màn hình ở trang Quản trị (Admin):**
* Dữ liệu các bảng (Tuyến đường, Xe & Tài xế, Chuyến xe, Vé) được kéo từ Backend API. Hãy đảm bảo Backend đã chạy tính năng `DataSeeder` và không bị lỗi.
* Các component Admin như `RouteManagement`, `VehicleManagement`, `TripManagement` sử dụng trực tiếp các phương thức `.getAll()` từ service. Nếu API báo lỗi `403 Forbidden`, bạn cần kiểm tra lại tài khoản đang đăng nhập đã được cấp đúng `Permission Code` (ví dụ: `TRIP_MANAGE`, `STAFF_MANAGE`) từ Backend hay chưa.
* Nếu bảng vé (Ticket) báo lỗi `Cannot read properties of undefined (reading 'join')`, đó là do API Backend trả về thiếu trường `seats`. Frontend đã được thêm Null-Safe Check (`row.seats ? ...`) để tự bảo vệ khỏi lỗi crash ứng dụng.
