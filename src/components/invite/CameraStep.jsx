import React, { useState, useRef, useEffect } from "react";
import { Camera } from "lucide-react";

const CameraStep = ({ onPhotoCapture, onSkip, isLoggedIn = false, existingImage = null }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("user");
  const [cameraStream, setCameraStream] = useState(null);
  const [error, setError] = useState("");

  // Start camera with proper initialization
  const startCamera = async (facingMode = cameraFacing) => {
    // Check if component is still mounted
    if (!isMountedRef.current) {
      console.log("Component unmounted, cancelling camera start");
      return;
    }

    // Simple check - if video element isn't ready, show error immediately
    if (!videoRef.current) {
      console.error("Video element not available");
      setError("Camera initialization failed - please try again");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Starting camera with facingMode:", facingMode);
      
      // Stop existing stream if any
      if (cameraStream) {
        console.log("Stopping existing camera stream");
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      console.log("Camera stream obtained:", !!stream);

      // Double check video element is still available
      if (!videoRef.current) {
        console.error("Video element became null after getting stream");
        setError("Video element not available");
        setIsLoading(false);
        return;
      }

      videoRef.current.srcObject = stream;
      
      // Wait for video metadata to load before setting states
      const handleLoadedMetadata = () => {
        console.log("Video metadata loaded, camera ready");
        setCameraStream(stream);
        setIsCameraActive(true);
        setIsLoading(false);
        
        // Remove event listener after use
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };

      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      // Handle video errors
      videoRef.current.onerror = (e) => {
        console.error("Video element error:", e);
        setError("Video playback error");
        setIsCameraActive(false);
        setIsLoading(false);
      };

      // Fallback timeout in case metadata doesn't load
      setTimeout(() => {
        if (!isCameraActive && stream && videoRef.current) {
          console.log("Fallback: Setting camera active after timeout");
          setCameraStream(stream);
          setIsCameraActive(true);
          setIsLoading(false);
        }
      }, 2000);
 
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please allow camera permissions and try again.");
      setIsCameraActive(false);
      setIsLoading(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    console.log("Stopping camera...");
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Switch camera (front/back)
  const switchCamera = async () => {
    if (!isMountedRef.current || !videoRef.current) {
      console.log("Cannot switch camera - component not ready");
      return;
    }
    
    const newFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(newFacing);
    if (isCameraActive) {
      await startCamera(newFacing);
    }
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraActive && isMountedRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob && isMountedRef.current) {
            // Convert blob to File object with proper filename
            const timestamp = Date.now();
            const filename = `visitor_photo_${timestamp}.jpg`;
            const imageFile = new File([blob], filename, { 
              type: 'image/jpeg',
              lastModified: timestamp 
            });
            
            const previewUrl = URL.createObjectURL(blob);
            stopCamera();
            onPhotoCapture(imageFile, previewUrl);
          } else {
            console.error("Failed to create blob or component unmounted");
            setError("Failed to capture photo. Please try again.");
          }
        },
        "image/jpeg",
        0.8
      );
    } else {
      console.log("Cannot capture photo - camera not ready");
      setError("Camera not ready. Please try again.");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      console.log("CameraStep unmounting, cleaning up...");
      isMountedRef.current = false;
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      stopCamera();
    };
  }, []);

  const handleStartCamera = () => {
    setError(""); // Clear any previous errors
    
    // Double-check with a small delay to ensure component is fully rendered
    setTimeout(() => {
      if (!isMountedRef.current) {
        console.log("Component unmounted before camera start");
        return;
      }
      
      if (videoRef.current) {
        console.log("Video element found, starting camera");
        startCamera();
      } else {
        console.log("Video element still not available, component may be re-rendering");
        setError("Camera not ready. Please try again in a moment.");
      }
    }, 50); // Small delay to ensure rendering is complete
  };

  // If admin and visitor already has image, show it
  if (isLoggedIn && existingImage) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Visitor Photo</h2>
        <p className="text-gray-600 text-sm">Photo already uploaded by visitor</p>
        
        <div className="relative w-80 h-60 mx-auto bg-gray-200 rounded-xl overflow-hidden shadow-inner">
          <img 
            src={existingImage} 
            alt="Visitor photo" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => onPhotoCapture(null, existingImage)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Use This Photo
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retake Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Take Your Photo</h2>
      <p className="text-gray-600 text-sm">This helps our staff identify you</p>

      <div className="relative w-80 h-60 mx-auto bg-gray-200 rounded-xl overflow-hidden shadow-inner">
        {/* Always render video element to ensure ref stability */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
        />
        
        {!isCameraActive && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleStartCamera}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>Start Camera</span>
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}
        
        {isCameraActive && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <button
              onClick={switchCamera}
              className="bg-white/80 text-gray-800 p-3 rounded-full shadow-lg hover:bg-white transition-colors"
              title="Switch Camera"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={capturePhoto}
              className="bg-white text-gray-800 p-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Only show file upload for logged-in users (admins) */}
      {isLoggedIn && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or upload an image file:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const previewUrl = URL.createObjectURL(file);
                onPhotoCapture(file, previewUrl);
              }
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      )}

      {/* <button
        onClick={onSkip}
        className="text-blue-600 hover:text-blue-700 underline text-sm"
      >
        Skip Photo (Continue without photo)
      </button> */}
    </div>
  );
};

export default CameraStep;
