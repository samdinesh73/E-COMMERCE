import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../constants/config";
import { Loader, AlertCircle, Users as UsersIcon, Mail, Calendar, TrendingUp, ShoppingCart } from "lucide-react";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (from = fromDate, to = toDate) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/users/admin/all-users`;
      const params = new URLSearchParams();
      if (from) params.append("fromDate", from);
      if (to) params.append("toDate", to);
      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await axios.get(url);
      setUsers(response.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Users</h2>
        <p className="text-gray-600">Manage and view customer information</p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchUsers(fromDate, toDate)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Filter
            </button>
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
                fetchUsers("", "");
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No users yet</p>
          <p className="text-gray-500 text-sm mt-1">Users will appear here when they register</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Total Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Total Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => navigate(`/admin/user/${user.id}`)}
                  className="hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{user.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {user.email || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      {user.total_orders || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      ₹{parseFloat(user.total_revenue || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
