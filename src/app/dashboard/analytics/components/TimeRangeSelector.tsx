"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeRangeSelectorProps {
  currentRange: string;
}

export default function TimeRangeSelector({
  currentRange,
}: TimeRangeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTimeRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("range", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentRange} onValueChange={handleTimeRangeChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">7 dni</SelectItem>
        <SelectItem value="30">30 dni</SelectItem>
        <SelectItem value="90">90 dni</SelectItem>
        <SelectItem value="365">1 rok</SelectItem>
      </SelectContent>
    </Select>
  );
}
