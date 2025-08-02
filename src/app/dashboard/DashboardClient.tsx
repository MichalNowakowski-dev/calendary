"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Settings,
  Users,
  BarChart3,
  Briefcase,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react";
import { signOut } from "@/lib/auth/utils";
import type { AuthUser } from "@/lib/auth/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const getSidebarItems = (role: "owner" | "admin" | "employee") => {
  const baseItems = [
    {
      name: "Przegląd",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Kalendarz",
      href: "/dashboard/appointments",
      icon: Calendar,
    },
  ];

  if (role === "owner") {
    return [
      ...baseItems,
      {
        name: "Usługi",
        href: "/dashboard/services",
        icon: Briefcase,
      },
      {
        name: "Pracownicy",
        href: "/dashboard/employees",
        icon: Users,
      },
      {
        name: "Klienci",
        href: "/dashboard/customers",
        icon: Users,
      },
      {
        name: "Statystyki",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        name: "Ustawienia",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ];
  } else if (role === "admin") {
    return [
      ...baseItems,
      {
        name: "Pracownicy",
        href: "/dashboard/employees",
        icon: Users,
      },
      {
        name: "Klienci",
        href: "/dashboard/customers",
        icon: Users,
      },
      {
        name: "Statystyki",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
    ];
  } else {
    // Employee role - limited access
    return baseItems;
  }
};

interface DashboardClientProps {
  user: AuthUser;
  children: React.ReactNode;
  userRole?: "owner" | "admin" | "employee";
}

export default function DashboardClient({
  user,
  children,
  userRole = "owner",
}: DashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="text-xl font-bold text-blue-600 dark:text-blue-400"
            >
              Calendary.pl
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.first_name.charAt(0)}
                {user.last_name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userRole === "owner"
                    ? "Właściciel firmy"
                    : userRole === "admin"
                      ? "Administrator"
                      : "Pracownik"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {getSidebarItems(userRole).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Theme toggle and sign out buttons */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Wyloguj się
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-5">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block  ">
                {user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
