"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils"; // optional utility for classNames

// --- Dialog wrapper ---
export const Dialog = RadixDialog.Root;

// --- DialogTrigger with asChild support ---
interface DialogTriggerProps extends React.ComponentPropsWithoutRef<typeof Slot> {
  children: React.ReactNode;
  asChild?: boolean;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild = false, ...props }) => {
  const Comp = asChild ? Slot : "button";
  return <RadixDialog.Trigger asChild={asChild} {...props}>{children}</RadixDialog.Trigger>;
};

// --- DialogPortal ---
export const DialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RadixDialog.Portal>{children}</RadixDialog.Portal>
);

// --- DialogOverlay ---
export const DialogOverlay: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <RadixDialog.Overlay
    className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
      className
    )}
    {...props}
  />
);

// --- DialogContent ---
interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className, ...props }) => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      className={cn(
        "fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </RadixDialog.Content>
  </DialogPortal>
);

// --- DialogHeader ---
export const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("mb-4 flex flex-col space-y-1", className)}>{children}</div>
);

// --- DialogFooter ---
export const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("mt-6 flex justify-end space-x-2", className)}>{children}</div>
);

// --- DialogTitle ---
export const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <RadixDialog.Title className={cn("text-lg font-semibold", className)}>{children}</RadixDialog.Title>
);

// --- DialogDescription ---
export const DialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <RadixDialog.Description className={cn("text-sm text-muted-foreground", className)}>{children}</RadixDialog.Description>
);