"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewSwitcherProps {
    currentView: "kanban" | "list";
    onViewChange: (view: "kanban" | "list") => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
    return (
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border rounded-lg p-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewChange("kanban")}
                className={cn(
                    "w-8 h-8 rounded-md transition-none",
                    currentView === "kanban"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
            >
                <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewChange("list")}
                className={cn(
                    "w-8 h-8 rounded-md transition-none",
                    currentView === "list"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
            >
                <List className="w-4 h-4" />
            </Button>
        </div>
    );
}
