# 📘 Specyfikacja aplikacji Calendary.pl

## 🧩 Cel aplikacji

Calendary.pl to nowoczesna, uniwersalna aplikacja webowa typu SaaS (Software as a Service) służąca do zarządzania rezerwacjami usług w małych i średnich firmach usługowych, takich jak:

- salony fryzjerskie,
- salony kosmetyczne i SPA,
- masażyści,
- warsztaty samochodowe,
- doradcy i konsultanci,
- inne firmy usługowe.

System ma umożliwiać właścicielowi firmy kompleksowe zarządzanie kalendarzem, pracownikami, usługami i klientami, z możliwością prowadzenia rezerwacji online przez klientów końcowych.

---

## 🧱 Stack technologiczny

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth)
- **Hosting**: Vercel / Supabase
- **Inne**: Zod, React Hook Form, Zustand / Context API

---

## 📦 Główne funkcjonalności aplikacji

### 1. Rejestracja i logowanie użytkownika(właściciela biznesu)

- Rejestracja i logowanie za pomocą e-mail i hasła.
- Użytkownicy są przechowywani w systemie Supabase Auth.
- Po rejestracji użytkownik może stworzyć firmę.

### 2. Zarządzanie firmą (owner/admin)

- Tworzenie firmy (nazwa, branża, adres, opis, slug URL).
- Możliwość edytowania danych firmy.
- Dashboard firmy pokazujący statystyki, nadchodzące rezerwacje itp.

### 3. Role użytkowników

- **Owner** – właściciel firmy, pełne prawa.
- **Admin** – pomocnik właściciela (np. manager).
- **Employee** – pracownik wykonujący usługi.
- **Client** – klient rezerwujący wizytę.

### 4. Zarządzanie pracownikami

- Tworzenie kont pracowników w firmie.
- Przypisanie usług, które wykonuje dany pracownik.
- Grafik pracy – edytowalny tygodniowy plan dostępności.

### 5. Zarządzanie usługami

- Dodawanie i edytowanie usług:
  - nazwa,
  - opis,
  - czas trwania,
  - cena,
  - dostępność,
  - przypisani pracownicy.

### 6. Rezerwacje

- Klienci mogą zarezerwować usługę przez publiczny widok firmy.
- Wybór:
  - usługi,
  - daty i godziny,
  - podanie danych kontaktowych.
- Firma widzi nadchodzące i przeszłe rezerwacje.
- Przypomnienia email(sms – w przyszłości).

### 7. Widok publiczny firmy

- Strona z danymi firmy (slug), `/business/[slug]`
- Opis, usługi, pracownicy, możliwość rezerwacji

### 8. Klienci (Customers)

- Tworzenie automatycznie przy rezerwacji
- Lista klientów dla firmy (imię, nazwisko, email, telefon)
- Historia wizyt

### 9. Ustawienia firmy

- Godziny otwarcia
- Limity rezerwacji
- Przerwy, dni wolne, urlopy

### 10. System autoryzacji

- Oparty na Supabase Auth i RLS
- Każda tabela posiada kontrolę dostępu na poziomie wiersza
- Middleware zabezpieczające strony frontendowe

---

## 🔜 Funkcje planowane (MVP+)

- Integracja z kalendarzem Google
- Płatności online (np. Stripe)
- Powiadomienia e-mail / SMS
- Powiadomienia push
- Panel klienta (historia rezerwacji)
- Subskrypcje SaaS i płatne plany

---

## 📁 Struktura bazowa bazy danych (Supabase)

- users (Supabase Auth)
- companies
- company_users
- services
- employees
- employee_services (relacja M:N)
- schedules (grafik pracy)
- appointments
- customers
- settings
