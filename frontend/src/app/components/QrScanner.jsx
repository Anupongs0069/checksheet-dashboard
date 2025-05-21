"use client";

import React, { useState, useEffect, useRef } from 'react';
import QrScannerLib from 'qr-scanner';
import { X, QrCode, FlipHorizontal } from "lucide-react";
import { useDarkMode } from "./DarkModeProvider";

const QrScanner = ({ onScanSuccess, buttonText }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState(null);
  const [qrScanner, setQrScanner] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [currentCamera, setCurrentCamera] = useState(0);
  const videoRef = useRef(null);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    const checkCameras = async () => {
      try {
        console.log('Checking available cameras...');
        const devices = await QrScannerLib.listCameras();
        console.log('Available cameras:', devices);
        setCameras(devices);

        // ค้นหากล้องหลัง
        if (devices.length > 0) {
          // วิธีที่ 1: หาจาก label ที่มีคำว่า 'back', 'rear', 'environment'
          let backCameraIndex = 0;
          for (let i = 0; i < devices.length; i++) {
            const label = devices[i].label.toLowerCase();
            if (
              label.includes('back') ||
              label.includes('rear') ||
              label.includes('environment') ||
              label.includes('หลัง')
            ) {
              backCameraIndex = i;
              console.log('Found back camera:', devices[i].label);
              break;
            }
          }

          // วิธีที่ 2: ถ้ามี 2 กล้องขึ้นไป และไม่พบจากชื่อ ให้สันนิษฐานว่ากล้องที่ 2 (index 1) เป็นกล้องหลัง
          if (backCameraIndex === 0 && devices.length > 1) {
            backCameraIndex = 1;
            console.log('Assuming camera at index 1 is back camera:', devices[backCameraIndex].label);
          }

          setCurrentCamera(backCameraIndex);
        }
      } catch (err) {
        console.error('Failed to list cameras:', err);
        setError(new Error('ไม่สามารถเข้าถึงกล้องได้'));
      }
    };

    checkCameras();

    return () => {
      if (qrScanner) {
        console.log('Cleaning up scanner...');
        qrScanner.destroy();
      }
    };
  }, []);

  const startScanner = async () => {
    if (!videoRef.current) {
      console.log('Video ref not ready');
      return;
    }

    try {
      console.log('Starting scanner with camera:', cameras[currentCamera]?.id);

      // ตั้งค่า face mode เป็น environment (กล้องหลัง)
      const scanner = new QrScannerLib(
        videoRef.current,
        (result) => {
          console.log('QR code detected:', result);
          onScanSuccess(result.data);
          console.log('Scanner cleanup after successful scan');
          scanner.destroy();
          setQrScanner(null);
          setIsCameraOpen(false);
        },
        {
          preferredCamera: cameras[currentCamera]?.id,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          // กำหนดให้ใช้กล้องหลัง
          facingMode: 'environment'
        }
      );

      try {
        await scanner.start();
        console.log('Scanner started successfully');
        setQrScanner(scanner);
        setError(null);
      } catch (startErr) {
        console.error('Error starting scanner with specified camera:', startErr);

        // ถ้าเริ่มไม่สำเร็จ ลองใช้กล้องค่าเริ่มต้น
        try {
          console.log('Trying default camera...');
          scanner.destroy();
          const defaultScanner = new QrScannerLib(
            videoRef.current,
            (result) => {
              console.log('QR code detected:', result);
              onScanSuccess(result.data);
              defaultScanner.destroy();
              setQrScanner(null);
              setIsCameraOpen(false);
            },
            {
              highlightScanRegion: true,
              highlightCodeOutline: true
            }
          );

          await defaultScanner.start();
          console.log('Default scanner started successfully');
          setQrScanner(defaultScanner);
          setError(null);
        } catch (defaultErr) {
          console.error('Error starting default scanner:', defaultErr);
          setError(new Error('ไม่สามารถเริ่มการสแกนได้ กรุณาตรวจสอบการอนุญาตกล้อง'));
          setIsCameraOpen(false);
        }
      }
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError(new Error('ไม่สามารถเริ่มการสแกนได้ กรุณาตรวจสอบการอนุญาตกล้อง'));
      setIsCameraOpen(false);
    }
  };

  const toggleCamera = async () => {
    console.log('Toggling camera, current state:', isCameraOpen);
    if (isCameraOpen) {
      if (qrScanner) {
        qrScanner.destroy();
        setQrScanner(null);
      }
      setIsCameraOpen(false);
    } else {
      setIsCameraOpen(true);
      console.log('Starting scanner after toggle...');
      setTimeout(startScanner, 0);
    }
    setError(null);
  };

  const switchCamera = async () => {
    if (!qrScanner) {
      console.log('No active scanner to switch');
      return;
    }

    const nextCamera = (currentCamera + 1) % cameras.length;
    console.log('Switching to camera:', cameras[nextCamera]?.id);
    setCurrentCamera(nextCamera);

    qrScanner.destroy();
    setQrScanner(null);

    setTimeout(() => {
      console.log('Restarting scanner with new camera...');
      startScanner();
    }, 0);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-2">
        <button
          onClick={toggleCamera}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-white ${isCameraOpen
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
            } transition-colors duration-200`}
        >
          {isCameraOpen ? (
            <>
              <X className="w-5 h-5" />
              <span>ปิดกล้อง</span>
            </>
          ) : (
            <>
              <QrCode className="w-5 h-5" />
              <span>{buttonText || "Scan QR Code"}</span>
            </>
          )}
        </button>
        {isCameraOpen && cameras.length > 1 && (
          <button
            onClick={switchCamera}
            className="flex items-center space-x-2 px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
          >
            <FlipHorizontal className="w-5 h-5" />
            <span>สลับกล้อง</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
          <p>Error: {error.message}</p>
          <p className="text-sm mt-1">
            ลองรีเฟรชหน้าเว็บหรือตรวจสอบการอนุญาตกล้อง
          </p>
        </div>
      )}

      {isCameraOpen && (
        <div className="relative w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden">
          {/* QR Scanner Overlay */}
          <div className="absolute inset-0 z-10">
            <div className="h-full w-full flex items-center justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-blue-500"></div>
                <div className="absolute top-0 left-0 w-full animate-scan">
                  <div className="h-0.5 w-full bg-blue-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Camera Indicator (helpful for debugging) */}
          {cameras.length > 0 && (
            <div className="absolute top-2 left-2 z-20 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Camera: {currentCamera + 1}/{cameras.length}
              {cameras[currentCamera] && (
                <div className="text-xs opacity-75 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {cameras[currentCamera].label}
                </div>
              )}
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default QrScanner;