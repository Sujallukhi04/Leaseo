"use client";

import { useSearchParams } from "next/navigation";
import { BackButton } from "./BackButton";
import {
  Card,
  CardFooter,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FormError } from "./form-error";

export const ErrorCard = () => {
  const searchParams = useSearchParams();
  const value = searchParams.get("error");
  return (
    <Card className="w-100 shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Error</CardTitle>
        <CardDescription>Oops! something went wrong!</CardDescription>
      </CardHeader>

      <CardContent>
        {value === "Configuration" && (
          <FormError message="try login without google" />
        )}
      </CardContent>
      <CardFooter>
        <BackButton lable="Back to login" href="/auth/signin" />
      </CardFooter>
    </Card>
  );
};
