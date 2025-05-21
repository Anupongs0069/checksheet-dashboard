// ./src/app/components/LogCheckQuality/PrintReport/PrintReportButton.jsx

"use client";
import React from "react";
import { FileText } from "lucide-react";

const PrintReportButton = ({ onClick, generating, error }) => {
  if (error) {
    return (
      <button
        onClick={onClick}
        className="px-3 py-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Try Again
      </button>
    );
  }

  return (
    <div className="inline-block">
      {generating ? (
        <button
          disabled
          className="px-3 py-2 text-sm text-gray-400 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Generating Print Preview...
        </button>
      ) : (
        <button
          onClick={onClick}
          className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Print Report
        </button>
      )}
    </div>
  );
};

export default PrintReportButton;