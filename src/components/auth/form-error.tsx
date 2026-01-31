import { TriangleAlert } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (message == "") return <></>;

  return (
    <div className="bg-destructive/15 p-3 rounded-md items-center flex gap-x-2 text-sm text-destructive">
      <TriangleAlert className="h-6 w-6" />
      <p>{message}</p>
    </div>
  );
};
