import * as React from "react"

import { cn } from "./cn"

const TableElement = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="-mx-4 overflow-x-auto">
    <table
      ref={ref}
      className={cn("w-full min-w-full text-left text-sm", className)}
      {...props}
    />
  </div>
))

TableElement.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-surface-secondary text-xs uppercase", className)} {...props} />
))

TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("divide-y divide-border-base", className)} {...props} />
))

TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-surface-neutral-hover data-[state=selected]:bg-surface-field",
      className
    )}
    {...props}
  />
))

TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-4 py-3 text-xs font-semibold tracking-widest text-foreground-muted",
      className
    )}
    {...props}
  />
))

TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-4 py-4 text-sm text-foreground-base", className)}
    {...props}
  />
))

TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-foreground-muted", className)}
    {...props}
  />
))

TableCaption.displayName = "TableCaption"

export {
  TableElement as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
