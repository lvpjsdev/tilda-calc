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
    email: formData.email,
    items,
    totalSum,
  };
};
