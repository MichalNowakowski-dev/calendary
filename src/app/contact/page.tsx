import ContactForm from "@/components/contact/ContactForm";
import PageHeading from "@/components/PageHeading";

const ContactPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <PageHeading
          text="Skontaktuj się z nami"
          description="Chętnie Cię wysłuchamy! Wyślij nam wiadomość, a my skontaktujemy się z Tobą tak szybko, jak to możliwe."
        />
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactPage;
