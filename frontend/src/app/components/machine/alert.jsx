// src/app/components/alert.jsx

"use client";

import * as React from "react"

export function Alert({ className, variant = "default", ...props }) {
  return (
    <div
      role="alert"
      className={`rounded-lg border p-4 ${
        variant === "destructive" 
          ? "border-red-500 bg-red-50 text-red-700" 
          : "border-gray-200 bg-white"
      } ${className}`}
      {...props}
    />
  )
}

export function AlertDescription({ className, ...props }) {
  return <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props} />
}