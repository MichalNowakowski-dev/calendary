"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser, getUserCompanies } from "@/lib/auth/utils";
import type { Service, Company } from "@/lib/types/database";
import { showToast, showConfirmToast } from "@/lib/toast";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_minutes: 60,
    price: 0,
    active: true,
  });

  const supabase = createClient();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        // Get user's company
        const companies = await getUserCompanies(user.id);
        if (companies.length === 0) return;

        const userCompany = companies[0]?.company as unknown as Company;
        setCompany(userCompany);

        // Get services
        const { data: servicesData, error } = await supabase
          .from("services")
          .select("*")
          .eq("company_id", userCompany.id)
          .order("name", { ascending: true });

        if (error) throw error;

        setServices(servicesData || []);
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration_minutes: 60,
      price: 0,
      active: true,
    });
    setEditingService(null);
    setShowAddForm(false);
  };

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description || "",
      duration_minutes: service.duration_minutes,
      price: service.price,
      active: service.active,
    });
    setEditingService(service);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    try {
      if (editingService) {
        // Update service
        const { error } = await supabase
          .from("services")
          .update({
            name: formData.name,
            description: formData.description || null,
            duration_minutes: formData.duration_minutes,
            price: formData.price,
            active: formData.active,
          })
          .eq("id", editingService.id);

        if (error) throw error;

        // Update local state
        setServices((prev) =>
          prev.map((service) =>
            service.id === editingService.id
              ? { ...service, ...formData }
              : service
          )
        );
      } else {
        // Add new service
        const { data: newService, error } = await supabase
          .from("services")
          .insert({
            company_id: company.id,
            name: formData.name,
            description: formData.description || null,
            duration_minutes: formData.duration_minutes,
            price: formData.price,
            active: formData.active,
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setServices((prev) => [...prev, newService]);
      }

      resetForm();
      showToast.success(
        editingService
          ? "Usługa została zaktualizowana"
          : "Usługa została utworzona"
      );
    } catch (error) {
      console.error("Error saving service:", error);
      showToast.error("Błąd podczas zapisywania usługi");
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ active: !service.active })
        .eq("id", service.id);

      if (error) throw error;

      // Update local state
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, active: !s.active } : s))
      );
      showToast.success(
        `Usługa została ${service.active ? "dezaktywowana" : "aktywowana"}`
      );
    } catch (error) {
      console.error("Error toggling service status:", error);
      showToast.error("Błąd podczas zmiany statusu usługi");
    }
  };

  const deleteService = async (service: Service) => {
    showConfirmToast(
      `Czy na pewno chcesz usunąć usługę "${service.name}"?`,
      async () => {
        try {
          const { error } = await supabase
            .from("services")
            .delete()
            .eq("id", service.id);

          if (error) throw error;

          // Update local state
          setServices((prev) => prev.filter((s) => s.id !== service.id));
          showToast.success("Usługa została usunięta");
        } catch (error) {
          console.error("Error deleting service:", error);
          showToast.error("Błąd podczas usuwania usługi");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usługi</h1>
          <p className="text-gray-600 mt-1">
            Zarządzaj usługami oferowanymi przez {company?.name}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj usługę
        </Button>
      </div>

      {/* Add/Edit form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingService ? "Edytuj usługę" : "Dodaj nową usługę"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nazwa usługi *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Czas trwania (minuty) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration_minutes: parseInt(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Cena (zł) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value),
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Opis</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Opcjonalny opis usługi..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="active">Usługa aktywna</Label>
              </div>

              <div className="flex space-x-3">
                <Button type="submit">
                  {editingService ? "Zapisz zmiany" : "Dodaj usługę"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Services grid */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Brak usług
              </h3>
              <p className="text-gray-600 mb-4">
                Zacznij od dodania pierwszej usługi do swojej oferty.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj pierwszą usługę
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`${!service.active ? "opacity-75" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <button
                    onClick={() => toggleServiceStatus(service)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {service.active ? (
                      <ToggleRight className="h-6 w-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {service.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {service.duration_minutes} minut
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {service.price.toFixed(2)} zł
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(service)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edytuj
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteService(service)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
