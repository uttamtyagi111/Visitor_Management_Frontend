import React, { useState, useRef, useEffect } from "react";
import { Camera, ArrowLeft, Check, RotateCcw } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";

const CameraStep = ({ 
  onPhotoCapture, 
  onSkip, 
  onUseExisting, 
  onCompleteRegistration,
  onBack, 
  existingVisitor, 
  isExistingVisitor, 
  existingImage, 
  capturedImage,
  isSubmitting 
}) => {
  const { toast } = useToast();
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
  const [showRetakeCamera, setShowRetakeCamera] = useState(false); // New state for retake mode

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
      toast.error("Camera initialization failed - please try again");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

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

      // Check if component is still mounted before proceeding
      if (!isMountedRef.current) {
        console.log("Component unmounted during camera setup, stopping stream");
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      if (videoRef.current) {
        console.log("Setting video stream");
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setIsCameraActive(true);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Unable to access camera. Please check permissions and try again.");
      setIsLoading(false);
      setIsCameraActive(false);
    }
  };

  // Switch between front and back camera
  const switchCamera = () => {
    const newFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(newFacing);
    startCamera(newFacing);
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready for photo capture");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        onPhotoCapture(blob, previewUrl);
        
        // Stop camera after capture
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          setCameraStream(null);
          setIsCameraActive(false);
        }
      } else {
        toast.error("Failed to capture photo. Please try again.");
      }
    }, "image/jpeg", 0.8);
  };

  // Stop camera stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Handle start camera button
  const handleStartCamera = () => {
    setShowRetakeCamera(true); // Show camera section for retaking
    
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
        toast.error("Camera not ready. Please try again in a moment.");
      }
    }, 50); // Small delay to ensure rendering is complete
  };

  // Handle retake photo button
  const handleRetakePhoto = () => {
    setShowRetakeCamera(true);
    // Don't start camera immediately, let user click "Start Camera" button
  };

  // Handle cancel retake
  const handleCancelRetake = () => {
    setShowRetakeCamera(false);
    stopCamera();
  };

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log("CameraStep unmounting, cleaning up");
      isMountedRef.current = false;
      
      if (cameraStream) {
        console.log("Stopping camera stream on unmount");
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cameraStream]);

  return (
    <div className="text-center space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isExistingVisitor ? "Welcome Back!" : "Take Your Photo"}
          </h2>
        </div>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>

      {/* Existing Visitor Section */}
      {isExistingVisitor && existingVisitor && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              <span className="text-purple-800 font-medium">Returning Visitor</span>
            </div>
            <p className="text-purple-700 text-sm">
              Welcome back, {existingVisitor.name}! You can use your previous photo or take a new one.
            </p>
          </div>

          {/* Existing Image Display - Only show when NOT in retake mode */}
          {existingImage && !showRetakeCamera ? (
            <div className="relative w-80 h-60 mx-auto bg-gray-200 rounded-xl overflow-hidden shadow-inner">
              <img
                src={existingImage}
                alt="Your previous photo"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Failed to load existing visitor image:', existingImage);
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  Your previous photo
                </span>
              </div>
            </div>
          ) : null}

        </div>
      )}

      {/* New Visitor Section */}
      {!isExistingVisitor && (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">This helps our staff identify you during your visit</p>
        </div>
      )}

      {/* Camera Section - Show based on visitor type and retake state */}
      {/* For new visitors: always show camera */}
      {/* For existing visitors: only show when retaking (showRetakeCamera=true) or no existing image */}
      {(!isExistingVisitor || showRetakeCamera || (!existingImage && !capturedImage)) && (
        <div className="space-y-4">
          {/* Cancel retake button for existing visitors */}
          {isExistingVisitor && showRetakeCamera && (
            <div className="text-center">
              <button
                onClick={handleCancelRetake}
                className="text-gray-600 hover:text-gray-800 underline text-sm"
              >
                Cancel Retake
              </button>
            </div>
          )}
          
          <div className="relative w-80 h-60 mx-auto bg-gray-200 rounded-xl overflow-hidden shadow-inner">
            {/* Show captured image if available, otherwise show camera */}
            {capturedImage ? (
              <>
                <img
                  src={URL.createObjectURL(capturedImage)}
                  alt="Captured photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    New photo captured
                  </span>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}



      {/* Complete Registration Button */}
      <div className="space-y-3 pt-4">
        <button
          onClick={onCompleteRegistration}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-5 h-5" />
          <span>{isSubmitting ? "Completing Registration..." : "Complete Registration"}</span>
        </button>

        {/* Retake Photo Button - Show for existing visitors with existing image (when not in retake mode) */}
        {isExistingVisitor && existingImage && !showRetakeCamera && !capturedImage && (
          <button
            onClick={handleRetakePhoto}
            disabled={isSubmitting}
            className="w-full text-blue-600 hover:text-blue-700 underline text-sm disabled:opacity-50"
          >
            Retake Photo
          </button>
        )}

        {/* Retake Photo Button - Show when new photo is captured */}
        {capturedImage && (
          <button
            onClick={() => {
              onPhotoCapture(null, null); // Clear captured image in parent
              // Camera will automatically show again since capturedImage becomes null
            }}
            disabled={isSubmitting}
            className="w-full text-blue-600 hover:text-blue-700 underline text-sm disabled:opacity-50"
          >
            Retake Photo
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraStep;
