"use client";

import { CardWrapper } from "./card-wrapper";
import { Signin } from "@/actions/auth/login";
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
import { SigninSchema } from "@/lib";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const searchparams = useSearchParams();
  const callbackUrl = searchparams.get("callbackUrl");
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof SigninSchema>) => {
    const toastId = toast.loading("Logging in...");

    startTransition(async () => {
      try {
        const data = await Signin(values, callbackUrl);

        if (data?.error) {
          toast.error(data.error, { id: toastId, closeButton: true });
          return;
        }

        await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        toast.success("Logged in!", { id: toastId, closeButton: true });

        if (callbackUrl) {
          router.push(callbackUrl);
          return;
        }

        if (data?.role === "VENDOR") {
          router.push("/vendor/dashboard");
        } else {
          router.push("/customer/dashboard");
        }
      } catch (err: any) {
        toast.error(`Something went wrong: ${err?.message || ""}`, {
          id: toastId,
          closeButton: true,
        });
      }
    });
  };

  return (
    <CardWrapper
      headerLabel="Welcome back"
      headerdescription="Login with your Google account"
      backButtonHref="/auth/signup"
      backButtonLabel="Don't have an account?"
      isDisabled={isPending}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    autoComplete="email"
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
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Enter you Password"
                      {...field}
                      disabled={isPending}
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="current-password"
                    />
                  </FormControl>
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
                <FormMessage />
                <Button
                  disabled={isPending}
                  className="mt-[1px] h-0 px-0 pt-2 font-normal text-[13px] flex justify-start"
                  variant="link"
                  size={"sm"}
                  asChild
                >
                  <Link href="/auth/reset" className="text-start">
                    Forget password?
                  </Link>
                </Button>
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
            Login with Mail
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
