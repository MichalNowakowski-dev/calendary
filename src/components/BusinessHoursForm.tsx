"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Clock, Save, Loader2 } from "lucide-react";
import { showToast } from "@/lib/toast";
import {
  getBusinessHoursClient,
  upsertBusinessHoursClient,
} from "@/lib/actions/companies";
import {
  businessHoursFormSchema,
  type BusinessHoursFormData,
  DAYS_OF_WEEK,
} from "@/lib/validations/company";
import type { BusinessHours } from "@/lib/types/database";

interface BusinessHoursFormProps {
  companyId: string;
}

export default function BusinessHoursForm({
  companyId,
}: BusinessHoursFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<BusinessHoursFormData>({
    resolver: zodResolver(businessHoursFormSchema),
    defaultValues: {
      business_hours: DAYS_OF_WEEK.map((day) => ({
        day_of_week: day.value,
        open_time: null,
        close_time: null,
        is_open: true,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "business_hours",
  });

  useEffect(() => {
    const loadBusinessHours = async () => {
      try {
        const businessHours = await getBusinessHoursClient(companyId);
        console.log("businessHours", businessHours);

        if (businessHours && businessHours.length > 0) {
          // Map existing business hours to form
          const mappedHours = DAYS_OF_WEEK.map((day) => {
            const existing = businessHours.find(
              (bh) => bh.day_of_week === day.value
            );
            return {
              day_of_week: day.value,
              open_time: existing?.open_time || null,
              close_time: existing?.close_time || null,
              is_open: existing?.is_open ?? true,
            };
          });

          form.reset({ business_hours: mappedHours });
        }
      } catch (error) {
        console.error("Error loading business hours:", error);
        showToast.error("Błąd podczas ładowania godzin otwarcia");
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessHours();
  }, [companyId, form]);

  const handleSubmit = async (data: BusinessHoursFormData) => {
    setIsSaving(true);

    try {
      const businessHoursData = data.business_hours.map((hour) => ({
        company_id: companyId,
        day_of_week: hour.day_of_week,
        open_time: hour.is_open ? hour.open_time : null,
        close_time: hour.is_open ? hour.close_time : null,
        is_open: hour.is_open,
      }));

      await upsertBusinessHoursClient(companyId, businessHoursData);
      showToast.success("Godziny otwarcia zostały zaktualizowane pomyślnie!");
    } catch (error) {
      console.error("Business hours update error:", error);
      showToast.error(`Błąd podczas aktualizacji: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDayToggle = (index: number, checked: boolean) => {
    form.setValue(`business_hours.${index}.is_open`, checked);

    if (!checked) {
      // Clear times when closing
      form.setValue(`business_hours.${index}.open_time`, null);
      form.setValue(`business_hours.${index}.close_time`, null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Godziny otwarcia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="flex items-center gap-4">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Godziny otwarcia
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {fields.map((field, index) => {
            const day = DAYS_OF_WEEK.find((d) => d.value === field.day_of_week);
            const isOpen = form.watch(`business_hours.${index}.is_open`);

            return (
              <div
                key={field.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="w-full sm:w-24">
                  <Label className="text-sm font-medium">{day?.label}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`is_open_${index}`}
                    checked={isOpen}
                    onCheckedChange={(checked) =>
                      handleDayToggle(index, checked as boolean)
                    }
                  />
                  <Label htmlFor={`is_open_${index}`} className="text-sm">
                    Otwarte
                  </Label>
                </div>

                {isOpen && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`open_time_${index}`}
                        className="text-sm whitespace-nowrap"
                      >
                        Od:
                      </Label>
                      <Input
                        id={`open_time_${index}`}
                        type="time"
                        {...form.register(`business_hours.${index}.open_time`)}
                        className="w-full sm:w-32"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`close_time_${index}`}
                        className="text-sm whitespace-nowrap"
                      >
                        Do:
                      </Label>
                      <Input
                        id={`close_time_${index}`}
                        type="time"
                        {...form.register(`business_hours.${index}.close_time`)}
                        className="w-full sm:w-32"
                      />
                    </div>
                  </div>
                )}

                {!isOpen && (
                  <span className="text-sm text-muted-foreground">
                    Zamknięte
                  </span>
                )}
              </div>
            );
          })}
        </form>
      </CardContent>

      <div className="flex justify-end px-6 ">
        <Button
          type="submit"
          disabled={isSaving}
          onClick={form.handleSubmit(handleSubmit)}
          className="w-full sm:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Zapisz godziny otwarcia
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
