import React, { useState } from "react";
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Lock,
  Shield,
  Clock,
  Receipt,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface PaymentMethod {
  id: string;
  type: "card" | "upi" | "paypal" | "bank";
  details: string;
  isDefault: boolean;
  expiry?: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  method: string;
  reference?: string;
}

const PaymentPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"methods" | "history" | "billing">(
    "methods"
  );

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      details: "•••• •••• •••• 4242",
      isDefault: true,
      expiry: "12/25",
    },
    {
      id: "2",
      type: "upi",
      details: "student@oksbi",
      isDefault: false,
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      date: "2025-01-15",
      description: "Tutoring Session - Advanced Mathematics",
      amount: 50.0,
      status: "completed",
      method: "Credit Card",
      reference: "TXN-2025-001",
    },
    {
      id: "2",
      date: "2025-01-12",
      description: "Study Plan Consultation",
      amount: 25.0,
      status: "completed",
      method: "UPI",
      reference: "TXN-2025-002",
    },
    {
      id: "3",
      date: "2025-01-10",
      description: "Physics Tutoring Session",
      amount: 75.0,
      status: "pending",
      method: "Credit Card",
      reference: "TXN-2025-003",
    },
  ]);

  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: "card" as PaymentMethod["type"],
    details: "",
    expiry: "",
  });

  const handleAddPaymentMethod = () => {
    if (!newMethod.details.trim()) return;

    const method: PaymentMethod = {
      id: Date.now().toString(),
      type: newMethod.type,
      details:
        newMethod.type === "card"
          ? `•••• •••• •••• ${newMethod.details.slice(-4)}`
          : newMethod.details,
      isDefault: paymentMethods.length === 0,
      expiry: newMethod.expiry,
    };

    setPaymentMethods([...paymentMethods, method]);
    setNewMethod({ type: "card", details: "", expiry: "" });
    setShowAddMethod(false);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDeleteMethod = (id: string) => {
    if (paymentMethods.length <= 1) {
      alert("You must have at least one payment method.");
      return;
    }
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
    }
  };

  const getMethodIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "card":
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case "upi":
        return <DollarSign className="h-5 w-5 text-purple-600" />;
      case "paypal":
        return <Shield className="h-5 w-5 text-blue-500" />;
      case "bank":
        return <Receipt className="h-5 w-5 text-green-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalSpent = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payment & Billing
          </h1>
          <p className="text-gray-600">
            Manage your payment methods and view transaction history
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Spent</div>
          <div className="text-2xl font-bold text-gray-900">
            ${totalSpent.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {paymentMethods.length}
          </div>
          <div className="text-sm text-gray-600">Payment Methods</div>
        </div>
        <div className="card text-center">
          <Receipt className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {transactions.filter((t) => t.status === "completed").length}
          </div>
          <div className="text-sm text-gray-600">Completed Transactions</div>
        </div>
        <div className="card text-center">
          <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {transactions.filter((t) => t.status === "pending").length}
          </div>
          <div className="text-sm text-gray-600">Pending Transactions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: "methods", label: "Payment Methods", icon: CreditCard },
              { id: "history", label: "Transaction History", icon: Receipt },
              { id: "billing", label: "Billing Settings", icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Payment Methods Tab */}
        {activeTab === "methods" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Your Payment Methods
              </h3>
              <button
                onClick={() => setShowAddMethod(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Method</span>
              </button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getMethodIcon(method.type)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {method.details}
                        </div>
                        {method.expiry && (
                          <div className="text-sm text-gray-600">
                            Expires {method.expiry}
                          </div>
                        )}
                        {method.isDefault && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Secure Payments</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    All payment information is encrypted and secure. We never
                    store your full card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Transaction History
              </h3>
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(transaction.date)} • {transaction.method}
                        </div>
                        {transaction.reference && (
                          <div className="text-xs text-gray-500">
                            Ref: {transaction.reference}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </div>
                      <div
                        className={`text-sm font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  ${totalSpent.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {transactions.filter((t) => t.status === "completed").length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {transactions.filter((t) => t.status === "pending").length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Settings Tab */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Billing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Name
                  </label>
                  <input
                    type="text"
                    defaultValue={`${user.firstName} ${user.lastName}`}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Address
                </label>
                <textarea
                  rows={4}
                  className="input-field"
                  placeholder="Enter your billing address..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Billing Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      Monthly Invoices
                    </div>
                    <div className="text-sm text-gray-600">
                      Receive monthly billing summaries
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      Auto Payment
                    </div>
                    <div className="text-sm text-gray-600">
                      Automatically charge default payment method
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      {showAddMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Add Payment Method</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  value={newMethod.type}
                  onChange={(e) =>
                    setNewMethod({
                      ...newMethod,
                      type: e.target.value as PaymentMethod["type"],
                    })
                  }
                  className="input-field"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newMethod.type === "card"
                    ? "Card Number"
                    : "Account Details"}
                </label>
                <input
                  type={newMethod.type === "card" ? "text" : "text"}
                  value={newMethod.details}
                  onChange={(e) =>
                    setNewMethod({ ...newMethod, details: e.target.value })
                  }
                  className="input-field"
                  placeholder={
                    newMethod.type === "card"
                      ? "1234 5678 9012 3456"
                      : "Enter account details"
                  }
                />
              </div>

              {newMethod.type === "card" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={newMethod.expiry}
                    onChange={(e) =>
                      setNewMethod({ ...newMethod, expiry: e.target.value })
                    }
                    className="input-field"
                    placeholder="MM/YY"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAddMethod(false);
                  setNewMethod({ type: "card", details: "", expiry: "" });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentMethod}
                className="btn-primary"
                disabled={!newMethod.details.trim()}
              >
                Add Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
