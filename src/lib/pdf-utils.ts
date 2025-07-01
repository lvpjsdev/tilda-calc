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
  const docDefinition = {
    content: [
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
