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
import { VendorRegisterSchema } from "@/lib";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Eye, EyeOff, Loader2, Store } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { registerVendor } from "@/actions/auth/vendor-signup";
import { useRouter } from "next/navigation";

export function VendorRegisterForm() {
    const router = useRouter();
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
        useState<boolean>(false);
    const [isPending, startTransition] = useTransition();
    const form = useForm({
        resolver: zodResolver(VendorRegisterSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            businessName: "",
            gstNumber: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (values: z.infer<typeof VendorRegisterSchema>) => {
        const toastId = toast.loading("Registering Vendor...");

        startTransition(() => {
            registerVendor(values)
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
                        router.push("/auth/login");
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

    const categories = [
        "Electronics",
        "Furniture",
        "Clothing",
        "Books",
        "Home & Garden",
        "Automotive",
        "Other",
    ];

    return (
        <CardWrapper
            headerLabel="Join as a Vendor"
            headerdescription="Start selling your rentals with us"
            backButtonHref="/auth/signup"
            backButtonLabel="Back to User Signup"
            isDisabled={isPending}
            showSocial={false}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex space-x-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            disabled={isPending}
                            render={({ field }) => (
                                <FormItem className="w-1/2">
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} value={field.value || ""} disabled={isPending} autoComplete="given-name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            disabled={isPending}
                            render={({ field }) => (
                                <FormItem className="w-1/2">
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} value={field.value || ""} disabled={isPending} autoComplete="family-name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="businessName"
                        disabled={isPending}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Business Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Acme Inc." {...field} value={field.value || ""} disabled={isPending} autoComplete="organization" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gstNumber"
                        disabled={isPending}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GST No</FormLabel>
                                <FormControl>
                                    <Input placeholder="GST123456789012" {...field} value={field.value || ""} disabled={isPending} maxLength={15} autoComplete="off" />
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
                                <FormLabel>Email ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="vendor@example.com" {...field} value={field.value || ""} disabled={isPending} autoComplete="email" />
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
                                            placeholder="******"
                                            {...field}
                                            value={field.value || ""}
                                            disabled={isPending}
                                            type={isPasswordVisible ? "text" : "password"}
                                            autoComplete="new-password"
                                        />
                                    </FormControl>
                                    <button
                                        className="absolute bottom-0 right-0 h-10 px-3 pt-1 text-center text-gray-500"
                                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                        type="button"
                                    >
                                        {isPasswordVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        disabled={isPending}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            placeholder="******"
                                            {...field}
                                            value={field.value || ""}
                                            disabled={isPending}
                                            type={isConfirmPasswordVisible ? "text" : "password"}
                                            autoComplete="new-password"
                                        />
                                    </FormControl>
                                    <button
                                        className="absolute bottom-0 right-0 h-10 px-3 pt-1 text-center text-gray-500"
                                        onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                        type="button"
                                    >
                                        {isConfirmPasswordVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button disabled={isPending} type="submit" className="w-full bg-[#E0B0FF] hover:bg-[#D190FF] text-black font-semibold">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Store className="mr-2 h-4 w-4" />}
                        Register
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
}
