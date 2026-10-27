# Kế Hoạch Nâng Cấp Giao Diện Chatbot AI Tương Thích Spring AI pgvector (Frontend)

> **Nhánh:** `feature/spring-ai-pgvector`  
> **Căn cứ tài liệu:** Chapter 7 - Spring AI: Connecting Enterprise Data & APIs with AI Models (Product Assistant Architecture & UI)

---

## 1. Hiện Trạng & Vấn Đề

- **Hiện trạng:**
  - `ChatbotWidget.tsx` hiện tại chỉ gửi chuỗi câu hỏi thô `{ question }` tới `/chatbot/ask`.
  - Phản hồi từ backend được parse theo regex đơn giản `[[BOOK_TRIP_ID:<id>]]` và render text thô (không có format Markdown, không có thẻ chuyến xe trực quan).
  - Không lưu trữ ngữ cảnh hội thoại đa lượt (multi-turn conversation) theo session ID.

- **Mục tiêu nâng cấp:**
  - Nâng cấp `ChatbotWidget` giao diện hiện đại, mượt mà, hỗ trợ render Markdown (bullet points, in đậm, danh sách giá vé) để câu trả lời không bị thô.
  - Tích hợp Card hiển thị chuyến xe được đề xuất từ kết quả RAG / pgvector (hình ảnh nhà xe, điểm đón/trả, giá vé, giờ xuất bến) kèm nút tương tác trực tiếp "Chọn chuyến này / Đặt vé ngay".
  - Quản lý lịch sử chat và gửi kèm `conversationId` hoặc danh sách lịch sử để tương thích với `ChatMemory` của Spring AI.
  - Hỗ trợ hiển thị trạng thái đang xử lý thông minh (AI typing indicator hoặc streaming chunks).

---

## 2. Thiết Kế Kiến Trúc & Giao Diện (Frontend)

```
[ChatbotWidget UI]
   ├── ChatMessageList
   │     ├── TextMessage (Markdown rendered)
   │     └── TripRecommendationCard (Trip details, Price, Direct Book Button)
   ├── QuickSuggestions (Gợi ý câu hỏi mẫu: "Vé đi Đà Lạt rẻ nhất", "Chính sách hủy vé")
   └── ChatInputBar (Gửi câu hỏi, auto-resize)
```

### 2.1. Cấu trúc dữ liệu phản hồi mới
Nhận diện cấu trúc phản hồi nâng cao từ Spring AI Backend:
```typescript
interface BotResponse {
  answer: string;                  // Nội dung trả lời định dạng Markdown
  recommendedTrips?: TripSummary[]; // Danh sách chuyến xe tìm được từ pgvector
  suggestedActions?: string[];     // Các câu hỏi gợi ý tiếp theo
}
```

### 2.2. Trải nghiệm người dùng (UX)
- Tự nhiên, thân thiện: Text hiển thị theo định dạng Markdown thay vì plain text.
- Thao tác nhanh: Khi AI tìm được chuyến xe, người dùng có thể bấm vào nút đặt vé trên chính thẻ chuyến xe trong ô chat để chuyển thẳng vào màn hình chọn ghế.

---

## 3. Checklist Triển Khai

- [ ] Cài đặt thư viện parse markdown nhẹ (hoặc custom component định dạng text).
- [ ] Thiết kế component `TripRecommendationCard` hiển thị trong luồng chat.
- [ ] Cập nhật `ChatbotWidget.tsx` gửi session ID / conversation context.
- [ ] Xử lý error handling thân thiện khi AI backend đang tải hoặc mất kết nối.
- [ ] Kiểm thử trải nghiệm hỏi đáp tìm kiếm chuyến xe trên cả Desktop và Mobile.
