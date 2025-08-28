'use server';

export async function sendEmail(prevState: { message: string } | null, formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  // In a real application, you would send the email here.
  console.log('Sending email:');
  console.log({ name, email, message });

  return {
    message: 'Twoja wiadomość została wysłana!',
  };
}
