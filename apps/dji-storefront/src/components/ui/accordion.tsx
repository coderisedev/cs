"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const AccordionContext = React.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
}>({});

interface AccordionProps {
    children: React.ReactNode;
    className?: string;
    type?: "single" | "multiple";
    collapsible?: boolean;
    defaultValue?: string;
}

export function Accordion({ children, className, type = "single", collapsible, defaultValue }: AccordionProps) {
    const [value, setValue] = React.useState<string>(defaultValue || "");

    const handleValueChange = (newValue: string) => {
        if (newValue === value && collapsible) {
            setValue("");
        } else {
            setValue(newValue);
        }
    };

    return (
        <AccordionContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <div className={className}>{children}</div>
        </AccordionContext.Provider>
    );
}

export const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { value, onValueChange } = React.useContext(AccordionContext);
    // Find the parent item value
    // This is a bit hacky without a proper context for Item, but for this simple implementation we can assume
    // the trigger is used correctly inside an Item. 
    // Ideally we'd wrap Item in a context too.

    // Let's improve this: We need to know the Item's value.
    // We can't easily get it without another context.
    // So let's wrap Item in a context.
    return (
        <AccordionTriggerInternal className={className} ref={ref} {...props}>
            {children}
        </AccordionTriggerInternal>
    )
});
AccordionTrigger.displayName = "AccordionTrigger";

// Helper to access Item context
const AccordionItemContext = React.createContext<{ value: string }>({ value: "" });

const AccordionItemWrapper = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => (
    <AccordionItemContext.Provider value={{ value }}>
        <div
            ref={ref}
            className={cn("border-b border-gray-200", className)}
            {...props}
        >
            {children}
        </div>
    </AccordionItemContext.Provider>
));
AccordionItemWrapper.displayName = "AccordionItem";

// Re-export the wrapper as AccordionItem
export { AccordionItemWrapper as AccordionItem };


const AccordionTriggerInternal = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(AccordionContext);
    const { value: itemValue } = React.useContext(AccordionItemContext);
    const isOpen = selectedValue === itemValue;

    return (
        <h3 className="flex">
            <button
                ref={ref}
                onClick={() => onValueChange?.(itemValue)}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                    className
                )}
                data-state={isOpen ? "open" : "closed"}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </button>
        </h3>
    );
});

export const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { value: selectedValue } = React.useContext(AccordionContext);
    const { value: itemValue } = React.useContext(AccordionItemContext);
    const isOpen = selectedValue === itemValue;

    if (!isOpen) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
                className
            )}
            data-state={isOpen ? "open" : "closed"}
            {...props}
        >
            <div className="pb-4 pt-0">{children}</div>
        </div>
    );
});
AccordionContent.displayName = "AccordionContent";
