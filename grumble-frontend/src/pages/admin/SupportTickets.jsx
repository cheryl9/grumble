import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import StatsCard from "../../components/admin/StatsCard";
import Pagination from "../../components/admin/Pagination";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    open: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingTicket, setUpdatingTicket] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, selectedStatus]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const statuses = ["open", "in_progress", "resolved"];
      const statsData = {};

      for (const status of statuses) {
        const response = await fetch(
          `${API_BASE_URL}/support/status/${status}?page=1&limit=1`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.ok) {
          const data = await response.json();
          statsData[status] = data.pagination?.total || 0;
        }
      }

      setStats(statsData);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      let url;
      if (selectedStatus) {
        url = `${API_BASE_URL}/support/status/${selectedStatus}?page=${currentPage}&limit=${itemsPerPage}`;
      } else {
        url = `${API_BASE_URL}/support?page=${currentPage}&limit=${itemsPerPage}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch support tickets");
      }

      const data = await response.json();
      setTickets(data.data || []);
      setTotalPages(Math.ceil((data.pagination?.total || 0) / itemsPerPage));
      setError(null);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      setUpdatingTicket(ticketId);
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${API_BASE_URL}/support/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }

      // Update local state
      setTickets(
        tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: newStatus,
                admin_notes: adminNotes || t.admin_notes,
              }
            : t,
        ),
      );

      // Update selected ticket
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => ({
          ...prev,
          status: newStatus,
          admin_notes: adminNotes || prev.admin_notes,
        }));
      }

      setAdminNotes("");
      await fetchStats();
    } catch (err) {
      console.error("Error updating ticket:", err);
      setError(err.message);
    } finally {
      setUpdatingTicket(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="text-yellow-500" size={20} />;
      case "in_progress":
        return <Clock className="text-blue-500" size={20} />;
      case "resolved":
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-50 border-yellow-200";
      case "in_progress":
        return "bg-blue-50 border-blue-200";
      case "resolved":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
            Open
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
            In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-gray-600">
            Manage customer support requests and issues
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Open"
            value={stats.open}
            icon={AlertCircle}
            color="yellow"
          />
          <StatsCard
            title="In Progress"
            value={stats.in_progress}
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Resolved"
            value={stats.resolved}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => {
              setSelectedStatus(null);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === null
                ? "bg-orange-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => {
              setSelectedStatus("open");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === "open"
                ? "bg-yellow-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Open
          </button>
          <button
            onClick={() => {
              setSelectedStatus("in_progress");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === "in_progress"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => {
              setSelectedStatus("resolved");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === "resolved"
                ? "bg-green-500 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Resolved
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            {tickets.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-600">No support tickets found</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? "bg-orange-50 border-l-orange-600"
                          : "bg-white border-l-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              #{ticket.id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {ticket.category}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{ticket.user_username}</span>
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Ticket Details */}
          {selectedTicket && (
            <div
              className={`bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-fit ${getStatusColor(selectedTicket.status)}`}
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Ticket #{selectedTicket.id}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  {getStatusIcon(selectedTicket.status)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                    Category
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedTicket.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                    From
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedTicket.user_username}
                  </p>
                  {selectedTicket.contact_email && (
                    <p className="text-sm text-gray-600">
                      {selectedTicket.contact_email}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                    Submitted
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedTicket.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                {selectedTicket.admin_notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      Admin Notes
                    </p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedTicket.admin_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Updates */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                    Add Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes for this ticket..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedTicket.id, "in_progress")
                    }
                    disabled={
                      selectedTicket.status === "in_progress" ||
                      updatingTicket === selectedTicket.id
                    }
                    className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingTicket === selectedTicket.id
                      ? "Updating..."
                      : "In Progress"}
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedTicket.id, "resolved")
                    }
                    disabled={
                      selectedTicket.status === "resolved" ||
                      updatingTicket === selectedTicket.id
                    }
                    className="px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingTicket === selectedTicket.id
                      ? "Updating..."
                      : "Resolve"}
                  </button>
                </div>

                {selectedTicket.status !== "open" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedTicket.id, "open")
                    }
                    disabled={updatingTicket === selectedTicket.id}
                    className="w-full px-3 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingTicket === selectedTicket.id
                      ? "Updating..."
                      : "Reopen"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
