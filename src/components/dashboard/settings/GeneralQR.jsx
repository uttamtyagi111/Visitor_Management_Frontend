import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, RefreshCw, Settings, Eye, Upload, Check, X, Copy, Share2 } from 'lucide-react';
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
    logo: null,
    customText: 'Visitor Check-in System',
    borderSize: 4,
    cornerRadius: 8
  });

  const [generating, setGenerating] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
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
          // Auto-generate a default QR code if none exist
          const defaultFormData = {
            text: qrSettings.customText,
            size: qrSettings.size,
            error_correction: qrSettings.errorCorrection,
            background: qrSettings.backgroundColor,
            foreground: qrSettings.foregroundColor,
            logo: null
          };
          const defaultQR = await qrCodeService.generateQRCode(defaultFormData);
          setQrData(defaultQR);
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
        foreground: qrSettings.foregroundColor,
        logo: logoFile
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

  const handleDownloadQR = () => {
    if (!qrData?.image) {
      toast.error('No QR code available to download');
      return;
    }

    const link = document.createElement('a');
    link.href = qrData.image;
    link.download = `qr-code-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded successfully!');
  };

  const handleCopyText = async () => {
    if (!qrData?.text) {
      toast.error('No QR code text to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(qrData.text);
      toast.success('QR code text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast.error('Failed to copy text to clipboard');
    }
  };

  const handleShareQR = async () => {
    if (!qrData?.image || !qrData?.text) {
      toast.error('No QR code available to share');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: `QR Code for: ${qrData.text}`,
          url: qrData.text
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyText();
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('image/(png|jpg|jpeg)')) {
        toast.error('Only PNG, JPG, and JPEG files are allowed');
        return;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo size should be less than 5MB');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrSettings({...qrSettings, logo: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setQrSettings({...qrSettings, logo: null});
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

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Center Logo (Optional)</label>
              <div className="space-y-4">
                {qrSettings.logo ? (
                  <div className="relative group">
                    <div className="relative w-24 h-24 mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                      <img 
                        src={qrSettings.logo} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Remove logo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2">Logo preview</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload logo</p>
                      <p className="text-gray-500 text-xs">PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                )}
                {logoFile && (
                  <div className="text-xs text-center text-gray-500">
                    {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
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
            ) : qrData?.image ? (
              <div className="relative">
                <img 
                  src={qrData.image} 
                  alt="Generated QR Code"
                  className="w-64 h-64 object-contain p-4 rounded-xl"
                  style={{
                    backgroundColor: qrSettings.backgroundColor,
                    border: `1px solid ${qrSettings.foregroundColor}20`
                  }}
                />
                {qrData.logo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full p-1">
                      <img 
                        src={qrData.logo} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
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
                <span className="font-medium">{qrData?.size || qrSettings.size}px</span>
              </div>
              <div className="text-left">
                <span className="text-gray-600 block">Error Level:</span>
                <span className="font-medium">
                  {qrData?.error_correction || qrSettings.errorCorrection}
                  {qrData?.error_correction === 'L' && ' (7% recovery)'}
                  {qrData?.error_correction === 'M' && ' (15% recovery)'}
                  {qrData?.error_correction === 'Q' && ' (25% recovery)'}
                  {qrData?.error_correction === 'H' && ' (30% recovery)'}
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
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={handleDownloadQR}
              disabled={!qrData?.image}
              className="flex items-center justify-center space-x-2 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button 
              onClick={handleCopyText}
              disabled={!qrData?.text}
              className="flex items-center justify-center space-x-2 py-3 bg-white border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            <button 
              onClick={handleShareQR}
              disabled={!qrData?.text}
              className="flex items-center justify-center space-x-2 py-3 bg-white border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button 
              className="flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium"
              onClick={() => {
                if (qrData?.text) {
                  window.open(qrData.text, '_blank', 'noopener,noreferrer');
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