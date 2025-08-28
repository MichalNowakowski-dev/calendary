import Header from "./Header";
import { fireEvent, render, screen } from "@testing-library/react";
import { type UserRole } from "@/lib/types/database";
import { AuthUser } from "@/lib/auth/utils";
import { navigationLinks } from "@/data/homepage";

const loggedInUser = {
  id: "1",
  email: "test@test.com",
  first_name: "Jan",
  last_name: "Kowalski",
  role: "customer" as UserRole,
};

jest.mock("@/lib/context/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/lib/context/AuthProvider";

describe("Header", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the logo name", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: loggedInUser,
      status: "authenticated",
    });
    render(<Header />);
    expect(
      screen.getByRole("heading", { name: "Calendary.pl" })
    ).toBeInTheDocument();
  });

  it("renders a logo link to home with correct aria-label", () => {
    render(<Header />);
    const homeLink = screen.getByRole("link", {
      name: /Calendary\.pl - Strona główna/i,
    });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("should show login and register buttons when user is not logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      status: "unauthenticated",
    });
    render(<Header />);

    const loginButton = screen.queryByRole("button", { name: "Zaloguj się" });
    const registerButton = screen.queryByRole("button", {
      name: "Zarejestruj się",
    });
    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
  });

  it("login and register buttons are wrapped with correct links", () => {
    render(<Header />);
    const loginButton = screen.getByRole("button", { name: "Zaloguj się" });
    const registerButton = screen.getByRole("button", {
      name: "Zarejestruj się",
    });

    const loginLink = loginButton.closest("a");
    const registerLink = registerButton.closest("a");

    expect(loginLink).toHaveAttribute("href", "/login");
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("should show only dashboard button when user is logged in", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: loggedInUser,
      status: "authenticated",
    });
    render(<Header />);

    const dashboardButton = screen.queryByRole("button", {
      name: "Panel użytkownika",
    });
    const loginButton = screen.queryByRole("button", { name: "Zaloguj się" });
    const registerButton = screen.queryByRole("button", {
      name: "Zarejestruj się",
    });

    expect(dashboardButton).toBeInTheDocument();
    expect(loginButton).not.toBeInTheDocument();
    expect(registerButton).not.toBeInTheDocument();
  });

  it("dashboard button links to role-specific dashboard for various roles", () => {
    (["customer", "employee", "company_owner", "admin"] as UserRole[]).forEach(
      (role) => {
        const userForRole: AuthUser = {
          ...loggedInUser,
          role,
        } as AuthUser;

        (useAuth as jest.Mock).mockReturnValue({
          user: userForRole,
          status: "authenticated",
        });

        render(<Header />);

        const dashboardButton = screen.getByRole("button", {
          name: "Panel użytkownika",
        });
        const dashboardLink = dashboardButton.closest("a");
        expect(dashboardLink).toHaveAttribute("href", `/${role}`);

        // cleanup between loop iterations
        document.body.innerHTML = "";
      }
    );
  });

  it("should show navigation links", () => {
    render(<Header />);
    navigationLinks.forEach((link) => {
      expect(
        screen.getByRole("button", { name: `Przejdź do sekcji ${link.label}` })
      ).toBeInTheDocument();
    });
  });

  it("clicking navigation buttons scrolls to the target section with smooth behavior", () => {
    render(<Header />);

    const targetElement = document.createElement("div");
    const scrollIntoViewMock = jest.fn();
    (targetElement as HTMLElement).scrollIntoView = scrollIntoViewMock;

    const querySelectorSpy = jest
      .spyOn(document, "querySelector")
      .mockReturnValue(targetElement);

    const firstNav = navigationLinks[0];
    const navButton = screen.getByRole("button", {
      name: `Przejdź do sekcji ${firstNav.label}`,
    });

    fireEvent.click(navButton);

    expect(querySelectorSpy).toHaveBeenCalledWith(firstNav.href);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("does not throw or call scroll when target section is missing", () => {
    render(<Header />);

    const querySelectorSpy = jest
      .spyOn(document, "querySelector")
      .mockReturnValue(null);

    const lastNav = navigationLinks[navigationLinks.length - 1];
    const navButton = screen.getByRole("button", {
      name: `Przejdź do sekcji ${lastNav.label}`,
    });

    expect(() => fireEvent.click(navButton)).not.toThrow();
    expect(querySelectorSpy).toHaveBeenCalledWith(lastNav.href);
  });

  it("renders a navigation landmark", () => {
    render(<Header />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
