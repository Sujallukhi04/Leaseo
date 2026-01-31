"use client";

import { useState } from "react";
import { Search, Info, Upload, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
// Note: Mockup shows a Toggle for "Admin" in header, assuming it's a switch or just label.
// Mockup also shows Tabs.

export default function SettingsPage() {
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans p-8 space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div className="space-y-4 w-full md:w-auto">
                    <h1 className="text-3xl font-normal text-slate-900 dark:text-slate-200">Setting</h1>
                    <div className="flex items-center gap-2">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                            Save
                        </Button>
                        <Button variant="ghost" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-400">
                            Discard
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-end">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder=""
                            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 pl-9 text-slate-900 dark:text-slate-200 focus-visible:ring-purple-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 bg-white dark:bg-slate-900">
                        <span className="text-slate-700 dark:text-slate-200 font-medium">Admin</span>
                        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 relative overflow-hidden">
                            {/* Mock avatar */}
                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Form Section (Span 2) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Tabs / Form Section */}
                    <div className="mt-2">
                        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-8">
                            <button className="px-6 py-2 bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 border-b-2 border-sky-500 text-sm font-medium">
                                Work Information
                            </button>
                            <button className="px-6 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium">
                                Security
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {/* Left Column Fields */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 text-lg font-normal">Name</Label>
                                    <Input className="bg-transparent border-t-0 border-x-0 border-b border-slate-300 dark:border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-purple-500 text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 text-lg font-normal">Email</Label>
                                    <Input className="bg-transparent border-t-0 border-x-0 border-b border-slate-300 dark:border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-purple-500 text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 text-lg font-normal">Phone</Label>
                                    <Input className="bg-transparent border-t-0 border-x-0 border-b border-slate-300 dark:border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-purple-500 text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 text-lg font-normal">Company Name</Label>
                                    <Input className="bg-transparent border-t-0 border-x-0 border-b border-slate-300 dark:border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-purple-500 text-slate-900 dark:text-white" />
                                </div>
                            </div>

                            {/* Right Column Fields */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-700 dark:text-slate-300 text-lg font-normal">Company Logo</Label>
                                    <Button variant="outline" className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-500/50 hover:bg-purple-200 dark:hover:bg-purple-900/40">
                                        Upload
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 text-lg font-normal">GST In</Label>
                                    <Input className="bg-transparent border-t-0 border-x-0 border-b border-slate-300 dark:border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-purple-500 text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 text-lg font-normal">Address</Label>
                                    <Textarea rows={3} className="bg-transparent border-t-0 border-x-0 border-b border-slate-300 dark:border-slate-700 rounded-none px-0 focus-visible:ring-0 focus-visible:border-purple-500 text-slate-900 dark:text-white resize-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-8">
                            <Label className="text-slate-700 dark:text-slate-300 text-lg font-normal">Role:</Label>
                            <RadioGroup defaultValue="admin" className="flex items-center gap-6">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="admin" id="r1" className="text-slate-900 dark:text-white border-slate-400" />
                                    <Label htmlFor="r1" className="text-slate-700 dark:text-slate-200">Admin</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="vendor" id="r2" className="text-slate-900 dark:text-white border-slate-400" />
                                    <Label htmlFor="r2" className="text-slate-700 dark:text-slate-200">Vendor</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="customer" id="r3" className="text-slate-900 dark:text-white border-slate-400" />
                                    <Label htmlFor="r3" className="text-slate-700 dark:text-slate-200">Customer</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                </div>

                {/* Right Sidebar (Profile & Note) */}
                <div className="space-y-8">
                    {/* User Profile Card */}
                    <div className="flex justify-end">
                        <div className="w-48 h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg relative flex flex-col items-center justify-center shadow-sm">
                            <span className="text-slate-900 dark:text-slate-100 text-xl font-medium">User</span>
                            <div className="absolute bottom-2 left-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <Pencil className="w-3 h-3" />
                                </Button>
                            </div>
                            <div className="absolute bottom-2 right-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
