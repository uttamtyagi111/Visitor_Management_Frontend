import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, RefreshCw, Settings, Eye, Copy, Share2 } from 'lucide-react';
import { qrCodeService } from '../../../api/qrCodeService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function GeneralQR() {
  const [qrSettings, setQrSettings] = useState({
    size: 256,
    errorCorrection: 'M',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    customText: 'Visitor Check-in System',
    borderSize: 4,
    cornerRadius: 8
  });

  const [generating, setGenerating] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [previewQR, setPreviewQR] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Load user's QR codes on component mount
    const loadQRCodes = async () => {
      try {
        setIsLoading(true);
        const response = await qrCodeService.getQRCodes();
        if (response && response.length > 0) {
          // Use the most recent QR code
          const latestQR = response[0];
          setQrData(latestQR);
          setQrSettings({
            ...qrSettings,
            size: latestQR.size || 256,
            errorCorrection: latestQR.error_correction || 'M',
            backgroundColor: latestQR.background || '#ffffff',
            foregroundColor: latestQR.foreground || '#000000',
            customText: latestQR.text || 'Visitor Check-in System'
          });
        } else {
          // Generate initial preview
          generatePreview();
        }
      } catch (err) {
        console.error('Error loading QR codes:', err);
        setError('Failed to load QR codes');
        // Don't show error toast on initial load, just log it
      } finally {
        setIsLoading(false);
      }
    };

    loadQRCodes();
  }, []);

  // Generate live preview when settings change
  const generatePreview = () => {
    if (!qrSettings.customText.trim()) return;
    
    const size = qrSettings.size || 256;
    const backgroundColor = qrSettings.backgroundColor.replace('#', '');
    const foregroundColor = qrSettings.foregroundColor.replace('#', '');
    
    // QR Server API URL with proper parameters
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrSettings.customText)}&bgcolor=${backgroundColor}&color=${foregroundColor}&ecc=${qrSettings.errorCorrection.toLowerCase()}`;
    
    setPreviewQR({
      id: 'preview',
      image: qrUrl,
      text: qrSettings.customText,
      size: qrSettings.size,
      error_correction: qrSettings.errorCorrection,
      background: qrSettings.backgroundColor,
      foreground: qrSettings.foregroundColor,
      isPreview: true
    });
  };

  // Update preview when settings change
  useEffect(() => {
    generatePreview();
  }, [qrSettings.customText, qrSettings.size, qrSettings.backgroundColor, qrSettings.foregroundColor, qrSettings.errorCorrection]);

  const handleGenerateQR = async () => {
    if (!qrSettings.customText.trim()) {
      toast.error('Please enter text or URL for the QR code');
      return;
    }

    setGenerating(true);
    setIsLoading(true);
    setError(null);

    try {
      const formData = {
        text: qrSettings.customText,
        size: qrSettings.size,
        error_correction: qrSettings.errorCorrection,
        background: qrSettings.backgroundColor,
        foreground: qrSettings.foregroundColor
      };

      const response = await qrCodeService.generateQRCode(formData);
      setQrData(response);
      toast.success('QR code generated successfully!');
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code. Please try again.');
      toast.error(err.message || 'Failed to generate QR code');
    } finally {
      setGenerating(false);
      setIsLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    const currentQR = qrData || previewQR;
    if (!currentQR?.image) {
      toast.error('No QR code available to download');
      return;
    }

    try {
      // Use canvas method for all downloads to avoid redirect issues
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Create a promise to handle the download
      const downloadPromise = new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const size = currentQR.size || 256;
            canvas.width = size;
            canvas.height = size;
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0, size, size);
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `qr-code-${new Date().toISOString().split('T')[0]}.png`;
              link.style.display = 'none';
              
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              URL.revokeObjectURL(url);
              resolve();
            }, 'image/png', 1.0);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      });
      
      // Set image source - try without CORS first for S3 URLs
      if (currentQR.image.includes('amazonaws.com') || currentQR.image.includes('s3.')) {
        img.src = currentQR.image;
      } else {
        img.crossOrigin = 'anonymous';
        img.src = currentQR.image;
      }
      
      await downloadPromise;
      toast.success('QR code downloaded successfully!');
      
    } catch (error) {
      console.error('Error downloading QR code:', error);
      
      // Final fallback - try direct download
      try {
        const link = document.createElement('a');
        link.href = currentQR.image;
        link.download = `qr-code-${new Date().toISOString().split('T')[0]}.png`;
        link.setAttribute('download', '');
        link.click();
        toast.info('Download initiated - check your downloads folder');
      } catch (fallbackError) {
        toast.error('Failed to download QR code');
      }
    }
  };

  const handleCopyText = async () => {
    const currentQR = qrData || previewQR;
    if (!currentQR?.image) {
      toast.error('No QR code available to copy');
      return;
    }

    try {
      // Convert image URL to blob
      const response = await fetch(currentQR.image);
      const blob = await response.blob();
      
      // Copy image to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      toast.success(`QR code ${currentQR.isPreview ? 'preview' : ''} image copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy image:', err);
      // Fallback: copy text instead
      try {
        await navigator.clipboard.writeText(currentQR.text);
        toast.success('QR code text copied to clipboard!');
      } catch (textErr) {
        console.error('Failed to copy text:', textErr);
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  const handleShareQR = async () => {
    const currentQR = qrData || previewQR;
    if (!currentQR?.image || !currentQR?.text) {
      toast.error('No QR code available to share');
      return;
    }

    try {
      // Convert image URL to blob for sharing
      const response = await fetch(currentQR.image);
      const blob = await response.blob();
      const file = new File([blob], `qr-code-${new Date().toISOString().split('T')[0]}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'QR Code',
          text: `QR Code for: ${currentQR.text}`,
          files: [file]
        });
      } else if (navigator.share) {
        // Fallback to sharing without file
        await navigator.share({
          title: 'QR Code',
          text: `QR Code for: ${currentQR.text}`,
          url: currentQR.text
        });
      } else {
        // Fallback: copy to clipboard
        handleCopyText();
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback: copy to clipboard
      handleCopyText();
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Configuration */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">QR Code Configuration</h3>
            
            <div className="space-y-6">
              {/* Custom Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Text/URL</label>
              <input
                type="text"
                value={qrSettings.customText}
                onChange={(e) => setQrSettings({...qrSettings, customText: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter URL or text for QR"
              />
            </div>

            {/* Size and Error Correction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <select
                  value={qrSettings.size}
                  onChange={(e) => setQrSettings({...qrSettings, size: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value={128}>128px</option>
                  <option value={256}>256px</option>
                  <option value={512}>512px</option>
                  <option value={1024}>1024px</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Error Correction</label>
                <select
                  value={qrSettings.errorCorrection}
                  onChange={(e) => setQrSettings({...qrSettings, errorCorrection: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={qrSettings.backgroundColor}
                    onChange={(e) => setQrSettings({...qrSettings, backgroundColor: e.target.value})}
                    className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrSettings.backgroundColor}
                    onChange={(e) => setQrSettings({...qrSettings, backgroundColor: e.target.value})}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foreground</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={qrSettings.foregroundColor}
                    onChange={(e) => setQrSettings({...qrSettings, foregroundColor: e.target.value})}
                    className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrSettings.foregroundColor}
                    onChange={(e) => setQrSettings({...qrSettings, foregroundColor: e.target.value})}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <button
                onClick={handleGenerateQR}
                disabled={generating || !qrSettings.customText.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                <span>{generating ? 'Generating...' : 'Generate QR Code'}</span>
              </button>
            </div>

            </div>
          </div>

          {/* QR Preview */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">QR Code Preview</h3>
            <button
              onClick={handleGenerateQR}
              disabled={generating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating...' : 'Refresh'}</span>
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center mb-6">
            {isLoading ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-64 h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (qrData?.image || previewQR?.image) ? (
              <div className="relative">
                <img 
                  src={qrData?.image || previewQR?.image} 
                  alt={qrData?.image ? "Generated QR Code" : "QR Code Preview"}
                  className="w-64 h-64 object-contain p-4 rounded-xl"
                  style={{
                    backgroundColor: qrSettings.backgroundColor,
                    border: `1px solid ${qrSettings.foregroundColor}20`
                  }}
                />
                {!qrData?.image && previewQR?.image && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Preview
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4">
                <QrCode className="w-32 h-32 mx-auto mb-4 text-gray-300" />
                <p className="text-sm text-gray-500">
                  {error || 'Configure and generate your QR code'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-bold text-gray-900 mb-3">QR Code Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <span className="text-gray-600 block">Size:</span>
                <span className="font-medium">{(qrData || previewQR)?.size || qrSettings.size}px</span>
              </div>
              <div className="text-left">
                <span className="text-gray-600 block">Error Level:</span>
                <span className="font-medium">
                  {(qrData || previewQR)?.error_correction || qrSettings.errorCorrection}
                  {((qrData || previewQR)?.error_correction || qrSettings.errorCorrection) === 'L' && ' (7% recovery)'}
                  {((qrData || previewQR)?.error_correction || qrSettings.errorCorrection) === 'M' && ' (15% recovery)'}
                  {((qrData || previewQR)?.error_correction || qrSettings.errorCorrection) === 'Q' && ' (25% recovery)'}
                  {((qrData || previewQR)?.error_correction || qrSettings.errorCorrection) === 'H' && ' (30% recovery)'}
                </span>
              </div>
              {qrData?.created_at && (
                <div className="col-span-2 text-left">
                  <span className="text-gray-600 block">Generated on:</span>
                  <span className="font-medium">
                    {new Date(qrData.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {!qrData?.created_at && previewQR && (
                <div className="col-span-2 text-left">
                  <span className="text-gray-600 block">Status:</span>
                  <span className="font-medium text-blue-600">Live Preview - Click Generate to Save</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={handleDownloadQR}
              disabled={!(qrData?.image || previewQR?.image)}
              className="flex items-center justify-center space-x-2 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button 
              onClick={handleCopyText}
              disabled={!(qrData?.image || previewQR?.image)}
              className="flex items-center justify-center space-x-2 py-3 bg-white border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            <button 
              onClick={handleShareQR}
              disabled={!(qrData?.image || previewQR?.image)}
              className="flex items-center justify-center space-x-2 py-3 bg-white border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button 
              className="flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium"
              onClick={() => {
                if ((qrData || previewQR)?.text) {
                  window.open((qrData || previewQR).text, '_blank', 'noopener,noreferrer');
                } else {
                  toast.info('Generate a QR code first to view details');
                }
              }}
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
          </div>
        </div>
        </div>

        {/* Usage Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Implementation Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Generate & Configure</h4>
            <p className="text-gray-700 text-sm leading-relaxed">Set up your QR code with custom colors, size, and branding to match your organization's identity</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Deploy & Display</h4>
            <p className="text-gray-700 text-sm leading-relaxed">Print and place QR codes at strategic locations like entrances, reception desks, or meeting rooms</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Monitor & Manage</h4>
            <p className="text-gray-700 text-sm leading-relaxed">Track real-time visitor check-ins and manage their information through the dashboard</p>
          </div>
        </div>
      </motion.div>
      </motion.div>
    </div>
  );
}

export default GeneralQR;