# Calendary.pl – Struktura bazy danych

## 🎯 Główne role w systemie

- `owner` – właściciel firmy
- `admin` – zarządzanie systemem
- `employee` – pracownik (z kontem lub tylko widoczny)
- `customer` – klient (może mieć konto lub być gościem)

---

## 📦 Główne tabele (modele Supabase / PostgreSQL)

### Supabase Auth / Users

- Supabase `auth.users` (wbudowane)
- UUID = `user_id` w innych tabelach

---

### `companies`

- `id` (UUID)
- `name`
- `slug`
- `description`
- `address_street`
- `address_city`
- `phone`
- `industry`
- `created_at`

---

### `company_users`

Łączenie użytkowników z firmami i przypisanie roli

- `id`
- `company_id`
- `user_id`
- `role` (`company_owner`, `employee`, `admin`)
- `status` (`active`, `invited`, `suspended`)
- `created_at`

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
- `phone_number`
- `email`

---

### `employee_services`

- `employee_id`
- `service_id`

---

### `schedules`

- `id`
- `employee_id`
- `start_date`
- `end_date`
- `start_time` (`08:00`)
- `end_time` (`16:00`)
- `created_at`
- `updated_at`

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
- `payments_status` (`pending`, `paid`, `refunded`, `cancelled`)
- `payments_method` (`on_site`, `online`, `deposit`)
- `created_at`
- `notes`
- `customer_id`

---

## 🧾 Dodatkowe tabele (opcjonalne)

### `customers`

- `id`
- `name`
- `email`
- `phone`
- `created_at`
- `company_id`

---

### `settings` (per firma)

- `id`
- `company_id`
- `booking_buffer`
- `max_bookings_per_day`
- `enable_notifications`
- `auto_assign_employee`

---

## 📌 Uwagi

- Struktura może ulec zmianie w trakcie rozwoju projektu.
- RLS (Row Level Security) oraz relacje zostaną skonfigurowane w kolejnych krokach.
