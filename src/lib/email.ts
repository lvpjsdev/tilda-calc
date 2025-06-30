export const sendEmail = async (pdfBytes: BlobPart, email: string) => {
  const formData = new FormData();
  formData.append('access_key', import.meta.env.VITE_WEB3FORMS_KEY);
  formData.append('email', email);
  formData.append('subject', 'Order');
  formData.append(
    'attachment',
    new Blob([pdfBytes], { type: 'application/pdf' }),
    'document.pdf'
  );

  await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData,
  });
};
