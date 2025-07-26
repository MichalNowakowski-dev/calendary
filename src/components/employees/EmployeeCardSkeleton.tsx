import { Card, CardContent } from "@/components/ui/card";

export default function EmployeeCardSkeleton() {
  return (
    <Card className="relative">
      <CardContent className="p-6">
        {/* Employee header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            </div>
          </div>
          <div className="flex space-x-1">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Employee details skeleton */}
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="h-4 w-4 mr-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1 animate-pulse"></div>
              <div className="flex flex-wrap gap-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="h-4 w-4 mr-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex space-x-2 mt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}
