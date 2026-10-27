# Kế Hoạch Tracking Hoạt Động & Phân Tích Hành Vi Người Dùng (Frontend)

> **Nhánh:** `feature/user-behavior-analytics`  
> **Mục tiêu:** Tích hợp bộ thu thập hành vi người dùng (Tracking SDK/Hooks) và giao diện Admin Dashboard trực quan hóa dữ liệu thống kê.

---

## 1. Mục Tiêu Nghiệp Vụ & Yêu Cầu

1. **Theo dõi tự động thời gian dừng lại trên từng trang (Page Dwell Time):**
   - Đo chính xác thời gian (giây) người dùng ở lại từng route (`/`, `/trips`, `/booking/:id`, v.v.).
   - Tự động ghi nhận khi chuyển route (`react-router-dom`), đóng tab hoặc chuyển sang tab khác (`visibilitychange`, `beforeunload`).
2. **Theo dõi tương tác người dùng (Event Tracking):**
   - Lượt tìm kiếm chuyến xe (Nơi đi, Nơi đến, Ngày đi).
   - Thao tác chọn ghế, hủy ghế.
   - Thao tác mở/đóng và hỏi đáp AI chatbot.
   - Tỷ lệ hoàn tất đặt vé hoặc thoát ở các bước thanh toán (Funnel drop-off).
3. **Cơ chế thu thập nhẹ nhàng, không ảnh hưởng hiệu năng ứng dụng:**
   - Sử dụng LocalStorage để duy trì `visitorId` dài hạn (ẩn danh).
   - Sử dụng SessionStorage cho `sessionId` trong một phiên truy cập.
   - Cơ chế Batching: Gom sự kiện và gửi định kỳ hoặc dùng `navigator.sendBeacon` khi người dùng thoát trang.
4. **Giao diện Dashboard Thống Kê Hành Vi (Admin View):**
   - Biểu đồ thời gian trung bình người dùng dành cho từng trang.
   - Top các tuyến đường được tìm kiếm nhiều nhất.
   - Biểu đồ phễu chuyển đổi qua các bước đặt vé.

---

## 2. Thiết Kế Kỹ Thuật (Frontend)

### 2.1. Cấu trúc thư mục dự kiến
```
src/features/analytics/
   ├── hooks/
   │     ├── usePageTracking.ts         # Tự động bắt route change & tính dwell time
   │     └── useEventTracker.ts         # Helper gọi trackEvent('CLICK_SEAT', metadata)
   ├── services/
   │     └── trackerService.ts          # Queue sự kiện, batching và gửi qua axios / sendBeacon
   ├── types/
   │     └── analytics.types.ts
   └── components/                      # Giao diện Admin Analytics Dashboard
         ├── AnalyticsOverviewCard.tsx
         ├── PageDwellTimeChart.tsx
         ├── ConversionFunnelChart.tsx
         └── SearchTrendsTable.tsx
```

### 2.2. Nguyên lý đo Dwell Time trong `usePageTracking`
```typescript
// Ý tưởng triển khai:
useEffect(() => {
  const startTime = Date.now();
  const currentPath = location.pathname;

  return () => {
    const dwellTimeSeconds = Math.round((Date.now() - startTime) / 1000);
    if (dwellTimeSeconds > 0) {
      trackerService.trackDwellTime({
        pageUrl: currentPath,
        pageTitle: document.title,
        dwellTimeSeconds
      });
    }
  };
}, [location.pathname]);
```

---

## 3. Checklist Triển Khai

- [ ] Tạo `trackerService.ts` quản lý `visitorId`, `sessionId`, event queue và flush logic.
- [ ] Xây dựng hook `usePageTracking` tích hợp vào Root Layout / Router.
- [ ] Gắn event tracker vào các luồng quan trọng: Tìm kiếm chuyến xe, Chọn ghế, Đặt vé.
- [ ] Thiết kế trang Admin Dashboard (`/admin/analytics`) với biểu đồ trực quan (Recharts / Chart.js / Tailwind cards).
- [ ] Kiểm thử gửi event khi navigate và khi đóng trình duyệt.
