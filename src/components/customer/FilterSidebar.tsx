"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const FilterSidebar = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [showColors, setShowColors] = useState(false);
    const [priceRange, setPriceRange] = useState([
        Number(searchParams.get("minPrice")) || 0,
        Number(searchParams.get("maxPrice")) || 50000
    ]);

    return (
        <aside className="w-64 flex-shrink-0 border-r min-h-[calc(100vh-80px)] p-6 space-y-8 hidden lg:block">
            {/* Brand Filter */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Brand</h3>
                <div className="space-y-2">
                    {["Samsung", "Apple", "Sony", "LG", "Dell"].map((brand) => (
                        <div key={brand} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id={brand}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-black"
                            />
                            <Label htmlFor={brand} className="text-sm font-medium leading-none cursor-pointer">
                                {brand}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-4">
                <div
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setShowColors(!showColors)}
                >
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Color</h3>
                    <span className="text-sm text-muted-foreground">{showColors ? "-" : "+"}</span>
                </div>

                {showColors && (
                    <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                        {["#000000", "#FFFFFF", "#808080", "#FF0000", "#0000FF"].map((color) => (
                            <button
                                key={color}
                                className={`h-8 w-8 rounded-full border border-gray-200 focus:ring-2 ring-offset-2 ring-primary hover:scale-110 transition-transform`}
                                style={{ backgroundColor: color }}
                                aria-label={`Select color ${color}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Duration Filter */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Duration</h3>
                <div className="space-y-2">
                    {["1 Month", "3 Months", "6 Months", "1 Year+"].map((duration) => (
                        <div key={duration} className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="duration"
                                id={duration}
                                className="h-4 w-4 text-primary focus:ring-primary accent-black"
                            />
                            <Label htmlFor={duration} className="text-sm font-medium leading-none cursor-pointer">
                                {duration}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-6">
                <h3 className="font-semibold text-lg">Price</h3>

                {/* Inputs Row */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Rs</span>
                        <Input
                            type="number"
                            className="pl-9 h-9"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        />
                    </div>
                    <span className="text-muted-foreground font-medium">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Rs</span>
                        <Input
                            type="number"
                            className="pl-9 h-9"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        />
                    </div>
                </div>

                {/* Slider */}
                <Slider
                    defaultValue={[0, 50000]}
                    max={50000}
                    step={100}
                    value={priceRange}
                    onValueChange={(value) => {
                        setPriceRange(value);
                        // Debounce or just update on mouse up? Slider typically has onValueCommit.
                        // But shadcn slider might just have onValueChange.
                        // Let's use a timeout for simple debounce.
                    }}
                    onValueCommit={(value) => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("minPrice", value[0].toString());
                        params.set("maxPrice", value[1].toString());
                        router.push(`?${params.toString()}`);
                    }}
                    className="py-4"
                />
            </div>
        </aside>
    );
};
