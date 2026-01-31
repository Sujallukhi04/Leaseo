"use client";

import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { createProduct, updateProduct, deleteProduct } from "@/actions/vendor/product-actions";
import { ProductSchema } from "@/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import ImageUpload from "@/components/ui/image-upload";
import { Category, Product, ProductImage } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertModal } from "../ui/alert-modal";

interface ProductFormProps {
  categories: Category[];
  initialData?: any;
}

type ProductFormValues = z.infer<typeof ProductSchema>;

export const ProductForm = ({ categories, initialData }: ProductFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  const title = initialData ? "Edit Product" : "Create Product";
  const description = initialData ? "Edit a product" : "Add a new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema) as any,
    defaultValues: (initialData
      ? {
        ...initialData,
        description: initialData.description || "",
        basePrice: parseFloat(String(initialData.basePrice || 0)),
        costPrice: parseFloat(String(initialData.costPrice || 0)),
        securityDeposit: parseFloat(String(initialData.securityDeposit || 0)),
        minRentalPeriod: initialData.minRentalPeriod || 1,
        images: initialData.images.map((img: { url: string }) => img.url),
      }
      : {
        name: "",
        description: "",
        basePrice: 0,
        costPrice: 0,
        quantity: 1,
        minRentalPeriod: 1,
        securityDeposit: 0,
        categoryId: "",
        images: [],
        isPublished: false,
      }) as ProductFormValues,
  });

  const onSubmit = (values: ProductFormValues) => {
    startTransition(async () => {
      let result;
      if (initialData) {
        result = await updateProduct(params.productId as string, values);
      } else {
        result = await createProduct(values);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(toastMessage);
        router.push("/vendor/products");
        router.refresh();
      }
    });
  };

  const onDelete = async () => {
    startTransition(async () => {
      try {
        const result = await deleteProduct(params.productId as string);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Product deleted.");
          router.push("/vendor/products");
          router.refresh();
        }
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
        setOpen(false);
      }
    })
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isPending}
      />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {initialData && (
          <Button
            disabled={isPending}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="h-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Images</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            disabled={isPending}
                            onChange={(url) => field.onChange([...field.value, url])}
                            onRemove={(url) =>
                              field.onChange([
                                ...field.value.filter((current) => current !== url),
                              ])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Professional DSLR Camera"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product..."
                        className="resize-none"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Category</FormLabel>
                      <Select
                        disabled={isPending}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Rental Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={isPending}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="securityDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Deposit (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={isPending}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Value / Cost Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={isPending}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Internal use only.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={isPending}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="minRentalPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Rental Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled={isPending}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publish Status</FormLabel>
                      <FormDescription>
                        This product will be visible to customers.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
