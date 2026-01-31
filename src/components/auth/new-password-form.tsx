"use client";

import { CardWrapper } from "./card-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { NewPasswordSchema } from "@/lib";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { useState, useTransition } from "react";
import { newPassword } from "@/actions/auth/new-password";
import { FormError } from "./form-error";
import { FromSuccess } from "./form-success";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export const NewPasswordForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            newPassword(values, token).then((data) => {
                setError(data?.error);
                setSuccess(data?.success);
            });
        });
    };

    return (
        <CardWrapper
            headerLabel="Enter new password"
            headerdescription="Create a new secure password"
            backButtonLabel="Back to login"
            backButtonHref="/auth/login"
            isDisabled={isPending}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder="******"
                                                type={isPasswordVisible ? "text" : "password"}
                                                autoComplete="new-password"
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
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <FromSuccess message={success} />
                    <Button disabled={isPending} type="submit" className="w-full">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reset password
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
