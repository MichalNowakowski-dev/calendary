# ✅ To-Do Lista — Calendary.pl

## 🔐 Autoryzacja i użytkownicy

- [x] Strona rejestracji (`/register`)
- [x] Strona logowania (`/login`)
- [x] Strona główna (`/`)
- [x] Dashboard (`/dashboard`)
- [x] Obsługa Supabase Auth (register/login/logout)
- [x] Obsługa sesji (SSR + Client)
- [x] Middleware do ochrony stron

## 🏢 Firma (Company)

- [x] Formularz tworzenia firmy (nazwa, branża, opis, adres, slug)
- [x] Możliwość edytowania danych firmy
- [x] Powiązanie użytkownika z firmą jako "owner"
- [x] Dashboard z widokiem statystyk i danych firmy
- [x] Możliwość ustawienia godzin otwarcia firmy

## 👥 Pracownicy (Employees)

- [x] Formularz dodawania pracownika
- [x] Lista pracowników w firmie
- [x] Możliwość przypisywania usług do pracownika
- [x] Edytowalny grafik pracy (tygodniowy)

## 🛠️ Usługi (Services)

- [x] Formularz dodawania usługi (nazwa, czas, cena, opis)
- [x] Lista usług w firmie
- [x] Przypisywanie pracowników do usługi

## 🌐 Publiczny widok firmy

- [x] Strona `calendary.pl/business/[slug]`
- [x] Wyświetlanie danych firmy (opis, lokalizacja)
- [x] Lista usług do rezerwacji
- [x] Wybór terminu i pracownika (opcjonalnie)

## 📅 Rezerwacje (Appointments)

- [x] Formularz rezerwacji na stronie publicznej
- [x] Walidacja dostępności pracownika i usługi
- [x] Tworzenie klienta przy pierwszej rezerwacji
- [x] Widok nadchodzących rezerwacji (dashboard)
- [x] Historia rezerwacji
- [x] Możliwość odwołania rezerwacji

## 👤 Klienci (Customers)

- [x] Automatyczne tworzenie klienta przy rezerwacji
- [x] Lista klientów w firmie
- [x] Dane kontaktowe klienta (imię, email, tel)
- [ ] Historia wizyt klienta

## ⚙️ Ustawienia firmy

- [x] Ustawianie godzin otwarcia
- [ ] Przerwy / dni wolne / urlopy
- [ ] Limity dzienne dla pracownika
- [ ] Limity czasu między rezerwacjami

## 🧪 Bezpieczeństwo i dostęp (RLS)

- [ ] Włączenie RLS w Supabase
- [ ] Policies: tylko właściciel/admin może edytować firmę
- [ ] Policies: pracownicy widzą tylko swoje rezerwacje
- [ ] Policies: klient widzi tylko swoje dane
- [ ] Policies: usługi i pracownicy dostępni tylko dla swojej firmy

## 🧪 Dodatkowe funkcje (MVP+)

- [ ] Integracja z Google Calendar
- [ ] Powiadomienia e-mail
- [ ] Powiadomienia SMS
- [ ] Subskrypcje SaaS (Stripe)
- [ ] Panel klienta (historia rezerwacji)

---

**Postęp:** Ukończone podstawowe funkcje: auth, dashboard, zarządzanie firmą, pracownicy z grafikami i kompletny system rezerwacji. Teraz pora na zarządzanie klientami.
