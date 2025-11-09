"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { Report, REPORT_STATUS, PRIORITY, ISSUE_TYPES } from "@/types/reports";
import {
  reportService,
  Comment,
  StatusHistory,
} from "@/services/reportService";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import AssignmentModal from "@/components/assignment/AssignmentModal";

interface ReportDetailsClientProps {
  user: User;
  report: Report;
}

const ReportDetailsClient: React.FC<ReportDetailsClientProps> = ({
  user,
  report,
}) => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "ai-analysis"
    | "media"
    | "image-analysis"
    | "comments"
    | "history"
  >("overview");
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Load comments and status history
  useEffect(() => {
    const loadSubcollections = async () => {
      try {
        const [commentsData, historyData] = await Promise.all([
          reportService.getComments(report.id),
          reportService.getStatusHistory(report.id),
        ]);
        setComments(commentsData);
        setStatusHistory(historyData);
      } catch (error) {
        console.error("Error loading subcollections:", error);
      }
    };

    loadSubcollections();
  }, [report.id]);

  // Add assignment handler functions
  const handleAssignReport = async (employeeId: string, notes: string) => {
    try {
      setIsAssigning(true);
      await reportService.assignReport(
        report.id,
        employeeId,
        {
          uid: user.uid,
          email: user.email || "Unknown",
          userType: user.userType,
        },
        notes
      );

      // Refresh the page to show updated assignment
      router.refresh();
    } catch (error) {
      console.error("Error assigning report:", error);
      alert("Failed to assign report");
      throw error;
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignReport = async () => {
    if (!confirm("Are you sure you want to unassign this report?")) return;

    try {
      setIsAssigning(true);
      await reportService.unassignReport(report.id, {
        uid: user.uid,
        email: user.email || "Unknown",
        userType: user.userType,
      });

      // Refresh the page to show updated assignment
      router.refresh();
    } catch (error) {
      console.error("Error unassigning report:", error);
      alert("Failed to unassign report");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/reports");
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await reportService.updateReportStatus(
        report.id,
        newStatus,
        {
          uid: user.uid,
          email: user.email || "Unknown",
          userType: user.userType,
        },
        `Status changed by ${user.userType}`
      );

      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const comment = await reportService.addComment(report.id, {
        userId: user.uid,
        userEmail: user.email || "Unknown",
        userType: user.userType,
        content: newComment.trim(),
      });

      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Status and priority badge components
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      submitted: { color: "bg-yellow-100 text-yellow-800", icon: "📥" },
      ai_processed: { color: "bg-blue-100 text-blue-800", icon: "🤖" },
      under_review: { color: "bg-purple-100 text-purple-800", icon: "👀" },
      in_progress: { color: "bg-orange-100 text-orange-800", icon: "🔄" },
      resolved: { color: "bg-green-100 text-green-800", icon: "✅" },
      closed: { color: "bg-gray-100 text-gray-800", icon: "🔒" },
      rejected: { color: "bg-red-100 text-red-800", icon: "❌" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      icon: "📋",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${config.color}`}
      >
        <span className="mr-2">{config.icon}</span>
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const priorityConfig = {
      critical: { color: "bg-red-100 text-red-800", icon: "🚨" },
      high: { color: "bg-orange-100 text-orange-800", icon: "⚠️" },
      medium: { color: "bg-yellow-100 text-yellow-800", icon: "🔶" },
      low: { color: "bg-green-100 text-green-800", icon: "✅" },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || {
      color: "bg-gray-100 text-gray-800",
      icon: "📋",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${config.color}`}
      >
        <span className="mr-2">{config.icon}</span>
        {priority.toUpperCase()}
      </span>
    );
  };

  const IssueTypeBadge = ({ issueType }: { issueType: string }) => {
    const issueConfig = {
      pothole: { color: "bg-brown-100 text-brown-800", icon: "🕳️" },
      water_leak: { color: "bg-cyan-100 text-cyan-800", icon: "💧" },
      garbage: { color: "bg-gray-100 text-gray-800", icon: "🗑️" },
      street_light: { color: "bg-yellow-100 text-yellow-800", icon: "💡" },
      traffic_signal: { color: "bg-red-100 text-red-800", icon: "🚦" },
      drainage: { color: "bg-blue-100 text-blue-800", icon: "🌊" },
      vegetation: { color: "bg-green-100 text-green-800", icon: "🌿" },
      other: { color: "bg-purple-100 text-purple-800", icon: "📋" },
    };

    const config = issueConfig[issueType as keyof typeof issueConfig] || {
      color: "bg-gray-100 text-gray-800",
      icon: "📋",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${config.color}`}
      >
        <span className="mr-2">{config.icon}</span>
        {issueType.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  // Confidence meter component
  const ConfidenceMeter = ({
    score,
    label,
  }: {
    score: number;
    label: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{(score * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${
            score > 0.8
              ? "bg-green-500"
              : score > 0.6
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${score * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // Map component
  const ReportMap = ({
    location,
    address,
  }: {
    location: any;
    address: string;
  }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🗺️</span>
        Location Map
      </h3>
      <div className="h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg relative overflow-hidden">
        {/* Mock Map - Replace with actual map integration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">📍</div>
            <p className="text-lg font-semibold">Report Location</p>
            <p className="text-sm opacity-90 mt-2">{address}</p>
            <div className="mt-4 text-xs bg-white bg-opacity-20 rounded-lg p-3">
              <p>Lat: {location.latitude.toFixed(6)}</p>
              <p>Lng: {location.longitude.toFixed(6)}</p>
              {location.geohash && <p>Geohash: {location.geohash}</p>}
            </div>
          </div>
        </div>

        {/* Map marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-municipal-primary to-municipal-secondary rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              ← Back to Reports
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{report.title}</h1>
              <p className="text-blue-100">Report ID: {report.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={report.status} />
            <PriorityBadge priority={report.priority} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() => handleStatusChange("in_progress")}
            disabled={isUpdatingStatus || report.status === "in_progress"}
          >
            🚀 Start Work
          </Button>
          <Button
            variant="success"
            onClick={() => handleStatusChange("resolved")}
            disabled={isUpdatingStatus || report.status === "resolved"}
          >
            ✅ Mark Resolved
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleStatusChange("under_review")}
            disabled={isUpdatingStatus}
          >
            👀 Under Review
          </Button>
          <Button
            variant="danger"
            onClick={() => handleStatusChange("rejected")}
            disabled={isUpdatingStatus}
          >
            ❌ Reject
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <nav className="flex space-x-8 px-6 border-b border-gray-200">
          {[
            { id: "overview", name: "📋 Overview", icon: "📋" },
            { id: "ai-analysis", name: "🤖 AI Analysis", icon: "🤖" },
            { id: "image-analysis", name: `🖼️ Image Analysis`, icon: "🖼️" },
            {
              id: "media",
              name: `🖼️ Media (${report.imageURLs?.length || 0})`,
              icon: "🖼️",
            },
            {
              id: "comments",
              name: `💬 Comments (${comments.length})`,
              icon: "💬",
            },
            { id: "history", name: "📊 Status History", icon: "📊" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-municipal-secondary text-municipal-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">📄</span>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Title
                      </label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {report.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Issue Type
                      </label>
                      <div className="mt-1">
                        <IssueTypeBadge issueType={report.issueType} />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <p className="mt-2 text-gray-700 bg-white p-4 rounded-lg border">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="mr-2">👥</span>
                      Assignment
                    </span>
                    <div className="flex space-x-2">
                      {report.assignedTo ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsAssignmentModalOpen(true)}
                            disabled={isAssigning}
                          >
                            🔄 Reassign
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={handleUnassignReport}
                            disabled={isAssigning}
                          >
                            ❌ Unassign
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => setIsAssignmentModalOpen(true)}
                          disabled={isAssigning}
                        >
                          👥 Assign to Employee
                        </Button>
                      )}
                    </div>
                  </h3>

                  {report.assignedTo ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {report.assignedTo
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {report.assignedTo}
                            </p>
                            <p className="text-sm text-gray-600">
                              Assigned Employee
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Assigned</p>
                          <p className="font-medium text-gray-900">
                            {report.assignedAt
                              ? new Date(report.assignedAt).toLocaleDateString()
                              : "Recently"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-4xl mb-2">👥</div>
                      <p className="text-gray-500">
                        No one assigned to this report
                      </p>
                      <p className="text-gray-400 text-sm">
                        Assign an employee to start working on it
                      </p>
                    </div>
                  )}
                </div>

                {/* Assignment & Timeline */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">👥</span>
                    Assignment & Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Assigned To
                        </label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {report.assignedTo || (
                            <span className="text-orange-600">Unassigned</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Assigned Date
                        </label>
                        <p className="text-gray-900 mt-1">
                          {report.assignedAt
                            ? new Date(report.assignedAt).toLocaleString()
                            : "Not assigned"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Created
                        </label>
                        <p className="text-gray-900 mt-1">
                          {report.createdAt.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Last Updated
                        </label>
                        <p className="text-gray-900 mt-1">
                          {report.updatedAt.toLocaleString()}
                        </p>
                      </div>
                      {report.resolvedAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Resolved
                          </label>
                          <p className="text-gray-900 mt-1">
                            {report.resolvedAt.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">⚙️</span>
                    System Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Report ID:</span>
                      <p className="font-mono text-gray-900">{report.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">User ID:</span>
                      <p className="font-mono text-gray-900">{report.userId}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Municipality:</span>
                      <p className="text-gray-900">{report.municipalityId}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">ML Status:</span>
                      <p className="text-gray-900 capitalize">
                        {report.mlProcessingStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Map */}
              <div>
                <ReportMap
                  location={report.location}
                  address={report.address}
                />
              </div>
            </div>
          )}

          {activeTab === "ai-analysis" && report.textAnalysis && (
            <div className="space-y-6">
              {/* Confidence Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-800 mb-3">
                    AI Confidence
                  </h4>
                  <ConfidenceMeter score={report.aiConfidenceScore} label="" />
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <h4 className="font-semibold text-green-800 mb-3">
                    ML Confidence
                  </h4>
                  <ConfidenceMeter score={report.mlConfidenceScore} label="" />
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <h4 className="font-semibold text-purple-800 mb-3">
                    Text Analysis
                  </h4>
                  <ConfidenceMeter
                    score={report.textAnalysis.confidence}
                    label=""
                  />
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                  <h4 className="font-semibold text-orange-800 mb-3">
                    Sentiment
                  </h4>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        report.textAnalysis.sentiment.label === "NEGATIVE"
                          ? "text-red-600"
                          : report.textAnalysis.sentiment.label === "POSITIVE"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {report.textAnalysis.sentiment.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Score:{" "}
                      {report.textAnalysis.sentiment.score > 0 ? "+" : ""}
                      {report.textAnalysis.sentiment.score}
                    </div>
                  </div>
                </div>
              </div>

              {/* ML Suggestions */}
              {report.mlSuggestions.length > 0 && (
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-2">💡</span>
                    AI Suggestions
                  </h3>
                  <div className="space-y-3">
                    {report.mlSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm">AI</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-blue-900">
                              {suggestion.type.replace("_", " ")}
                            </span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {(suggestion.confidence * 100).toFixed(0)}%
                              confidence
                            </span>
                          </div>
                          <p className="text-blue-800 mt-1">
                            Change from <strong>{suggestion.current}</strong> to{" "}
                            <strong>{suggestion.suggested}</strong>
                          </p>
                          <p className="text-sm text-blue-700 mt-2">
                            {suggestion.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Analysis Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Keywords & Entities
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {report.textAnalysis.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Category Analysis
                  </h3>
                  {report.textAnalysis.categorySuggestion && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          Suggested Category
                        </span>
                        <IssueTypeBadge
                          issueType={
                            report.textAnalysis.categorySuggestion.label
                          }
                        />
                      </div>
                      <ConfidenceMeter
                        score={
                          report.textAnalysis.categorySuggestion.confidence
                        }
                        label="Category Confidence"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "image-analysis" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  Image Classification Results
                </h3>
                <div className="text-sm text-gray-500">
                  {report.imageClassifications?.length || 0} images processed
                </div>
              </div>

              {report.imageClassifications &&
              report.imageClassifications.length > 0 ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {report.imageClassifications.length}
                      </div>
                      <div className="text-sm text-green-700">
                        Images Processed
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.max(
                          ...report.imageClassifications.map(
                            (ic) => ic.confidence * 100
                          )
                        ).toFixed(1)}
                        %
                      </div>
                      <div className="text-sm text-blue-700">
                        Highest Confidence
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {report.imageClassifications[0]?.modelVersion || "N/A"}
                      </div>
                      <div className="text-sm text-purple-700">
                        Model Version
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                      <div className="text-2xl font-bold text-orange-600">
                        {report.mlConfidenceScore * 100}%
                      </div>
                      <div className="text-sm text-orange-700">
                        Overall ML Confidence
                      </div>
                    </div>
                  </div>

                  {/* Individual Image Classifications */}
                  <div className="space-y-6">
                    {report.imageClassifications.map(
                      (classification, index) => (
                        <div
                          key={index}
                          className="bg-white border rounded-xl p-6"
                        >
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Image Preview */}
                            <div className="lg:w-1/3">
                              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                                {report.imageURLs && report.imageURLs[index] ? (
                                  <div className="text-center">
                                    <div className="text-4xl mb-2">🖼️</div>
                                    <p className="text-sm text-gray-600">
                                      Image {index + 1}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {classification.imageURL}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="text-center text-gray-400">
                                    <div className="text-4xl mb-2">📷</div>
                                    <p>Image not available</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Classification Details */}
                            <div className="lg:w-2/3 space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-lg text-gray-900">
                                    Image {classification.imageIndex + 1}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    Processed:{" "}
                                    {new Date(
                                      classification.timestamp
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {(classification.confidence * 100).toFixed(
                                      1
                                    )}
                                    %
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Confidence
                                  </div>
                                </div>
                              </div>

                              {/* Primary Prediction */}
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-blue-900">
                                    Primary Classification
                                  </span>
                                  <IssueTypeBadge
                                    issueType={classification.label}
                                  />
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-3">
                                  <div
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${
                                        classification.confidence * 100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-sm text-blue-700 mt-1">
                                  <span>0%</span>
                                  <span>
                                    {(classification.confidence * 100).toFixed(
                                      1
                                    )}
                                    %
                                  </span>
                                  <span>100%</span>
                                </div>
                              </div>

                              {/* All Predictions */}
                              <div>
                                <h5 className="font-medium text-gray-700 mb-3">
                                  All Predictions
                                </h5>
                                <div className="space-y-2">
                                  {classification.allPredictions.map(
                                    (prediction, predIndex) => (
                                      <div
                                        key={predIndex}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <IssueTypeBadge
                                            issueType={prediction.label}
                                          />
                                          <span className="text-sm text-gray-600">
                                            {prediction.label.replace("_", " ")}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                          <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                              className="bg-green-500 h-2 rounded-full"
                                              style={{
                                                width: `${
                                                  prediction.confidence * 100
                                                }%`,
                                              }}
                                            ></div>
                                          </div>
                                          <span className="text-sm font-medium text-gray-700 w-12 text-right">
                                            {(
                                              prediction.confidence * 100
                                            ).toFixed(1)}
                                            %
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Processing Metadata */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    Model Version:
                                  </span>
                                  <p className="font-mono text-gray-900">
                                    {classification.modelVersion}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Processing Time:
                                  </span>
                                  <p className="text-gray-900">
                                    {classification.processingTime}s
                                  </p>
                                </div>
                                {classification.fallback && (
                                  <div className="col-span-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      ⚠️ Fallback Classification
                                    </span>
                                  </div>
                                )}
                                {classification.error && (
                                  <div className="col-span-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      ❌ Error: {classification.error}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Consensus Analysis */}
                  {report.imageClassifications.length > 1 && (
                    <div className="bg-white border rounded-xl p-6">
                      <h4 className="text-lg font-semibold mb-4">
                        Consensus Analysis
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-3">
                            Classification Consensus
                          </h5>
                          <div className="space-y-3">
                            {(() => {
                              const labelCounts: { [key: string]: number } = {};
                              report.imageClassifications.forEach((ic) => {
                                labelCounts[ic.label] =
                                  (labelCounts[ic.label] || 0) + 1;
                              });

                              return Object.entries(labelCounts).map(
                                ([label, count]) => (
                                  <div
                                    key={label}
                                    className="flex justify-between items-center"
                                  >
                                    <IssueTypeBadge issueType={label} />
                                    <div className="flex items-center space-x-2">
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-purple-500 h-2 rounded-full"
                                          style={{
                                            width: `${
                                              (count /
                                                report.imageClassifications
                                                  .length) *
                                              100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">
                                        {count}/
                                        {report.imageClassifications.length}
                                      </span>
                                    </div>
                                  </div>
                                )
                              );
                            })()}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-3">
                            Confidence Statistics
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Average Confidence:
                              </span>
                              <span className="font-medium">
                                {(
                                  (report.imageClassifications.reduce(
                                    (sum, ic) => sum + ic.confidence,
                                    0
                                  ) /
                                    report.imageClassifications.length) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Minimum Confidence:
                              </span>
                              <span className="font-medium">
                                {Math.min(
                                  ...report.imageClassifications.map(
                                    (ic) => ic.confidence * 100
                                  )
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Maximum Confidence:
                              </span>
                              <span className="font-medium">
                                {Math.max(
                                  ...report.imageClassifications.map(
                                    (ic) => ic.confidence * 100
                                  )
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 text-lg">
                    No image classifications available
                  </p>
                  <p className="text-gray-400">
                    Image analysis has not been performed on this report
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Report Media</h3>
              {report.imageURLs && report.imageURLs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {report.imageURLs.map((url, index) => (
                    <div
                      key={index}
                      className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📷</div>
                          <p className="text-sm text-gray-600">
                            Image {index + 1}
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600">{url}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p className="text-gray-500 text-lg">
                    No images attached to this report
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Comments and History tabs remain the same as before */}
          {activeTab === "comments" && (
            <div className="space-y-6">
              {/* Add Comment Section */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-xl font-semibold mb-4">Add Comment</h3>
                <div className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="min-w-32"
                    >
                      {isSubmittingComment ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </span>
                      ) : (
                        "💬 Add Comment"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Comments ({comments.length})
                </h3>
                {comments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-gray-500 text-lg">No comments yet</p>
                    <p className="text-gray-400">
                      Be the first to add a comment
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white border rounded-xl p-6 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {comment.userEmail[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">
                              {comment.userEmail}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
                              {comment.userType}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt.toLocaleDateString()} at{" "}
                          {comment.createdAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Status History</h3>
              {statusHistory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-lg">
                    No status history available
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {statusHistory.map((history, index) => (
                    <div
                      key={history.id}
                      className="flex items-start space-x-4 p-6 bg-white border rounded-xl hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-3"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="font-semibold text-gray-900">
                              {history.changedByUser}
                            </span>
                            {history.automatic && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                🤖 Automatic
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {history.timestamp.toLocaleDateString()} at{" "}
                            {history.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mb-3">
                          {history.oldStatus && (
                            <>
                              <StatusBadge status={history.oldStatus} />
                              <span className="text-gray-400">→</span>
                            </>
                          )}
                          <StatusBadge status={history.newStatus} />
                        </div>
                        {history.notes && (
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {history.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AssignmentModal
  isOpen={isAssignmentModalOpen}
  onClose={() => setIsAssignmentModalOpen(false)}
  report={report}
  onAssign={handleAssignReport}
  currentAssignment={report.assignedTo || undefined}
/>
    </div>
  );
};

export default ReportDetailsClient;
