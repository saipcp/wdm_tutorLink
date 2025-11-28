import React from "react";
import { Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminSecurityPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Security Settings
          </h1>
          <p className="text-gray-600">Manage platform security policies</p>
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Security Settings
            </h3>
            <Shield className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">
                User Verification
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Manage user verification processes and requirements
              </p>
              <button className="btn-secondary text-sm">
                Configure Verification
              </button>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">
                Session Security
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Configure session security and privacy settings
              </p>
              <button className="btn-secondary text-sm">
                Configure Session Security
              </button>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">
                Data Protection
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Manage data encryption and privacy protection settings
              </p>
              <button className="btn-secondary text-sm">
                Configure Data Protection
              </button>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Audit Logs</h4>
              <p className="text-sm text-gray-600 mb-3">
                Review system activity and security events
              </p>
              <button className="btn-secondary text-sm">View Audit Logs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurityPage;
