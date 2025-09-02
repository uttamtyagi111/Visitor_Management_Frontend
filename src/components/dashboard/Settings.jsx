import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Palette, Save, Download, Upload, Eye } from 'lucide-react';
import GeneralQR from './settings/GeneralQR';
import FormCustomization from './settings/FormCustomization';

function Settings() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { name: 'General QR', href: '/dashboard/settings', icon: QrCode },
    { name: 'Form Customization', href: '/dashboard/settings/form-customization', icon: Palette }
  ];

  const isActive = (href) => {
    if (href === '/dashboard/settings') {
      return currentPath === '/dashboard/settings' || currentPath === '/dashboard/settings/';
    }
    return currentPath === href;
  };

  return (
    <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 text-lg">Configure your visitor management system</p>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/50 mb-8"
        >
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.href);
              
              return (
                <Link
                  key={tab.name}
                  to={tab.href}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <Routes>
          <Route path="/" element={<GeneralQR />} />
          <Route path="/form-customization" element={<FormCustomization />} />
        </Routes>
      </motion.div>
    </div>
  );
}

export default Settings;