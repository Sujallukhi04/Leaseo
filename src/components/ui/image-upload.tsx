"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash, UploadCloud, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value = [],
}) => {
    const [isUploading, setIsUploading] = useState(false);

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            onChange(data.url);
            toast.success("Image uploaded");
        } catch (error) {
            toast.error("Failed to upload image");
            console.error(error);
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div
                        key={url}
                        className="relative h-[200px] w-[200px] overflow-hidden rounded-md border"
                    >
                        <div className="absolute right-2 top-2 z-10">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6"
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image fill className="object-cover" alt="Image" src={url} />
                    </div>
                ))}
            </div>

            {/* Upload Button Area */}
            {value.length === 0 && (
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploading ? (
                                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-3" />
                            ) : (
                                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                            )}
                            <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> from your computer
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG or WEBP</p>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onUpload}
                            disabled={disabled || isUploading}
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
