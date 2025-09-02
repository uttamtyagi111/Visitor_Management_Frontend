import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, RefreshCw, Settings, Eye, Upload } from 'lucide-react';

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

  const handleGenerateQR = async () => {
    setGenerating(true);
    // Simulate API call to Python backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Generating QR with settings:', qrSettings);
    setGenerating(false);
  };

  const handleDownloadQR = () => {
    console.log('Downloading QR code');
    // Implementation for QR download
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrSettings({...qrSettings, logo: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
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
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload logo</p>
                  <p className="text-gray-500 text-xs">PNG, JPG up to 2MB</p>
                </label>
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
          
          <div className="text-center">
            <div 
              className="w-64 h-64 mx-auto mb-6 rounded-2xl border-2 border-gray-200 flex items-center justify-center shadow-lg"
              style={{ backgroundColor: qrSettings.backgroundColor }}
            >
              <div className="text-center">
                <QrCode 
                  className="w-32 h-32 mx-auto mb-4" 
                  style={{ color: qrSettings.foregroundColor }}
                />
                <p className="text-xs font-medium" style={{ color: qrSettings.foregroundColor }}>
                  {qrSettings.customText}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-gray-900 mb-3">QR Code Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <span className="text-gray-600 block">Size:</span>
                  <span className="font-medium">{qrSettings.size}px</span>
                </div>
                <div className="text-left">
                  <span className="text-gray-600 block">Error Level:</span>
                  <span className="font-medium">{qrSettings.errorCorrection}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleDownloadQR}
                className="flex items-center justify-center space-x-2 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button className="flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium">
                <Eye className="w-4 h-4" />
                <span>Test Scan</span>
              </button>
            </div>
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
  );
}

export default GeneralQR;