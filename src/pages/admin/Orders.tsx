import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
  date: string;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      customer: "Rajesh Kumar",
      email: "rajesh@example.com",
      amount: 15999,
      status: "delivered",
      items: 3,
      date: "2024-01-20",
    },
    {
      id: "ORD-002",
      customer: "Priya Singh",
      email: "priya@example.com",
      amount: 8999,
      status: "shipped",
      items: 2,
      date: "2024-01-22",
    },
    {
      id: "ORD-003",
      customer: "Amit Patel",
      email: "amit@example.com",
      amount: 24999,
      status: "processing",
      items: 4,
      date: "2024-01-25",
    },
    {
      id: "ORD-004",
      customer: "Neha Gupta",
      email: "neha@example.com",
      amount: 5999,
      status: "pending",
      items: 1,
      date: "2024-01-26",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus as Order["status"] }
          : order
      )
    );
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders.reduce((sum, o) => sum + o.amount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
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
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Pending Orders
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
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Orders</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage all customer orders
              </CardDescription>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                      <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Customer</TableHead>
                      <TableHead className="text-xs sm:text-sm">Items</TableHead>
                      <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="hidden md:table-cell text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{order.id}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div>
                            <p className="font-medium text-xs sm:text-sm">{order.customer}</p>
                            <p className="text-xs text-gray-500">{order.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{order.items}</TableCell>
                        <TableCell className="font-semibold text-xs sm:text-sm">
                          ₹{order.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm">{order.date}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              updateOrderStatus(order.id, value)
                            }
                          >
                            <SelectTrigger className="w-20 sm:w-32 text-xs sm:text-sm h-8 sm:h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
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

        {/* Order Status Distribution */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 mt-6 sm:mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {stats.processing}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Shipped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.shipped}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {stats.delivered}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl sm:text-2xl font-bold text-red-600">0</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
