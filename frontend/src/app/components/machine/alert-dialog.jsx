// src/app/components/alert-dialog.jsx

"use client";

import * as React from "react"

export function AlertDialog({ open, children }) {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        {children}
      </div>
    </div>
  )
}

export function AlertDialogContent({ className, ...props }) {
  return <div className={`overflow-hidden p-6 ${className}`} {...props} />
}

export function AlertDialogHeader({ className, ...props }) {
  return <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`} {...props} />
}

export function AlertDialogFooter({ className, ...props }) {
  return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props} />
}

export function AlertDialogTitle({ className, ...props }) {
  return <h2 className={`text-lg font-semibold ${className}`} {...props} />
}

export function AlertDialogAction({ className, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 ${className}`}
      {...props}
    />
  )
}