import * as React from "react";

interface EmailTemplateProps {
  companyName: string;
  employeeName: string;
  email: string;
  tempPassword: string;
}

export function EmailTemplate({
  companyName,
  employeeName,
  email,
  tempPassword,
}: EmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ color: "#2563eb" }}>Witaj w {companyName}!</h2>

      <p>Cześć {employeeName},</p>

      <p>
        Zostałeś zaproszony do systemu zarządzania {companyName} jako pracownik.
      </p>

      <div
        style={{
          backgroundColor: "#f3f4f6",
          padding: "20px",
          borderRadius: "8px",
          margin: "20px 0",
        }}
      >
        <h3 style={{ marginTop: "0" }}>Twoje dane logowania:</h3>
        <p>
          <strong>Email:</strong> {email}
        </p>
        <p>
          <strong>Hasło tymczasowe:</strong> {tempPassword}
        </p>
      </div>

      <p>
        <strong>Ważne:</strong> Po pierwszym zalogowaniu zmień swoje hasło.
      </p>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <a
          href={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "12px 24px",
            textDecoration: "none",
            borderRadius: "6px",
            display: "inline-block",
          }}
        >
          Zaloguj się teraz
        </a>
      </div>

      <p>Jeśli masz pytania, skontaktuj się z administratorem systemu.</p>

      <p>
        Pozdrawiamy,
        <br />
        Zespół {companyName}
      </p>
    </div>
  );
}
