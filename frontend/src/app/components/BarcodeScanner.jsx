// ./src/app/components/BarcodeScanner.jsx

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Quagga from '@ericblade/quagga2';
import { FlipHorizontal, RefreshCw, Camera, Check, X } from "lucide-react";
import { useDarkMode } from "./DarkModeProvider";

// ปิด browser warnings
if (typeof window !== 'undefined') {
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  console.warn = function(...args) {
    const suppressPatterns = [
      'InputStreamBrowser',
      'createLiveStream',
      'createVideoStream',
      'initCanvas',
      'getCanvasAndContext',
      'frame_grabber',
      'willReadFrequently',
      'Invalid asm.js'
    ];
    
    const shouldSuppress = suppressPatterns.some(pattern => 
      args.some(arg => typeof arg === 'string' && arg.includes(pattern))
    );
    
    if (!shouldSuppress) {
      originalConsoleWarn.apply(console, args);
    }
  };
  
  console.error = function(...args) {
    const suppressPatterns = [
      'InputStreamBrowser',
      'createLiveStream',
      'createVideoStream',
      'initCanvas',
      'getCanvasAndContext', 
      'frame_grabber',
      'willReadFrequently',
      'Invalid asm.js'
    ];
    
    const shouldSuppress = suppressPatterns.some(pattern => 
      args.some(arg => typeof arg === 'string' && arg.includes(pattern))
    );
    
    if (!shouldSuppress) {
      originalConsoleError.apply(console, args);
    }
  };
}

const BarcodeScanner = ({ onScanSuccess, onScanFailure }) => {
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [currentCamera, setCurrentCamera] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [scannerStarting, setScannerStarting] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.4); // ค่า confidence threshold ที่ปรับได้
  const scannerRef = useRef(null);
  const { darkMode } = useDarkMode();

  // Start scanner automatically when component mounts
  useEffect(() => {
    const checkCameras = async () => {
      try {
        // Force cleanup any existing camera streams
        try {
          const videos = document.querySelectorAll('video');
          videos.forEach(video => {
            if (video.srcObject) {
              const tracks = video.srcObject.getTracks();
              tracks.forEach(track => track.stop());
              video.srcObject = null;
            }
          });
        } catch (err) {
          console.log('Error cleaning up existing videos:', err);
        }
        
        // Use navigator.mediaDevices to list cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available cameras:', videoDevices);
        
        if (videoDevices.length > 0) {
          setCameras(videoDevices);
          setCameraReady(true);
          
          let backCameraIndex = 0; // ค่าเริ่มต้นให้เป็น 0
          
          // ทางเลือกที่ 1: ค้นหาจาก label
          for (let i = 0; i < videoDevices.length; i++) {
            const label = videoDevices[i].label.toLowerCase();
            if (
              label.includes('back') || 
              label.includes('rear') || 
              label.includes('environment') ||
              label.includes('หลัง') ||
              label.includes('หน้า') === false
            ) {
              backCameraIndex = i;
              console.log('Found back camera from label:', videoDevices[i].label);
              break;
            }
          }
          
          // ทางเลือกที่ 2: เลือกจาก index (ถ้ามี 2 กล้อง มักจะเป็นกล้องที่ 2)
          if (backCameraIndex === 0 && videoDevices.length > 1) {
            backCameraIndex = 1; // อาจจะเป็นกล้องที่ 2
            console.log('Assuming second camera is back camera');
          }
          
          setCurrentCamera(backCameraIndex);
          console.log('Setting initial camera to index:', backCameraIndex);
          
          // Start the scanner after cameras are detected
          setTimeout(startScanner, 300);
        } else {
          setError(new Error('No cameras detected on this device'));
          if (onScanFailure) onScanFailure(new Error('No cameras detected'));
        }
      } catch (err) {
        console.log('Failed to list cameras:', err);
        setError(new Error('Unable to access cameras'));
        if (onScanFailure) onScanFailure(new Error('Unable to access cameras'));
      }
    };

    checkCameras();

    // Cleanup when component unmounts
    return () => {
      forceStopCamera();
    };
  }, [onScanFailure, startScanner]);

  const forceStopCamera = () => {
    console.log('🛑 Force stopping camera');
    
    // 1. Stop all tracks
    try {
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if (video && video.srcObject) {
          const tracks = video.srcObject.getTracks();
          tracks.forEach(track => {
            track.stop();
          });
          video.srcObject = null;
        }
      });
    } catch (err) {
      console.log('Error stopping video tracks:', err);
    }
    
    // 2. Remove all event handlers
    try {
      Quagga.offDetected();
      Quagga.offProcessed();
    } catch (err) {
      console.log('Error removing event handlers:', err);
    }
    
    // 3. Stop Quagga
    try {
      Quagga.stop();
    } catch (err) {
      console.log('Error stopping Quagga:', err);
    }
    
    // 4. Reset state
    setScanning(false);
  };

  const stopScanner = () => {
    if (scanning) {
      console.log('Stopping scanner...');
      forceStopCamera();
      console.log('Scanner stopped successfully');
    }
  };

  const startScanner = async () => {
    if (!scannerRef.current) {
      console.log('Scanner ref not ready');
      return;
    }

    try {
      // Stop any existing scanner
      stopScanner();
      setScannerStarting(true);
      
      // กำหนดค่า constraints สำหรับกล้อง
      const constraints = {
        video: {
          // ถ้ามีการเลือกกล้องจาก dropdown ให้ใช้กล้องนั้น
          deviceId: cameras[currentCamera]?.deviceId 
            ? { exact: cameras[currentCamera].deviceId } 
            : undefined,
          // ระบุ environment เพื่อเลือกกล้องหลัง
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      };
      
      // ถ้าเกิด error จาก facingMode, ลองใหม่โดยใช้แค่ deviceId
      try {
        await Quagga.init({
          inputStream: {
            type: "LiveStream",
            constraints: constraints,
            target: scannerRef.current,
            // พื้นที่สแกนใหญ่ขึ้น (50% ของพื้นที่ให้เป็นพื้นที่สแกน แทนที่จะเป็น 30%)
            area: { 
              top: "25%",    
              right: "5%",  
              left: "5%",   
              bottom: "25%", 
            },
          },
          locator: {
            patchSize: "large", // ขนาดแพทช์ใหญ่ขึ้นจะช่วยในการจับบาร์โค้ดที่อยู่ไกล
            halfSample: false,  // ปิด halfSample จะช่วยในการจับรายละเอียดได้ดีขึ้น
          },
          // ลดจำนวน workers ลง เพื่อลดภาระของแท็บเล็ต
          numOfWorkers: 1,
          // ปรับความถี่ในการสแกนให้บ่อยขึ้น (สแกนทุก 50ms)
          frequency: 20,
          decoder: {
            // ใช้เฉพาะ readers ที่จำเป็น เพื่อลดภาระการประมวลผล
            readers: [
              "code_128_reader", // ส่วนใหญ่ในอุตสาหกรรมใช้ Code 128
              "ean_reader",      // รหัสสินค้า
              "ean_8_reader"     // รหัสสินค้าแบบสั้น
            ],
            debug: {
              showCanvas: false,
              showPatches: false,
              showFoundPatches: false,
              showSkeleton: false,
              showLabels: false,
              showPatchLabels: false,
              showRemainingPatchLabels: false,
            }
          },
          locate: true,
        }, onQuaggaInit);
      } catch (err) {
        console.log('Error with exact facingMode, trying without exact constraint', err);
        // ถ้าเกิด error, ลองใช้แบบไม่มี exact
        const backupConstraints = {
          video: {
            deviceId: cameras[currentCamera]?.deviceId 
              ? { exact: cameras[currentCamera].deviceId } 
              : undefined,
            facingMode: "environment", // ไม่ใช้ exact
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        };
        
        await Quagga.init({
          inputStream: {
            type: "LiveStream",
            constraints: backupConstraints,
            target: scannerRef.current,
            area: {
              top: "25%",    
              right: "5%",  
              left: "5%",   
              bottom: "25%", 
            },
          },
          locator: {
            patchSize: "large",
            halfSample: false,
          },
          numOfWorkers: 1,
          frequency: 20,
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader"
            ],
            debug: {
              showCanvas: false,
              showPatches: false,
              showFoundPatches: false,
              showSkeleton: false,
              showLabels: false,
              showPatchLabels: false,
              showRemainingPatchLabels: false,
            }
          },
          locate: true,
        }, onQuaggaInit);
      }
    } catch (err) {
      console.log('Scanner initialization error:', err);
      setError(new Error('Unable to start scanning. Check camera permissions.'));
      if (onScanFailure) onScanFailure(err);
      setScannerStarting(false);
    }
  };
  
  // Callback for Quagga initialization
  const onQuaggaInit = function(err) {
    if (err) {
      console.log('Quagga initialization error:', err);
      setError(new Error('Unable to start scanning. Check camera permissions.'));
      if (onScanFailure) onScanFailure(err);
      setScannerStarting(false);
      return;
    }
    
    console.log('Quagga initialized, starting...');
    Quagga.start();
    setScanning(true);
    setScannerStarting(false);
    setError(null);
    
    // Set up barcode detection handler
    Quagga.onDetected(handleBarcodeDetected);
  };

  // Separate handler function for barcode detection 
  const handleBarcodeDetected = (result) => {
    if (result && result.codeResult) {
      const code = result.codeResult.code;
      const format = result.codeResult.format;
      const error = result.codeResult.startInfo.error;
      
      console.log(`Barcode detected: ${code} (${format}) with error: ${error}`);
      
      // Filter results by quality/confidence to reduce false positives
      // ค่า error ต่ำ = ความแม่นยำสูง, ลดเกณฑ์จาก 0.25 เป็น 0.4
      if (error < confidenceThreshold) {
        console.log("Barcode validated:", code);
        
        // Update state before stopping scanner
        setLastResult({ code, format, timestamp: new Date() });
        setScanHistory(prev => {
          const newHistory = [...prev, { code, format, timestamp: new Date() }];
          return newHistory.slice(-5);
        });
        
        // Visual feedback animation
        showSuccessAnimation();
        
        // CRITICAL: First immediately remove event handlers
        try {
          Quagga.offDetected(handleBarcodeDetected);
          Quagga.offProcessed();
        } catch (e) {
          console.log('Error removing event handlers:', e);
        }
        
        // Then stop the scanner before calling success callback
        forceStopCamera();
        
        // Short delay before calling success callback
        setTimeout(() => {
          if (onScanSuccess) {
            onScanSuccess(code);
          }
        }, 100);
      } else {
        console.log("Low confidence scan, ignoring:", error);
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    
    const nextCamera = (currentCamera + 1) % cameras.length;
    console.log('Switching to camera:', cameras[nextCamera]?.deviceId);
    setCurrentCamera(nextCamera);

    stopScanner();
    
    // Add a small delay to ensure the camera has time to switch
    setTimeout(startScanner, 300);
  };

  // เพิ่มฟังก์ชันปรับความไวในการสแกน
  const adjustSensitivity = (direction) => {
    if (direction === 'more') {
      // เพิ่มความไว (ยอมรับค่า error สูงขึ้น)
      setConfidenceThreshold(prev => Math.min(prev + 0.1, 0.8));
    } else {
      // ลดความไว (ต้องการความแม่นยำสูงขึ้น)
      setConfidenceThreshold(prev => Math.max(prev - 0.1, 0.1));
    }
    console.log(`Adjusted confidence threshold to: ${confidenceThreshold}`);
  };
  
  // Visual feedback animation
  const showSuccessAnimation = () => {
    try {
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-green-500 bg-opacity-30 z-30 flex items-center justify-center';
      
      const icon = document.createElement('div');
      icon.className = 'text-white text-4xl animate-bounce';
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      
      overlay.appendChild(icon);
      
      if (scannerRef.current) {
        scannerRef.current.appendChild(overlay);
        
        setTimeout(() => {
          if (scannerRef.current && scannerRef.current.contains(overlay)) {
            scannerRef.current.removeChild(overlay);
          }
        }, 1500);
      }
    } catch (error) {
      console.log('Animation error (non-critical):', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
      <div className={`relative w-full rounded-lg overflow-hidden shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Camera className="inline-block mr-2" size={20} /> Barcode Scanner
          </h3>
          
          <div className="flex space-x-2">
            {cameras.length > 1 && (
              <button
                onClick={switchCamera}
                disabled={scannerStarting}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} 
                  transition-colors flex items-center justify-center ${scannerStarting ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Switch Camera"
              >
                <FlipHorizontal className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
              </button>
            )}
            
            <button
              onClick={scanning ? stopScanner : startScanner}
              disabled={scannerStarting || !cameraReady}
              className={`p-2 rounded-full ${scanning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} 
                text-white transition-colors flex items-center justify-center ${(scannerStarting || !cameraReady) ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={scanning ? "Stop Scanning" : "Restart Scanning"}
            >
              {scannerStarting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : scanning ? (
                <X className="w-5 h-5" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      
        {/* Error Message */}
        {error && (
          <div className="p-3 mb-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md">
            <p className="flex items-center">
              <X className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>Error: {error.message}</span>
            </p>
            <p className="text-sm mt-1 ml-7">
              Try refreshing the page or check camera permissions
            </p>
          </div>
        )}

        {/* Scanner Sensitivity Controls */}
        <div className="mb-3 flex items-center justify-between">
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Scan Sensitivity: {Math.round(confidenceThreshold * 100)}%
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={() => adjustSensitivity('less')}
              className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              title="Make scanner more accurate (may be harder to scan)"
            >
              Less
            </button>
            <button 
              onClick={() => adjustSensitivity('more')}
              className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              title="Make scanner more sensitive (easier to scan but may have errors)"
            >
              More
            </button>
          </div>
        </div>

        {/* Scanner */}
        <div 
          ref={scannerRef}
          className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-inner"
        >
          {/* Scanner Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="h-full w-full flex items-center justify-center">
              {/* Scanner Target Frame - ขยายกรอบให้ใหญ่ขึ้น */}
              <div className="relative w-[80%] h-20">
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-blue-500"></div>
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 w-full animate-[scanLine_2s_ease-in-out_infinite]">
                    <div className="h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-sm"></div>
                    <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Darkened Areas Outside Scan Region - ลดความเข้มลง */}
            <div className="absolute inset-0" style={{ 
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 70%)' 
            }}></div>
          </div>
          
          {/* Scanner Loading State */}
          {scannerStarting && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-500 border-r-blue-700 animate-spin"></div>
                <p className="text-white mt-3 text-sm">Activating camera...</p>
              </div>
            </div>
          )}
          
          {/* Camera Not Available State */}
          {!cameraReady && !scannerStarting && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20">
              <div className="flex flex-col items-center text-center p-4">
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-white text-lg">No Camera Found</p>
                <p className="text-gray-300 text-sm mt-1">Please check that your device has a camera and allows access</p>
              </div>
            </div>
          )}
          
          {/* Current Camera Info (helpful for debugging) */}
          {scanning && cameras.length > 0 && (
            <div className="absolute top-2 left-2 z-20 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Camera: {currentCamera + 1}/{cameras.length}
            </div>
          )}
          
          {/* Instruction Text */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2 px-4 mx-4 rounded-full backdrop-blur-sm">
            Position barcode in the center frame
          </div>
        </div>
        
        {/* Last Scan Result */}
        {lastResult && (
          <div className={`mt-3 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Check className="inline-block mr-1 text-green-500" size={16} /> Barcode: {lastResult.code}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Format: {lastResult.format} • {new Date(lastResult.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button 
                onClick={startScanner}
                className={`text-sm px-3 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                Scan Again
              </button>
            </div>
          </div>
        )}
        
        {/* Scan History */}
        {scanHistory.length > 1 && (
          <div className={`mt-3 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Scan History</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {scanHistory.slice().reverse().map((scan, index) => (
                <div key={index} className={`text-xs py-1 border-b ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'} last:border-0`}>
                  <div className="flex justify-between">
                    <span>{scan.code}</span>
                    <span>{new Date(scan.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Custom Styles for Animations */}
      <style jsx global>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;