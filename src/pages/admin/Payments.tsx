import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Home } from "lucide-react";

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: "card" | "upi" | "wallet" | "netbanking";
  status: "completed" | "pending" | "failed";
  date: string;
  customer: string;
}

interface Refund {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  type: "full" | "partial" | "wallet" | "store-credit";
  status: "pending" | "approved" | "processed" | "rejected";
  reason: string;
  date: string;
}

export default function AdminPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "PAY-001",
      orderId: "ORD-001",
      amount: 15999,
      method: "card",
      status: "completed",
      date: "2024-01-20",
      customer: "Rajesh Kumar",
    },
    {
      id: "PAY-002",
      orderId: "ORD-002",
      amount: 8999,
      method: "upi",
      status: "completed",
      date: "2024-01-22",
      customer: "Priya Singh",
    },
    {
      id: "PAY-003",
      orderId: "ORD-003",
      amount: 24999,
      method: "netbanking",
      status: "completed",
      date: "2024-01-25",
      customer: "Amit Patel",
    },
    {
      id: "PAY-004",
      orderId: "ORD-004",
      amount: 5999,
      method: "card",
      status: "pending",
      date: "2024-01-26",
      customer: "Neha Gupta",
    },
  ]);

  const [refunds, setRefunds] = useState<Refund[]>([
    {
      id: "REF-001",
      paymentId: "PAY-001",
      orderId: "ORD-001",
      amount: 3000,
      type: "partial",
      status: "processed",
      reason: "Defective product",
      date: "2024-01-21",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"payments" | "refunds">("payments");
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundData, setRefundData] = useState({
    amount: "",
    type: "full",
    reason: "",
  });

  const handleCreateRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundData({
      amount: payment.amount.toString(),
      type: "full",
      reason: "",
    });
    setIsRefundDialogOpen(true);
  };

  const handleSaveRefund = () => {
    if (!selectedPayment || !refundData.amount || !refundData.reason) {
      alert("Please fill in all fields");
      return;
    }

    const newRefund: Refund = {
      id: "REF-" + String(refunds.length + 1).padStart(3, "0"),
      paymentId: selectedPayment.id,
      orderId: selectedPayment.orderId,
      amount: parseFloat(refundData.amount),
      type: refundData.type as Refund["type"],
      status: "pending",
      reason: refundData.reason,
      date: new Date().toISOString().split("T")[0],
    };

    setRefunds([...refunds, newRefund]);
    setIsRefundDialogOpen(false);
    setSelectedPayment(null);
  };

  const updateRefundStatus = (refundId: string, newStatus: string) => {
    setRefunds(
      refunds.map((refund) =>
        refund.id === refundId
          ? { ...refund, status: newStatus as Refund["status"] }
          : refund
      )
    );
  };

  const stats = {
    totalRevenue: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
    completedTransactions: payments.filter((p) => p.status === "completed").length,
    pendingPayments: payments.filter((p) => p.status === "pending").length,
    totalRefunds: refunds.reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payments & Refunds</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold">{stats.completedTransactions}</p>
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
                {stats.pendingPayments}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Total Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">
                ₹{stats.totalRefunds.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-6">
          <Button
            variant={activeTab === "payments" ? "default" : "outline"}
            onClick={() => setActiveTab("payments")}
            className="text-xs sm:text-sm h-9 sm:h-10"
          >
            Payments
          </Button>
          <Button
            variant={activeTab === "refunds" ? "default" : "outline"}
            onClick={() => setActiveTab("refunds")}
            className="text-xs sm:text-sm h-9 sm:h-10"
          >
            Refunds ({refunds.length})
          </Button>
        </div>

        {/* Payments Section */}
        {activeTab === "payments" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Payment Transactions</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                All payment transactions and their statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Payment ID</TableHead>
                        <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Order ID</TableHead>
                        <TableHead className="hidden md:table-cell text-xs sm:text-sm">Customer</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Method</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-xs sm:text-sm">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">{payment.id}</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{payment.orderId}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs sm:text-sm">{payment.customer}</TableCell>
                          <TableCell className="font-semibold text-xs sm:text-sm">
                            ₹{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell capitalize text-xs sm:text-sm">{payment.method}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                                payment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Dialog
                              open={isRefundDialogOpen && selectedPayment?.id === payment.id}
                              onOpenChange={(open) => {
                              if (!open) {
                                setIsRefundDialogOpen(false);
                                setSelectedPayment(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCreateRefund(payment)}
                                className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                              >
                                Refund
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                              <DialogHeader>
                                <DialogTitle className="text-lg sm:text-xl">Process Refund</DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm">
                                  {selectedPayment?.orderId}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div>
                                  <label className="text-xs sm:text-sm font-medium">
                                    Refund Amount (₹)
                                  </label>
                                  <Input
                                    type="number"
                                    value={refundData.amount}
                                    onChange={(e) =>
                                      setRefundData({
                                        ...refundData,
                                        amount: e.target.value,
                                      })
                                    }
                                    max={selectedPayment?.amount || 0}
                                    className="text-xs sm:text-sm h-9 sm:h-10"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs sm:text-sm font-medium">Type</label>
                                  <Select
                                    value={refundData.type}
                                    onValueChange={(value) =>
                                      setRefundData({ ...refundData, type: value })
                                    }
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="full">Full Refund</SelectItem>
                                      <SelectItem value="partial">
                                        Partial Refund
                                      </SelectItem>
                                      <SelectItem value="wallet">
                                        Wallet Credit
                                      </SelectItem>
                                      <SelectItem value="store-credit">
                                        Store Credit
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <label className="text-xs sm:text-sm font-medium">Reason</label>
                                  <textarea
                                    value={refundData.reason}
                                    onChange={(e) =>
                                      setRefundData({
                                        ...refundData,
                                        reason: e.target.value,
                                      })
                                    }
                                    placeholder="Enter refund reason"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
                                  />
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button className="flex-1 text-xs sm:text-sm h-9 sm:h-10" onClick={handleSaveRefund}>
                                    Process Refund
                                  </Button>
                                  <Button
                                    className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                                    variant="outline"
                                    onClick={() => setIsRefundDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Refunds Section */}
        {activeTab === "refunds" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Refund Requests</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage all refund requests and approvals
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Refund ID</TableHead>
                        <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Order ID</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="hidden md:table-cell text-xs sm:text-sm">Type</TableHead>
                        <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Reason</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-xs sm:text-sm">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {refunds.map((refund) => (
                        <TableRow key={refund.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">{refund.id}</TableCell>
                          <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{refund.orderId}</TableCell>
                          <TableCell className="font-semibold text-xs sm:text-sm">
                            ₹{refund.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="hidden md:table-cell capitalize text-xs sm:text-sm">
                            {refund.type.replace("-", " ")}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{refund.reason}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium capitalize whitespace-nowrap ${
                                refund.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : refund.status === "approved"
                                ? "bg-blue-100 text-blue-800"
                                : refund.status === "processed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                              {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {refund.status === "pending" && (
                              <Select
                                value={refund.status}
                                onValueChange={(value) =>
                                  updateRefundStatus(refund.id, value)
                                }
                              >
                                <SelectTrigger className="w-20 sm:w-32 text-xs sm:text-sm h-8 sm:h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="approved">Approve</SelectItem>
                                  <SelectItem value="rejected">Reject</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
