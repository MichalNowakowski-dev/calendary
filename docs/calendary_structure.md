# Calendary.pl – Struktura aplikacji

## ✅ Nazwa: Calendary.pl

System rezerwacji usług dla różnych branż (warsztaty, fryzjerzy, masażyści, spa itd.)

---

## ⚙️ Stack technologiczny

- **Frontend:** Next.js
- **Styling:** Tailwind CSS
- **Baza/Auth:** Supabase (PostgreSQL, Auth, RLS, Storage)

---

## 🎯 Główne role w systemie

- `admin` – zarządzanie systemem (Ty jako właściciel)
- `company_owner` – właściciel firmy
- `employee` – pracownik (z kontem lub tylko widoczny)
- `customer` – klient (może mieć konto lub być gościem)

---

## 📦 Główne tabele (modele Supabase / PostgreSQL)

### `companies`

- `id` (UUID)
- `name`
- `slug`
- `description`
- `address`
- `phone`
- `industry`
- `created_at`

---

### `users`

- Supabase `auth.users` (wbudowane)
- UUID = `user_id` w innych tabelach

---

### `company_users`

Łączenie użytkowników z firmami i przypisanie roli

- `id`
- `company_id`
- `user_id`
- `role` (`owner`, `employee`, `admin`)
- `status` (`active`, `invited`, `suspended`)

---

### `services`

- `id`
- `company_id`
- `name`
- `description`
- `duration_minutes`
- `price`
- `active` (bool)

---

### `employees`

- `id`
- `company_id`
- `user_id` (opcjonalnie)
- `name`
- `visible` (czy widoczny publicznie)

---

### `employee_services`

- `employee_id`
- `service_id`

---

### `schedules`

- `id`
- `employee_id`
- `weekday` (0–6)
- `start_time` (`08:00`)
- `end_time` (`16:00`)

---

### `appointments`

- `id`
- `company_id`
- `employee_id` (opcjonalnie)
- `service_id`
- `customer_name`
- `customer_email`
- `customer_phone`
- `date`
- `start_time`
- `end_time`
- `status` (`booked`, `cancelled`, `completed`)
- `created_at`

---

## 🧾 Dodatkowe tabele (opcjonalne)

### `customers`

- `id`
- `name`
- `email`
- `phone`

---

### `settings` (per firma)

- `company_id`
- `booking_buffer`
- `max_bookings_per_day`
- `enable_notifications`
- `auto_assign_employee`

---

## 📌 Uwagi

- Struktura może ulec zmianie w trakcie rozwoju projektu.
- RLS (Row Level Security) oraz relacje zostaną skonfigurowane w kolejnych krokach.
