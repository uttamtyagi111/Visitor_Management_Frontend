import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Plus, 
  Mail, 
  Phone, 
  Building, 
  User, 
  X,
  Send,
  Edit,
  Trash2,
  Users,
  QrCode,
  Camera,
  Download,
  Check,
  ChevronRight,
  Upload
} from 'lucide-react';

const mockInvitees = [
  {
    id: '1',
    name: 'Jennifer Adams',
    email: 'jennifer@company.com',
    company: 'Tech Solutions',
    purpose: 'Product Demo',
    host: 'Sarah Johnson',
    visitDate: '2025-01-16',
    visitTime: '10:00 AM',
    status: 'pending',
    phone: '+1 (555) 111-2222',
    notes: 'VIP client, prepare conference room A'
  },
  {
    id: '2',
    name: 'Robert Williams',
    email: 'robert@startup.io',
    company: 'Innovation Hub',
    purpose: 'Partnership Meeting',
    host: 'Mike Wilson',
    visitDate: '2025-01-17',
    visitTime: '02:30 PM',
    status: 'confirmed',
    phone: '+1 (555) 333-4444',
    notes: 'Bringing team of 3 members'
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    email: 'lisa@design.co',
    company: 'Creative Agency',
    purpose: 'Design Review',
    host: 'Emily Davis',
    visitDate: '2025-01-18',
    visitTime: '11:15 AM',
    status: 'sent',
    phone: '+1 (555) 555-6666',
    notes: 'Portfolio presentation scheduled'
  },
];

function Invitees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [inviteCode, setInviteCode] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [inviteFormData, setInviteFormData] = useState({
    name: '',
    email: '',
    company: '',
    purpose: '',
    host: '',
    visitDate: '',
    visitTime: '',
    phone: '',
    notes: ''
  });

  const steps = [
    { id: 1, title: 'Enter Code', icon: QrCode },
    { id: 2, title: 'Edit Details', icon: Edit },
    { id: 3, title: 'Capture Image', icon: Camera },
    { id: 4, title: 'Preview Pass', icon: User }
  ];

  const filteredInvitees = mockInvitees.filter(invitee => {
    const matchesSearch = invitee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitee.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invitee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmitInvite = (e) => {
    e.preventDefault();
    console.log('Sending invite:', inviteFormData);
    setShowInviteForm(false);
    resetForm();
  };

  const handleInviteCodeSubmit = () => {
    // Mock: Fetch invite details based on code
    const mockInviteData = {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Example Corp',
      purpose: 'Business Meeting',
      host: 'Jane Smith',
      visitDate: '2025-01-20',
      visitTime: '10:00',
      phone: '+1 (555) 123-4567',
      notes: 'Important client meeting'
    };
    
    setInviteFormData(mockInviteData);
    setCurrentStep(2);
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setInviteFormData({
      name: '',
      email: '',
      company: '',
      purpose: '',
      host: '',
      visitDate: '',
      visitTime: '',
      phone: '',
      notes: ''
    });
    setInviteCode('');
    setCapturedImage(null);
    setCurrentStep(1);
  };

  const closeModal = () => {
    setShowInviteCodeModal(false);
    resetForm();
  };

  const getStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'sent': 'bg-blue-100 text-blue-800 border-blue-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Enter Invite Code</h3>
            <p className="text-gray-600 mb-8">Enter the invitation code to proceed with the visitor pass creation</p>
            
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-6 py-4 text-center text-2xl font-mono bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 tracking-wider"
                placeholder="ENTER-CODE"
                maxLength={12}
              />
              
              <button
                onClick={handleInviteCodeSubmit}
                disabled={!inviteCode.trim()}
                className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify Code
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="py-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Edit Visitor Details</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={inviteFormData.name}
                      onChange={(e) => setInviteFormData({...inviteFormData, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={inviteFormData.email}
                      onChange={(e) => setInviteFormData({...inviteFormData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={inviteFormData.phone}
                      onChange={(e) => setInviteFormData({...inviteFormData, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={inviteFormData.company}
                      onChange={(e) => setInviteFormData({...inviteFormData, company: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={inviteFormData.visitDate}
                      onChange={(e) => setInviteFormData({...inviteFormData, visitDate: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visit Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="time"
                      value={inviteFormData.visitTime}
                      onChange={(e) => setInviteFormData({...inviteFormData, visitTime: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit</label>
                <input
                  type="text"
                  value={inviteFormData.purpose}
                  onChange={(e) => setInviteFormData({...inviteFormData, purpose: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Business meeting, Interview, Product demo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Host Name</label>
                <input
                  type="text"
                  value={inviteFormData.host}
                  onChange={(e) => setInviteFormData({...inviteFormData, host: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter host name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={inviteFormData.notes}
                  onChange={(e) => setInviteFormData({...inviteFormData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Any special instructions or notes..."
                />
              </div>
            </form>
          </div>
        );

      case 3:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Capture Photo</h3>
            <p className="text-gray-600 mb-8">Upload or capture a photo for the visitor pass</p>

            <div className="max-w-md mx-auto">
              {capturedImage ? (
                <div className="mb-6">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-48 h-48 object-cover rounded-2xl mx-auto border-4 border-white shadow-lg"
                  />
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-48 h-48 mx-auto border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-medium">Click to upload photo</p>
                  <p className="text-gray-400 text-sm mt-2">JPG, PNG up to 5MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageCapture}
                className="hidden"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="py-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Visitor Pass Preview</h3>
            
            <div className="max-w-sm mx-auto">
              {/* Pass Design */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold">VISITOR PASS</h4>
                  <p className="text-blue-100 text-sm">Company Name</p>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Visitor" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white/60" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-lg">{inviteFormData.name}</h5>
                    <p className="text-blue-100 text-sm">{inviteFormData.company}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-100">Date:</span>
                    <span>{inviteFormData.visitDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Time:</span>
                    <span>{inviteFormData.visitTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Host:</span>
                    <span>{inviteFormData.host}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-100">Purpose:</span>
                    <span className="text-right">{inviteFormData.purpose}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20 text-center">
                  <div className="w-16 h-16 bg-white rounded-lg mx-auto flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-gray-800" />
                  </div>
                  <p className="text-xs text-blue-100 mt-2">Scan QR Code</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                  Create Pass
                </button>
                <button className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Pass</span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Invite Management</h1>
            <p className="text-gray-600 text-lg">Send invitations and manage upcoming visits</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowInviteCodeModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <QrCode className="w-5 h-5" />
              <span>Invite Code</span>
            </button>
            <button 
              onClick={() => setShowInviteForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Send Invitation</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search invitees, companies, or emails..."
                />
              </div>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Invitees Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Invitations</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Invitee</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Visit Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Host</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredInvitees.map((invitee, index) => (
                    <motion.tr
                      key={invitee.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="hover:bg-white/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{invitee.name}</p>
                          <p className="text-gray-600 text-sm">{invitee.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{invitee.company}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{invitee.visitDate}</p>
                          <p className="text-gray-600 text-sm">{invitee.visitTime}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{invitee.host}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invitee.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredInvitees.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">No invitees found matching your criteria</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Regular Invite Form Modal */}
      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Send Invitation</h3>
                <button 
                  onClick={() => setShowInviteForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmitInvite} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={inviteFormData.name}
                        onChange={(e) => setInviteFormData({...inviteFormData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={inviteFormData.email}
                        onChange={(e) => setInviteFormData({...inviteFormData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={inviteFormData.phone}
                        onChange={(e) => setInviteFormData({...inviteFormData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={inviteFormData.company}
                        onChange={(e) => setInviteFormData({...inviteFormData, company: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={inviteFormData.visitDate}
                        onChange={(e) => setInviteFormData({...inviteFormData, visitDate: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visit Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        value={inviteFormData.visitTime}
                        onChange={(e) => setInviteFormData({...inviteFormData, visitTime: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit</label>
                  <input
                    type="text"
                    value={inviteFormData.purpose}
                    onChange={(e) => setInviteFormData({...inviteFormData, purpose: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Business meeting, Interview, Product demo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Host Name</label>
                  <input
                    type="text"
                    value={inviteFormData.host}
                    onChange={(e) => setInviteFormData({...inviteFormData, host: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter host name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={inviteFormData.notes}
                    onChange={(e) => setInviteFormData({...inviteFormData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Any special instructions or notes..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Invitation</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Code Modal */}
      <AnimatePresence>
        {showInviteCodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl max-h-[95vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Process Invitation</h3>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    
                    return (
                      <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : isActive 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {isCompleted ? (
                              <Check className="w-6 h-6" />
                            ) : (
                              <Icon className="w-6 h-6" />
                            )}
                          </div>
                          <span className={`mt-2 text-sm font-medium transition-colors ${
                            isActive ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${
                            currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              {currentStep > 1 && currentStep < 4 && (
                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={currentStep === 3 && !capturedImage}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Invitees;