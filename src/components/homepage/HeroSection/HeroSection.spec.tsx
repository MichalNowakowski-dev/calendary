import { render, screen } from "@testing-library/react";
import HeroSection from "./HeroSection";

describe("HeroSection", () => {
  it("should render hero section description", () => {
    render(<HeroSection />);
    expect(
      screen.getByText(
        "Planuj rezerwacje, ulepszaj swoje usługi i promuj swoją działalność. Rezerwacje online 24/7 i przypomnienia dla klientów."
      )
    ).toBeInTheDocument();
  });

  it("renders the hero section with the correct title", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("heading", {
        name: "Bezpłatny system do rezerwacji online",
      })
    ).toBeInTheDocument();
  });

  it("should render link to register page with correct href", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("link", { name: "Rozpocznij za darmo" })
    ).toHaveAttribute("href", "/register");
  });

  it("should render button with correct text", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("button", {
        name: "Rozpocznij za darmo - Przejdź do rejestracji",
      })
    ).toHaveTextContent("Rozpocznij za darmo");
  });
  it("should render a hero image", () => {
    render(<HeroSection />);
    expect(
      screen.getByAltText(
        "Calendary.pl Dashboard Preview - Podgląd panelu zarządzania"
      )
    ).toBeInTheDocument();
  });
  it("should render a hero image with correct src", () => {
    render(<HeroSection />);
    expect(
      screen.getByAltText(
        "Calendary.pl Dashboard Preview - Podgląd panelu zarządzania"
      )
    ).toHaveAttribute("src", expect.stringContaining("hero-image.png"));
  });
});
