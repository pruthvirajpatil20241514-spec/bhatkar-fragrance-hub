import { motion } from "framer-motion";
import { ArrowLeft, Package, Download, Eye } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  date: string;
  total: number;
  status: "completed" | "pending" | "processing" | "shipped" | "cancelled";
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  trackingNumber?: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-2024-001",
    date: "2024-01-20",
    total: 4999,
    status: "completed",
    items: [
      {
        id: "1",
        name: "Royal Oud Noir",
        quantity: 1,
        price: 4999,
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
    },
    trackingNumber: "TRK-2024-123456",
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-15",
    total: 7398,
    status: "shipped",
    items: [
      {
        id: "2",
        name: "Velvet Rose Garden",
        quantity: 2,
        price: 3499,
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
    },
    trackingNumber: "TRK-2024-789012",
  },
];

const statusConfig = {
  completed: { label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400" },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400" },
};

export default function Orders() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-8 md:py-12 border-b border-border/50"
        >
          <div className="container">
            <Link
              to="/shop"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              My Orders
            </h1>
            <p className="text-muted-foreground mt-3">
              View your order history, tracking information, and invoices
            </p>
          </div>
        </motion.section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container max-w-4xl">
            {MOCK_ORDERS.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                {MOCK_ORDERS.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-soft hover:shadow-medium transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{order.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Ordered on {new Date(order.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <Badge className={statusConfig[order.status].color}>
                          {statusConfig[order.status].label}
                        </Badge>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6 pb-6 border-b border-border/50">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4 mb-4 last:mb-0">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Quantity: {item.quantity}
                            </p>
                            <p className="font-semibold text-primary">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Info */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">
                          Shipping Address
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          <span className="text-foreground font-semibold block">
                            {order.shippingAddress.name}
                          </span>
                          {order.shippingAddress.address}
                          <br />
                          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                          {order.shippingAddress.zipCode}
                        </p>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">
                            Tracking Number
                          </h4>
                          <p className="text-sm font-mono bg-muted p-3 rounded text-foreground">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
                      <Button variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Invoice
                      </Button>
                      {order.status === "shipped" && (
                        <Button variant="outline" className="gap-2">
                          <Package className="h-4 w-4" />
                          Track Package
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="py-20 text-center"
              >
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-8">
                  Start shopping to create your first order
                </p>
                <Link to="/shop">
                  <Button>Browse Perfumes</Button>
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
