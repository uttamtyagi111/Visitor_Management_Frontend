import React from "react";
import { CheckCircle } from "lucide-react";

const SuccessStep = ({ visitorData, onRegisterAnother }) => {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-2">Your registration has been completed successfully!</p>
        {visitorData?.id && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Visitor ID:</strong> #{visitorData.id}
            </p>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="text-amber-800 font-semibold mb-1">
            What happens next?
          </h3>
          <p className="text-amber-700 text-sm">
            • Our front desk team will review your registration
            <br />
            • You'll be notified once approved
            <br />• Please wait in the lobby area
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessStep;
