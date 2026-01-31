"use client";

import { CardWrapper } from "./card-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/lib";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Register } from "@/actions/auth/signup";

export function RegisterForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    const toastId = toast.loading("Registering in...");

    startTransition(() => {
      Register(values)
        .then((data: { success?: string; error?: string }) => {
          if (data.error) {
            toast.error(data.error, {
              closeButton: true,
              id: toastId,
            });
          } else {
            toast.success(data.success, {
              closeButton: true,
              id: toastId,
            });
            form.reset();
          }
        })
        .catch((error) => {
          toast.error("Something went wrong!", {
            closeButton: true,
            id: toastId,
          });
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an Account"
      headerdescription="Register with your Google account"
      backButtonHref="/auth/login"
      backButtonLable="Already have an account?"
      isDisabled={isPending}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your Name"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="xyz@gmail.com"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            disabled={isPending}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter you Password"
                      {...field}
                      disabled={isPending}
                      type={isPasswordVisible ? "text" : "password"}
                    />
                    <button
                      className="absolute bottom-0 right-0 h-10 px-3 pt-1 text-center text-gray-500"
                      onClick={() => {
                        setIsPasswordVisible(!isPasswordVisible);
                      }}
                      type="button"
                    >
                      {isPasswordVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full space-y-0 py-0 mt-2"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Register with Mail
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
