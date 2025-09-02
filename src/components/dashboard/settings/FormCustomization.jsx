import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save, RefreshCw, Upload, Eye, Download } from 'lucide-react';

function FormCustomization() {
  const [formSettings, setFormSettings] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    accentColor: '#F97316',
    backgroundColor: '#F8FAFC',
    textColor: '#1F2937',
    buttonStyle: 'rounded',
    fontFamily: 'Inter',
    logo: null,
    companyName: 'Your Company',
    welcomeMessage: 'Welcome! Please fill out the form below to check in.',
    requiredFields: {
      name: true,
      email: true,
      company: true,
      purpose: true,
      phone: false,
      hostName: true
    }
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleSaveSettings = () => {
    console.log('Saving form settings:', formSettings);
    // Integrate with Python backend to save settings
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormSettings({...formSettings, logo: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const buttonStyles = {
    rounded: 'rounded-xl',
    square: 'rounded-none',
    pill: 'rounded-full'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Configuration */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Form Customization</h3>
          
          <div className="space-y-6">
            {/* Company Branding */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Company Branding</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formSettings.companyName}
                  onChange={(e) => setFormSettings({...formSettings, companyName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                <textarea
                  value={formSettings.welcomeMessage}
                  onChange={(e) => setFormSettings({...formSettings, welcomeMessage: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter welcome message"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="form-logo-upload"
                  />
                  <label htmlFor="form-logo-upload" className="cursor-pointer">
                    {formSettings.logo ? (
                      <img src={formSettings.logo} alt="Logo" className="w-16 h-16 mx-auto rounded-lg object-cover" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Upload Logo</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Color Settings */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Color Scheme</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formSettings.primaryColor}
                      onChange={(e) => setFormSettings({...formSettings, primaryColor: e.target.value})}
                      className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formSettings.primaryColor}
                      onChange={(e) => setFormSettings({...formSettings, primaryColor: e.target.value})}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formSettings.secondaryColor}
                      onChange={(e) => setFormSettings({...formSettings, secondaryColor: e.target.value})}
                      className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formSettings.secondaryColor}
                      onChange={(e) => setFormSettings({...formSettings, secondaryColor: e.target.value})}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formSettings.backgroundColor}
                    onChange={(e) => setFormSettings({...formSettings, backgroundColor: e.target.value})}
                    className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formSettings.backgroundColor}
                    onChange={(e) => setFormSettings({...formSettings, backgroundColor: e.target.value})}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Style Settings */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Style Options</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
                <div className="flex space-x-2">
                  {Object.entries(buttonStyles).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setFormSettings({...formSettings, buttonStyle: key})}
                      className={`px-4 py-2 border-2 transition-all duration-200 ${value} ${
                        formSettings.buttonStyle === key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={formSettings.fontFamily}
                  onChange={(e) => setFormSettings({...formSettings, fontFamily: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        {/* Form Preview */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Form Preview</h3>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>{previewMode ? 'Design' : 'Preview'}</span>
            </button>
          </div>

          <div 
            className="rounded-2xl p-8 border-2 shadow-lg min-h-[400px]"
            style={{ backgroundColor: formSettings.backgroundColor }}
          >
            {/* Form Header */}
            <div className="text-center mb-8">
              {formSettings.logo && (
                <img src={formSettings.logo} alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-lg" />
              )}
              <h2 className="text-2xl font-bold mb-2" style={{ color: formSettings.textColor, fontFamily: formSettings.fontFamily }}>
                {formSettings.companyName}
              </h2>
              <p className="text-gray-600" style={{ fontFamily: formSettings.fontFamily }}>
                {formSettings.welcomeMessage}
              </p>
            </div>

            {/* Sample Form Fields */}
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: formSettings.textColor }}>
                  Full Name {formSettings.requiredFields.name && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ 
                    focusRingColor: formSettings.primaryColor,
                    fontFamily: formSettings.fontFamily 
                  }}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: formSettings.textColor }}>
                  Email Address {formSettings.requiredFields.email && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ fontFamily: formSettings.fontFamily }}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: formSettings.textColor }}>
                  Company {formSettings.requiredFields.company && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ fontFamily: formSettings.fontFamily }}
                  placeholder="Enter company name"
                />
              </div>

              <button
                className={`w-full py-3 text-white font-medium transition-all duration-200 ${buttonStyles[formSettings.buttonStyle]} shadow-lg hover:shadow-xl`}
                style={{ 
                  background: `linear-gradient(135deg, ${formSettings.primaryColor}, ${formSettings.secondaryColor})`,
                  fontFamily: formSettings.fontFamily 
                }}
              >
                Check In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Required Fields Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Required Fields Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(formSettings.requiredFields).map(([field, required]) => (
            <div key={field} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="font-medium text-gray-900 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="text-gray-600 text-sm">
                  {required ? 'Required field' : 'Optional field'}
                </p>
              </div>
              <button
                onClick={() => setFormSettings({
                  ...formSettings,
                  requiredFields: {
                    ...formSettings.requiredFields,
                    [field]: !required
                  }
                })}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  required ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${
                  required ? 'translate-x-6' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="flex justify-center space-x-4"
      >
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
        >
          <Eye className="w-4 h-4" />
          <span>Full Preview</span>
        </button>
        <button
          onClick={handleSaveSettings}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </motion.div>
    </motion.div>
  );
}

const buttonStyles = {
  rounded: 'rounded-xl',
  square: 'rounded-none',
  pill: 'rounded-full'
};

export default FormCustomization;