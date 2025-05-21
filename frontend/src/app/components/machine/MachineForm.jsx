// src/components/machine/MachineForm.jsx

"use client";

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent } from '@/app/components/machine/card';
import { Alert, AlertDescription } from '@/app/components/machine/alert';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/machine/alert-dialog';
import Image from 'next/image';

const MachineForm = ({ darkMode }) => {
  const [machineInfo, setMachineInfo] = useState({
    machine_name: "",
    machine_full_name: "",
    machine_number: "",
    series_number: "",
    model: "",
    customer: "",
    product: "",
    image: null
  });

  const [preview, setPreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match(/image\/(jpeg|png)/i)) {
        setError('Please upload a .JPEG or .PNG file only.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setMachineInfo({ ...machineInfo, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // เพิ่มข้อมูลลง formData
      Object.keys(machineInfo).forEach(key => {
        if (key === 'image' && machineInfo[key]) {
          formData.append('image', machineInfo[key]);
        } else {
          formData.append(key, machineInfo[key]);
        }
      });

      // เรียกใช้ API
      const response = await fetch('/api/machines', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred while saving the data.');
      }

      // แสดงข้อความสำเร็จ
      setShowSuccess(true);

      // เคลียร์ฟอร์ม
      setMachineInfo({
        machine_name: "",
        machine_full_name: "",
        machine_number: "",
        series_number: "",
        model: "",
        customer: "",
        product: "",
        image: null
      });
      setPreview(null);

    } catch (err) {
      setError(err.message);
    }
  };

  const inputClass = `w-full p-2 border rounded-lg ${darkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-300 text-gray-900"
    }`;

  return (
    <>
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Machine data saved successfully.</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccess(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-sm underline">
              Close
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Card className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
        <CardContent className="p-6">
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Machine Information
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Machine Name
                </label>
                <input
                  type="text"
                  value={machineInfo.machine_name}
                  onChange={(e) => setMachineInfo({ ...machineInfo, machine_name: e.target.value })}
                  className={inputClass}
                  placeholder="Machine Name"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Machine Full Name
                </label>
                <input
                  type="text"
                  value={machineInfo.machine_full_name}
                  onChange={(e) => setMachineInfo({ ...machineInfo, machine_full_name: e.target.value })}
                  className={inputClass}
                  placeholder="Full Machine Name"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Machine Number
                </label>
                <input
                  type="text"
                  value={machineInfo.machine_number}
                  onChange={(e) => setMachineInfo({ ...machineInfo, machine_number: e.target.value })}
                  className={inputClass}
                  placeholder="Machine Number"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Series Number
                </label>
                <input
                  type="text"
                  value={machineInfo.series_number}
                  onChange={(e) => setMachineInfo({ ...machineInfo, series_number: e.target.value })}
                  className={inputClass}
                  placeholder="Serial Number"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Model
                </label>
                <input
                  type="text"
                  value={machineInfo.model}
                  onChange={(e) => setMachineInfo({ ...machineInfo, model: e.target.value })}
                  className={inputClass}
                  placeholder="Model"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Customer
                </label>
                <input
                  type="text"
                  value={machineInfo.customer}
                  onChange={(e) => setMachineInfo({ ...machineInfo, customer: e.target.value })}
                  className={inputClass}
                  placeholder="Customer"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Product
                </label>
                <input
                  type="text"
                  value={machineInfo.product}
                  onChange={(e) => setMachineInfo({ ...machineInfo, product: e.target.value })}
                  className={inputClass}
                  placeholder="Product"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Machine Image (JPEG or PNG only)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg space-y-1">
                  <div className="flex flex-col items-center">
                    {preview ? (
                      <div className="relative">
                        <Image
                          src={preview}
                          alt="Machine preview"
                          className="h-48 w-96 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreview(null);
                            setMachineInfo({ ...machineInfo, image: null });
                          }}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className={`mx-auto h-12 w-12 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                        <div className="flex text-sm">
                          <label
                            htmlFor="image-upload"
                            className={`relative cursor-pointer rounded-md font-medium ${darkMode ? "text-indigo-400" : "text-indigo-600"
                              }`}
                          >
                            <span>Upload Image</span>
                            <input
                              id="image-upload"
                              name="image-upload"
                              type="file"
                              accept="image/jpeg,image/png"
                              className="sr-only"
                              onChange={handleImageChange}
                              required
                            />
                          </label>
                        </div>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          JPEG, PNG up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                       flex items-center justify-center gap-2"
            >
              Save Machine Data
            </button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default MachineForm;