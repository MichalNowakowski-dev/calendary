"use client";

import { useRouter } from "next/navigation";

export const CustomerRefreshButton = () => {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <button
      onClick={handleRefresh}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Odśwież
    </button>
  );
};
