import { motion } from "framer-motion";
import { ArrowLeft, Package, Download, Loader2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: OrderItem[];
  trackingNumber?: string;
  customerEmail?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  raw_order?: any;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PAID: { label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400" },
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400" },
  PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400" },
  SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400" },
};

export default function Orders() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const invoiceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orders/my');
        const rawOrders = response.data?.data || [];

        // Map backend orders to frontend Order interface
        const mappedOrders: Order[] = rawOrders.map((o: any) => ({
          id: `ORD-${new Date(o.created_at).getFullYear()}-${String(o.id).padStart(3, '0')}`,
          date: o.created_at,
          total: Number(o.total_amount),
          status: o.status,
          items: [
            {
              id: String(o.product_id),
              name: o.product_name || 'Product',
              quantity: o.quantity || 1,
              price: Number(o.total_amount) / (o.quantity || 1),
              image: o.product_images && o.product_images[0]?.image_url
            }
          ],
          trackingNumber: o.razorpay_order_id,
          customerEmail: o.customer_email,
          firstName: o.firstName,
          lastName: o.lastName,
          address: o.address,
          city: o.city,
          state: o.state,
          postal_code: o.postal_code,
          country: o.country,
          phone: o.phone,
          raw_order: o
        }));

        setOrders(mappedOrders);
      } catch (error: any) {
        console.error('❌ Failed to fetch orders:', error);
        toast.error('Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const handleDownloadInvoice = async (order: Order) => {
    try {
      setDownloadingId(order.id);
      const invoiceElement = invoiceRefs.current[order.id];
      
      if (!invoiceElement) {
        toast.error("Invoice template not found");
        return;
      }

      // Generate PDF from invoice HTML
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Add additional pages if content is longer
      let heightLeft = imgHeight - 297; // A4 height in mm
      let position = 0;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`invoice-${order.id}.pdf`);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Fetching your orders...</p>
              </div>
            ) : orders.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                {orders.map((order) => (
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
                        <Badge className={(statusConfig[order.status] || statusConfig.PENDING).color}>
                          {(statusConfig[order.status] || statusConfig.PENDING).label}
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
                          {item.image && (
                            <div className="h-20 w-20 rounded bg-secondary flex-shrink-0 overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Quantity: {item.quantity}
                            </p>
                            <p className="font-semibold text-primary">
                              {formatPrice(item.price)} per unit
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
                      <Button 
                        variant="outline" 
                        className="gap-2" 
                        onClick={() => handleDownloadInvoice(order)}
                        disabled={downloadingId === order.id}
                      >
                        <Download className="h-4 w-4" />
                        {downloadingId === order.id ? "Generating..." : "Download Invoice"}
                      </Button>
                    </div>

                    {/* Hidden Invoice Template for PDF Generation */}
                    <div 
                      ref={(el) => { invoiceRefs.current[order.id] = el; }}
                      style={{ display: "none" }}
                      className="p-8 bg-white text-black"
                    >
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="border-b pb-6">
                          <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
                          <p className="text-gray-600">{order.id}</p>
                        </div>

                        {/* Company Info & Invoice Details */}
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h3 className="font-bold text-sm mb-2">FROM:</h3>
                            <p className="font-bold">Bhatkar & Co</p>
                            <p className="text-sm text-gray-600">Fine Perfumery</p>
                            <p className="text-sm text-gray-600">R102, Moregaon 90 Feet Road</p>
                            <p className="text-sm text-gray-600">Nalasopara East, Mumbai – 401209</p>
                            <p className="text-sm text-gray-600">Maharashtra, India</p>
                            <p className="text-sm text-gray-600 mt-2">+91 98765 43210</p>
                            <p className="text-sm text-gray-600">info@bhatkarcco.com</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-sm mb-2">BILL TO:</h3>
                            <p className="font-bold">{order.firstName} {order.lastName}</p>
                            <p className="text-sm text-gray-600">{order.address}</p>
                            <p className="text-sm text-gray-600">{order.city}, {order.state} {order.postal_code}</p>
                            <p className="text-sm text-gray-600">{order.country}</p>
                            <p className="text-sm text-gray-600 mt-2">{order.phone}</p>
                            <p className="text-sm text-gray-600">{order.customerEmail}</p>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-2 gap-8 text-sm">
                          <div>
                            <p className="text-gray-600">Invoice Date:</p>
                            <p className="font-bold">{new Date(order.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Order ID:</p>
                            <p className="font-bold">{order.id}</p>
                          </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-800">
                              <th className="text-left py-2 font-bold">Description</th>
                              <th className="text-right py-2 font-bold">Quantity</th>
                              <th className="text-right py-2 font-bold">Unit Price</th>
                              <th className="text-right py-2 font-bold">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item) => (
                              <tr key={item.id} className="border-b border-gray-300">
                                <td className="py-3">{item.name}</td>
                                <td className="text-right">{item.quantity}</td>
                                <td className="text-right">{formatPrice(item.price)}</td>
                                <td className="text-right font-bold">{formatPrice(item.price * item.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end">
                          <div className="w-64">
                            <div className="flex justify-between py-2 border-t-2 border-gray-800">
                              <span className="font-bold">Total Amount:</span>
                              <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-gray-100 p-4 rounded">
                          <h3 className="font-bold mb-2">Payment Status:</h3>
                          <p className="text-sm">
                            Status: <span className="font-bold uppercase">{order.status}</span>
                          </p>
                          {order.trackingNumber && (
                            <p className="text-sm mt-1">
                              Reference ID: <span className="font-bold">{order.trackingNumber}</span>
                            </p>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-4 text-center text-xs text-gray-600">
                          <p>Thank you for your purchase!</p>
                          <p>If you have any questions, please contact us at info@bhatkarcco.com</p>
                        </div>
                      </div>
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
