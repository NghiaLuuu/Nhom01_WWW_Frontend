import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const waitForImages = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(images.map((image) => {
    if (image.complete) return Promise.resolve();

    return new Promise<void>((resolve) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    });
  }));
};

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
 * Chuyển đổi một hoặc nhiều phần tử DOM thành PDF A4.
 * Mỗi phần tử được đặt trọn trên một trang riêng, phù hợp cho mỗi vé/ghế.
 */
export async function exportToPDF(
  element: HTMLElement | HTMLElement[] | null,
  fileName: string
): Promise<boolean> {
  const elements = (Array.isArray(element) ? element : [element]).filter(
    (item): item is HTMLElement => item instanceof HTMLElement
  );

  if (elements.length === 0) {
    console.error('exportToPDF: element is null');
    return false;
  }

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (const [index, ticketElement] of elements.entries()) {
      // Do not capture the ticket until its official QR image has finished loading.
      await waitForImages(ticketElement);

      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowWidth: document.documentElement.offsetWidth,
      });

      if (index > 0) pdf.addPage();

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      const posY = contentHeight < pageHeight - margin * 2
        ? Math.max(margin, (pageHeight - contentHeight) / 2)
        : margin;

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        margin,
        posY,
        contentWidth,
        contentHeight,
        undefined,
        'FAST'
      );
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Lỗi khi xuất PDF:', error);
    return false;
  }
}
