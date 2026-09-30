import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Loại bỏ dấu tiếng Việt và chuẩn hóa chuỗi để làm tên file an toàn
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let result = str;
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  result = result.replace(/[đĐ]/g, (match) => (match === 'đ' ? 'd' : 'D'));
  // Xóa các ký tự đặc biệt, chỉ giữ lại chữ, số và khoảng trắng
  result = result.replace(/[^a-zA-Z0-9\s-_]/g, '');
  // Thay thế khoảng trắng liên tiếp bằng 1 dấu gạch ngang
  result = result.trim().replace(/\s+/g, '-');
  return result;
}

/**
 * Tạo tên file vé xe chuẩn theo định dạng:
 * ve-xe_{maVe}_{tenHanhKhach}_{ngayKhoiHanh}.pdf
 * Ví dụ: ve-xe_VX000059_Le-Van-Khach_29-08-2026.pdf
 */
export function generateTicketFileName(
  bookingCode: string | number,
  customerName?: string,
  departureDateStr?: string
): string {
  const codeStr = String(bookingCode);
  const cleanCode = codeStr.startsWith('VX-') 
    ? codeStr.replace('-', '') 
    : codeStr.startsWith('VX') 
    ? codeStr 
    : `VX${codeStr.padStart(6, '0')}`;

  const cleanName = removeVietnameseTones(customerName || 'HanhKhach');

  let cleanDate = 'NgayDi';
  if (departureDateStr) {
    try {
      const d = new Date(departureDateStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        cleanDate = `${day}-${month}-${year}`;
      }
    } catch {
      cleanDate = 'NgayDi';
    }
  }

  return `ve-xe_${cleanCode}_${cleanName}_${cleanDate}.pdf`;
}

/**
 * Chuyển đổi phần tử DOM thành file PDF vừa vặn 1 trang (A4 portrait)
 */
export async function exportToPDF(
  element: HTMLElement | null,
  fileName: string
): Promise<boolean> {
  if (!element) {
    console.error('exportToPDF: element is null');
    return false;
  }

  try {
    // 1. Chụp canvas với scale 2 và scroll reset để không bị lệch vị trí
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
      windowWidth: document.documentElement.offsetWidth,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // 2. Khởi tạo tài liệu jsPDF chuẩn khổ A4 (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const margin = 8; // lề 8mm

    const contentWidth = pageWidth - margin * 2; // 194mm
    // Tính chiều cao ảnh tương ứng theo tỷ lệ
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    // Căn giữa theo chiều dọc nếu chiều cao vừa vặn trong 1 trang
    let posY = margin;
    if (contentHeight < pageHeight - margin * 2) {
      posY = Math.max(margin, (pageHeight - contentHeight) / 2);
    }

    // 3. Đưa ảnh vào 1 trang duy nhất
    pdf.addImage(imgData, 'JPEG', margin, posY, contentWidth, contentHeight, undefined, 'FAST');

    // 4. Lưu file với tên chuẩn
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Lỗi khi xuất PDF:', error);
    return false;
  }
}
