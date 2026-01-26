import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Home } from "lucide-react";

interface ReturnRequest {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "shipped" | "received" | "rejected";
  type: "return" | "exchange";
  date: string;
  qualityCheck?: "pending" | "passed" | "failed";
}

export default function AdminReturns() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ReturnRequest[]>([
    {
      id: "RET-001",
      orderId: "ORD-001",
      customer: "Rajesh Kumar",
      product: "Royal Oud Noir",
      amount: 5000,
      reason: "Product defective - fragrance leaking",
      status: "approved",
      type: "return",
      date: "2024-01-21",
      qualityCheck: "passed",
    },
    {
      id: "RET-002",
      orderId: "ORD-002",
      customer: "Priya Singh",
      product: "Jasmine Essence",
      amount: 3999,
      reason: "Wanted different fragrance",
      status: "pending",
      type: "exchange",
      date: "2024-01-23",
      qualityCheck: "pending",
    },
    {
      id: "RET-003",
      orderId: "ORD-003",
      customer: "Amit Patel",
      product: "Floral Delight",
      amount: 2999,
      reason: "Changed mind",
      status: "shipped",
      type: "return",
      date: "2024-01-24",
      qualityCheck: "passed",
    },
    {
      id: "RET-004",
      orderId: "ORD-004",
      customer: "Neha Gupta",
      product: "Fresh Citrus",
      amount: 5999,
      reason: "Product damaged during shipping",
      status: "pending",
      type: "return",
      date: "2024-01-25",
      qualityCheck: "pending",
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qualityCheckResult, setQualityCheckResult] = useState<string>("");

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    inTransit: requests.filter((r) => r.status === "shipped").length,
    completed: requests.filter((r) => r.status === "received").length,
    totalRefunds: requests
      .filter((r) => r.status === "received" || r.status === "approved")
      .reduce((sum, r) => sum + r.amount, 0),
  };

  const updateRequestStatus = (id: string, newStatus: string) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: newStatus as ReturnRequest["status"] } : req
      )
    );
  };

  const handleQualityCheck = (request: ReturnRequest) => {
    setSelectedRequest(request);
    setQualityCheckResult(request.qualityCheck || "pending");
    setIsDialogOpen(true);
  };

  const handleSaveQualityCheck = () => {
    if (!selectedRequest) return;

    setRequests(
      requests.map((req) =>
        req.id === selectedRequest.id
          ? { ...req, qualityCheck: qualityCheckResult as any }
          : req
      )
    );
    setIsDialogOpen(false);
    setSelectedRequest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "received":
        return "bg-green-200 text-green-900";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQualityCheckColor = (result?: string) => {
    if (!result || result === "pending")
      return "bg-yellow-100 text-yellow-800";
    if (result === "passed") return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Returns & Exchanges
          </h1>
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")} className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
            <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                In Transit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.inTransit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Estimated Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold">₹{stats.totalRefunds.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Return Requests */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Return & Exchange Requests</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage all customer return and exchange requests
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Request ID</TableHead>
                      <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Order ID</TableHead>
                      <TableHead className="hidden md:table-cell text-xs sm:text-sm">Customer</TableHead>
                      <TableHead className="text-xs sm:text-sm">Product</TableHead>
                      <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Type</TableHead>
                      <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Reason</TableHead>
                      <TableHead className="text-xs sm:text-sm">Check</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{request.id}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{request.orderId}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm">{request.customer}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{request.product}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium capitalize whitespace-nowrap ${
                              request.type === "return"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {request.type}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{request.reason}</TableCell>
                        <TableCell>
                          <Dialog
                            open={
                              isDialogOpen && selectedRequest?.id === request.id
                            }
                            onOpenChange={(open) => {
                              if (!open) {
                                setIsDialogOpen(false);
                                setSelectedRequest(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQualityCheck(request)}
                                className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                              >
                                <span
                                  className={`px-1 py-0.5 rounded text-xs font-medium capitalize ${getQualityCheckColor(
                                    request.qualityCheck
                                  )}`}
                                >
                                  {request.qualityCheck === "passed"
                                    ? "✓"
                                    : request.qualityCheck === "failed"
                                    ? "✗"
                                    : "?"}
                                </span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                              <DialogHeader>
                                <DialogTitle className="text-lg sm:text-xl">Quality Check</DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm">
                                  {request.product} - {request.id}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs sm:text-sm font-medium">Result</label>
                                <Select
                                  value={qualityCheckResult}
                                  onValueChange={setQualityCheckResult}
                                >
                                  <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="passed">
                                      Passed - Acceptable
                                    </SelectItem>
                                    <SelectItem value="failed">
                                      Failed - Damaged/Defective
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex gap-2 pt-4">
                                <Button
                                  className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                                  onClick={handleSaveQualityCheck}
                                >
                                  Save Result
                                </Button>
                                <Button
                                  className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                                  variant="outline"
                                  onClick={() => setIsDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium capitalize whitespace-nowrap ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={request.status}
                          onValueChange={(value) =>
                            updateRequestStatus(request.id, value)
                          }
                        >
                          <SelectTrigger className="w-20 sm:w-32 text-xs sm:text-sm h-8 sm:h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="received">Received</SelectItem>
                            <SelectItem value="rejected">Reject</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Return Reason Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mt-6 sm:mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Top Return Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { reason: "Product defective", count: 3 },
                  { reason: "Changed mind", count: 2 },
                  { reason: "Damaged during shipping", count: 2 },
                  { reason: "Different from description", count: 1 },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">{item.reason}</span>
                    <span className="font-semibold text-xs sm:text-sm">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Request Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "Returns",
                    count: requests.filter((r) => r.type === "return").length,
                    color: "bg-blue-500",
                  },
                  {
                    type: "Exchanges",
                    count: requests.filter((r) => r.type === "exchange").length,
                    color: "bg-purple-500",
                  },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs sm:text-sm font-medium">{item.type}</span>
                      <span className="font-semibold text-xs sm:text-sm">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full`}
                        style={{
                          width: `${(item.count / stats.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
