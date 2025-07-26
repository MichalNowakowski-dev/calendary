import { cn } from "@/lib/utils";

const PageHeading = ({
  text,
  description,
  className,
}: {
  text: string;
  description: string;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {text}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default PageHeading;
