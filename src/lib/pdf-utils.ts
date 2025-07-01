import fontkit from '@pdf-lib/fontkit';
import PDFlib from 'pdf-lib';

const LINE_SPACING = 12; // Настраиваемый промежуток между строками
const { PDFDocument, rgb } = PDFlib;

export function downloadPDF(pdfBytes: BlobPart, filename = 'document.pdf') {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Очищаем URL через небольшую задержку
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export interface PdfOrderItem {
  serviceName: string;
  variants: Array<{
    name: string;
    price: number;
    quantity: number;
    total: number;
  }>;
}

export interface PdfOrderData {
  name: string;
  email: string;
  items: PdfOrderItem[];
  totalSum: number;
}

export const mapFormDataToPdfData = (formData: any): PdfOrderData => {
  const items: PdfOrderItem[] = formData.products
    .filter(
      (item: any) =>
        item.product &&
        item.variants.some((v: any) => v.checked && v.quantity > 0)
    )
    .map((item: any) => ({
      serviceName: item.product.title,
      variants: item.variants
        .filter((v: any) => v.checked && v.quantity > 0)
        .map((v: any) => ({
          name: v.title,
          price: parseInt(v.price),
          quantity: v.quantity,
          total: v.quantity * parseInt(v.price),
        })),
    }));

  const totalSum = items.reduce(
    (sum, item) =>
      sum + item.variants.reduce((itemSum, v) => itemSum + v.total, 0),
    0
  );

  return {
    name: formData.customerName,
    email: formData.email,
    items,
    totalSum,
  };
};

export const generatePdf = async (dataForPdf: PdfOrderData) => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Используем DejaVu Sans - хорошо поддерживает кириллицу
  const fontUrl =
    'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf';

  const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
  const font = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.addPage();

  // Настройка размеров и отступов
  const pageWidth = page.getWidth();
  const margin = 50;
  let yPosition = page.getHeight() - margin;
  const lineHeight = LINE_SPACING;

  // Header Section
  const logoUrl =
    'https://static.tildacdn.com/tild3866-3836-4065-a266-313938373731/logo.png'; // Path to the logo
  const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);

  const logoDims = logoImage.scale(0.3); // Scale logo to fit
  const headerHeight = logoDims.height + 20; // Add padding

  // Draw logo with rounded corners
  page.drawImage(logoImage, {
    x: 20,
    y: page.getHeight() - logoDims.height - 10,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Add contact information
  const contactText =
    '+7 (917) 535-34-33\nВладимир\nГ. Москва, ул.Красного Маяка 22к5';
  const contactX = page.getWidth() - margin - 200; // Adjust position
  const contactY = page.getHeight() - 40;

  page.drawText(contactText, {
    x: contactX,
    y: contactY,
    size: 10,
    font: font,
    lineHeight: 12,
  });

  // Adjust yPosition to start below the header
  yPosition = page.getHeight() - headerHeight - margin;
  // Removed duplicate header code
  // Removed duplicate declarations of pdfDoc, font, page, margin, etc.

  // Заголовок
  page.drawText('Заказ', {
    x: margin,
    y: yPosition,
    size: 24,
    font: font,
  });
  yPosition -= lineHeight * 2;

  // Email клиента
  page.drawText(`Email: ${dataForPdf.email}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
  });
  yPosition -= lineHeight * 2;

  page.drawText(`Имя: ${dataForPdf.name} - ${new Date()}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
  });
  yPosition -= lineHeight * 2;

  const formattedDate = new Date().toLocaleDateString('ru-RU');
  page.drawText(`Дата: ${formattedDate}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
  });
  yPosition -= lineHeight * 2;

  // Настройки таблицы
  const tableWidth = pageWidth - margin * 2;
  const colWidths = {
    variant: Math.floor(tableWidth * 0.4),
    quantity: Math.floor(tableWidth * 0.2),
    price: Math.floor(tableWidth * 0.2),
    total: Math.floor(tableWidth * 0.2),
  };

  // Перебираем все услуги
  for (const item of dataForPdf.items) {
    // Название услуги
    page.drawText(item.serviceName, {
      x: margin,
      y: yPosition,
      size: 14,
      font: font,
    });
    yPosition -= lineHeight;

    // Разделительная линия
    page.drawLine({
      start: { x: margin, y: yPosition + lineHeight / 2 },
      end: { x: pageWidth - margin, y: yPosition + lineHeight / 2 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Заголовки колонок
    page.drawText('Вариант', {
      x: margin + 20,
      y: yPosition,
      size: 12,
      font: font,
    });

    page.drawText('Кол-во', {
      x: margin + colWidths.variant,
      y: yPosition,
      size: 12,
      font: font,
    });

    page.drawText('Цена', {
      x: margin + colWidths.variant + colWidths.quantity,
      y: yPosition,
      size: 12,
      font: font,
    });

    page.drawText('Стоимость', {
      x: margin + colWidths.variant + colWidths.quantity + colWidths.price,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= lineHeight;

    // Варианты услуги
    for (const variant of item.variants) {
      page.drawText(variant.name, {
        x: margin + 20,
        y: yPosition,
        size: 12,
        font: font,
      });

      page.drawText(variant.quantity.toString(), {
        x: margin + colWidths.variant,
        y: yPosition,
        size: 12,
        font: font,
      });

      page.drawText(`${variant.price} ₽`, {
        x: margin + colWidths.variant + colWidths.quantity,
        y: yPosition,
        size: 12,
        font: font,
      });

      page.drawText(`${variant.total} ₽`, {
        x: margin + colWidths.variant + colWidths.quantity + colWidths.price,
        y: yPosition,
        size: 12,
        font: font,
      });

      yPosition -= lineHeight;
    }

    yPosition -= lineHeight;
  }

  // Итоговая сумма
  page.drawText('Итого:', {
    x: margin,
    y: yPosition,
    size: 14,
    font: font,
  });

  page.drawText(`${dataForPdf.totalSum} ₽`, {
    x: margin + colWidths.variant + colWidths.quantity + colWidths.price,
    y: yPosition,
    size: 14,
    font: font,
  });

  return await pdfDoc.save();
};
