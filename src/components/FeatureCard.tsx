import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

const FeatureCard = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-transparent dark:border-gray-700 border border-gray-200 rounded-lg p-6 flex flex-col">
      <CardHeader className="text-center">
        {icon}
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default FeatureCard;
