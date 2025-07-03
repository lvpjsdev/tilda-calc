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

// Генерация base64 PNG-градиента (1x100px, #000 → #001f46 → #00132e)
export function generateGradientBase64(height = 100) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Не удалось получить 2D-контекст для canvas');
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#000000');
  gradient.addColorStop(0.5, '#001f46');
  gradient.addColorStop(1, '#00132e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1, height);
  return canvas.toDataURL('image/png');
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
        (item.product &&
          item.variants.some((v: any) => v.checked && v.quantity > 0)) ||
        (!item.product &&
          item.variants &&
          item.variants.length &&
          item.variants[0].title &&
          item.variants[0].price)
    )
    .map((item: any) => {
      if (item.product) {
        return {
          serviceName: item.product.title,
          variants: item.variants
            .filter((v: any) => v.checked && v.quantity > 0)
            .map((v: any) => ({
              name: v.title,
              price: parseInt(v.price),
              quantity: v.quantity,
              total: v.quantity * parseInt(v.price),
            })),
        };
      } else {
        // Кастомная услуга
        return {
          serviceName: item.variants[0].title,
          variants: [
            {
              name: item.variants[0].title,
              price: parseInt(item.variants[0].price),
              quantity: item.variants[0].quantity,
              total:
                item.variants[0].quantity * parseInt(item.variants[0].price),
            },
          ],
        };
      }
    });

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
// Загружает изображение по URL и возвращает dataURL
export async function fetchImageAsDataURL(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to convert image to dataURL'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const generatePdf = async (
  dataForPdf: PdfOrderData,
  logoDataUrl: string = 'https://static.tildacdn.com/tild6261-6433-4230-a362-373032656562/logo.png'
) => {
  // Если это внешний URL, преобразуем в dataURL
  let logo = logoDataUrl;
  if (logoDataUrl.startsWith('http')) {
    logo = await fetchImageAsDataURL(logoDataUrl);
  }
  const gradientBase64 = generateGradientBase64(200);
  const docDefinition = {
    content: [
      {
        image: gradientBase64,
        width: 595, // A4 width in pt (portrait)
        height: 200,
        absolutePosition: { x: 0, y: 0 },
      },
      {
        columns: [
          {
            image: logo,
            width: 150,
            margin: [0, 0, 0, 10],
          },
          {
            text: [
              '+7 (917) 535-34-33\n',
              'Владимир\n',
              'Г. Москва, ул.Красного Маяка 22к5\n',
            ],
            style: 'subheader',
            alignment: 'right',
            margin: [0, 0, 0, 10],
            color: '#fff',
          },
        ],
        margin: [0, 0, 0, 10],
      },
      { text: 'Заказ', style: 'header' },
      { text: `Имя: ${dataForPdf.name}`, style: 'subheader' },
      { text: `Email: ${dataForPdf.email}`, style: 'subheader' },
      {
        text: `Дата: ${new Date().toLocaleDateString('ru-RU')}`,
        style: 'subheader',
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            ['Вариант', 'Кол-во', 'Цена', 'Стоимость'],
            ...dataForPdf.items.flatMap((item) => [
              [
                { text: item.serviceName, colSpan: 4, style: 'tableHeader' },
                {},
                {},
                {},
              ],
              ...item.variants.map((variant) => [
                variant.name,
                variant.quantity.toString(),
                `${variant.price} ₽`,
                `${variant.total} ₽`,
              ]),
            ]),
            [
              { text: 'Итого:', colSpan: 3, alignment: 'right' },
              {},
              {},
              `${dataForPdf.totalSum} ₽`,
            ],
          ],
        },
      },
    ],
    defaultStyle: {},
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },
      subheader: {
        fontSize: 12,
        margin: [0, 5, 0, 5] as [number, number, number, number],
      },
      tableHeader: {
        bold: true,
        fillColor: '#eeeeee',
      },
    },
  };

  return new Promise<Blob>((resolve, reject) => {
    console.log('pdfMake from window:', (window as any).pdfMake);
    const pdfMake = (window as any).pdfMake;
    if (pdfMake && typeof pdfMake.createPdf === 'function') {
      pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => resolve(blob));
    } else {
      reject(new Error('pdfMake is not loaded or createPdf is not a function'));
    }
  });
};
