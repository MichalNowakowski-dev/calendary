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

- [ ] Formularz tworzenia firmy (nazwa, branża, opis, adres, slug)
- [ ] Możliwość edytowania danych firmy
- [ ] Powiązanie użytkownika z firmą jako "owner"
- [ ] Dashboard z widokiem statystyk i danych firmy

## 👥 Pracownicy (Employees)

- [ ] Formularz dodawania pracownika
- [ ] Lista pracowników w firmie
- [ ] Możliwość przypisywania usług do pracownika
- [ ] Edytowalny grafik pracy (tygodniowy)

## 🛠️ Usługi (Services)

- [ ] Formularz dodawania usługi (nazwa, czas, cena, opis)
- [ ] Lista usług w firmie
- [ ] Przypisywanie pracowników do usługi
- [ ] Widok dostępnych usług na stronie publicznej

## 📅 Rezerwacje (Appointments)

- [ ] Formularz rezerwacji na stronie publicznej
- [ ] Walidacja dostępności pracownika i usługi
- [ ] Tworzenie klienta przy pierwszej rezerwacji
- [ ] Widok nadchodzących rezerwacji (dashboard)
- [ ] Historia rezerwacji
- [ ] Możliwość odwołania rezerwacji

## 👤 Klienci (Customers)

- [ ] Automatyczne tworzenie klienta przy rezerwacji
- [ ] Lista klientów w firmie
- [ ] Dane kontaktowe klienta (imię, email, tel)
- [ ] Historia wizyt klienta

## 🌐 Publiczny widok firmy

- [ ] Strona `calendary.pl/firma/[slug]`
- [ ] Wyświetlanie danych firmy (opis, lokalizacja)
- [ ] Lista usług do rezerwacji
- [ ] Wybór terminu i pracownika (opcjonalnie)

## ⚙️ Ustawienia firmy

- [ ] Ustawianie godzin otwarcia
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

**Postęp:** Ukończone podstawowe strony auth i dashboard. Teraz pora na logikę kont użytkowników i firmę.
