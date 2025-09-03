"use client";

import { useState, useEffect } from "react";
import { getUserCompanies } from "@/lib/auth/utils";
import { useAuth } from "@/lib/context/AuthProvider";
import type { Company } from "@/lib/types/database";
import { showToast } from "@/lib/toast";
import PageHeading from "@/components/PageHeading";
import CustomerList from "@/components/customers/CustomerList";
import CustomerSearch from "@/components/customers/CustomerSearch";
import CustomerStats from "@/components/customers/CustomerStats";
import { getCustomers, type CustomerWithStats } from "@/lib/actions/customers";
import { usePagination } from "@/lib/hooks/usePagination";

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [userCompany, setUserCompany] = useState<Company | null>(null);
  const [filteredCustomers, setFilteredCustomers] = useState<
    CustomerWithStats[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const ITEMS_PER_PAGE = 10;
  const pagination = usePagination({
    data: filteredCustomers,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    loadCustomers();
  }, [user]);

  const loadCustomers = async () => {
    try {
      if (!user) return;

      const companies = await getUserCompanies(user.id);
      if (!companies || companies?.length === 0) return;

      const userCompany = companies[0]?.company as unknown as Company;
      setUserCompany(userCompany);

      // Get customers with statistics using server action
      const customersWithStats = await getCustomers(userCompany.id);
      setCustomers(customersWithStats);
      setFilteredCustomers(customersWithStats);
    } catch (error) {
      console.error("Error loading customers:", error);
      showToast.error("Błąd podczas ładowania klientów");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterCustomers(term, sortBy, sortOrder);
    pagination.goToFirstPage();
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newOrder);
    filterCustomers(searchTerm, field, newOrder);
    pagination.goToFirstPage();
  };

  const filterCustomers = (
    search: string,
    sortField: string,
    order: "asc" | "desc"
  ) => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        (customer.phone && customer.phone.includes(search))
    );

    // Sort customers
    filtered.sort((a, b) => {
      let aValue: string | number | null = a[
        sortField as keyof CustomerWithStats
      ] as string | number | null;
      let bValue: string | number | null = b[
        sortField as keyof CustomerWithStats
      ] as string | number | null;

      if (sortField === "last_visit") {
        aValue = aValue ? new Date(aValue as string).getTime() : 0;
        bValue = bValue ? new Date(bValue as string).getTime() : 0;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (order === "asc") {
        return (aValue ?? 0) > (bValue ?? 0) ? 1 : -1;
      } else {
        return (aValue ?? 0) < (bValue ?? 0) ? 1 : -1;
      }
    });

    setFilteredCustomers(filtered);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        text="Klienci"
        description="Zarządzaj bazą klientów i historią wizyt"
      />

      {/* Customer Statistics */}
      <CustomerStats customers={customers} />

      {/* Search and Filters */}
      <CustomerSearch
        searchTerm={searchTerm}
        onSearch={handleSearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* Customer List */}
      <CustomerList
        customers={pagination.paginatedData}
        totalCustomers={pagination.totalItems}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: pagination.setCurrentPage,
          startIndex: pagination.startIndex,
          endIndex: pagination.endIndex,
        }}
        onRefresh={loadCustomers}
        isLoading={isLoading}
        companyId={userCompany?.id || ""}
      />
    </div>
  );
}
