// ./src/app/components/DailyCheck/FrequencySelector.jsx

import React from "react";
import { Calendar, Check } from "lucide-react";


const FrequencySelector = ({
    frequencies,
    onChange,
    darkMode
}) => {
    const handleChange = (frequency) => {
        const newFrequencies = {
            ...frequencies,
            [frequency]: !frequencies[frequency]
        };
        onChange(newFrequencies);
    };

    const frequencyLabels = {
        is_daily: "Daily",
        is_weekly: "Weekly",
        is_monthly: "Monthly",
        is_quarterly: "Quarterly",
        is_6_months: "Semi-annual (Every 6 months)",
        is_yearly: "Yearly"
    };

    return (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium">Inspection Frequency</h4>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Select all the frequencies you want to include in this inspection.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.keys(frequencies).map((freq) => (
                    <label
                        key={freq}
                        onClick={() => handleChange(freq)}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors
                            ${frequencies[freq]
                                ? "bg-blue-100 dark:bg-blue-800/40 border border-blue-300 dark:border-blue-700"
                                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        <div className={`w-5 h-5 flex items-center justify-center rounded border
              ${frequencies[freq]
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-400 dark:border-gray-600"
                            }`}
                        >
                            {frequencies[freq] && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span>{frequencyLabels[freq]}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default FrequencySelector;