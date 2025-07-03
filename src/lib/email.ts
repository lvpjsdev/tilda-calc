import type { PdfOrderData, PdfOrderItem } from './pdf-utils';
import emailjs from '@emailjs/browser';

export const emailInit = () => {
  emailjs.init({
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  });
};

// Отправка клиентской заявки (без PDF)
export const sendClientOrderEmail = async (data: {
  customerName: string;
  email: string;
  telegram: string;
  phone: string;
  customField: string | number;
  products: any[];
}) => {
  emailInit();
  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_CLIENT_TEMPLATE_ID,
    {
      customer_name: data.customerName,
      email: data.email,
      telegram: data.telegram,
      phone: data.phone,
      custom_field: data.customField,
      products: JSON.stringify(data.products, null, 2),
    }
  );
};

// Send email with order data (for owner)
export const sendEmail = async (email: string, data: PdfOrderData) => {
  emailInit();
  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      to_email: email,
      order_data: JSON.stringify(data, null, 2),
    }
  );
};
