import type { PdfOrderData, PdfOrderItem } from './pdf-utils';

import emailjs from '@emailjs/browser';

export const emailInit = () => {
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
};

export const sendEmail = async (email: string, data: PdfOrderData) => {
  const generateHtmlTable = (data: PdfOrderData): string => {
    let tableRows = data.items
      .map(
        (item: PdfOrderItem) => `
        <tr>
          <td colspan="4" style="font-weight: bold;">${item.serviceName}</td>
        </tr>
        ${item.variants
          .map(
            (variant: {
              name: string;
              price: number;
              quantity: number;
              total: number;
            }) => `
          <tr>
            <td>${variant.name}</td>
            <td>${variant.quantity}</td>
            <td>${variant.price} ₽</td>
            <td>${variant.total} ₽</td>
          </tr>
        `
          )
          .join('')}
      `
      )
      .join('');

    return `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>Вариант</th>
            <th>Кол-во</th>
            <th>Цена</th>
            <th>Стоимость</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr>
            <td colspan="3" style="font-weight: bold;">Итого:</td>
            <td>${data.totalSum} ₽</td>
          </tr>
        </tbody>
      </table>
    `;
  };

  const htmlContent = `
    <h1>Данные заказа</h1>
    <p><strong>Имя:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
    ${generateHtmlTable(data)}
  `;

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        subject: 'Данные заказа',
        html_content: htmlContent,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
  } catch (error) {
    console.error('Ошибка при отправке email:', error);
  }
};
