import { useEffect, useState } from "react";
import { Loader2, Calendar, User, Package, CreditCard, ChevronRight, Filter, Search, MoreVertical, ExternalLink, RefreshCw, AlertCircle, ShoppingBag } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatPrice, getImageUrl, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Order {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  total_amount: string | number;
  razorpay_order_id: string;
  status: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  product_name: string;
  product_images: any[];
}

export default function AdminOrders() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateLoading, setUpdateLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin, navigate]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data.data || []);
      setError("");
    } catch (err) {
      console.error("❌ Failed to fetch orders:", err);
      setError("Failed to load orders. Please ensure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdateLoading(orderId);
      await api.put(`/orders/${orderId}/status`, { status: newStatus });

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order ${orderId} updated to ${newStatus}`);
    } catch (err: any) {
      console.error("❌ Failed to update status:", err);
      toast.error(err.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdateLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
      {/* Premium Header */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-foreground flex items-center gap-2">
                <ShoppingBag className="h-8 w-8 text-primary" />
                Order Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor transactions, manage fulfillment, and view customer details.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrders}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">Retrieving master order list...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Orders Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 bg-background">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{orders.length}</p>
              </Card>
              <Card className="p-4 bg-background">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{orders.filter(o => o.status === 'PAID').length}</p>
              </Card>
              <Card className="p-4 bg-background">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">{orders.filter(o => o.status === 'PENDING').length}</p>
              </Card>
              <Card className="p-4 bg-background">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">
                  {formatPrice(orders.reduce((acc, o) => o.status === 'PAID' ? acc + Number(o.total_amount) : acc, 0))}
                </p>
              </Card>
            </div>

            {/* Desktop Table */}
            <Card className="hidden md:block overflow-hidden border-border bg-background shadow-sm rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Order / Product</th>
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Customer</th>
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="text-right p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                          No orders found in the system yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
                                <img
                                  src={getImageUrl(o.product_images)}
                                  alt={o.product_name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground leading-tight">#{o.id}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-[150px]">{o.product_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{o.customer_name || 'Anonymous'}</span>
                              <span className="text-xs text-muted-foreground">{o.customer_email}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-foreground">{formatPrice(Number(o.total_amount))}</p>
                            <p className="text-[10px] text-muted-foreground tracking-tighter uppercase font-mono">{o.razorpay_order_id || 'LOCAL_ORDER'}</p>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={cn("px-2.5 py-0.5 rounded-full capitalize text-[11px] font-bold shadow-sm", getStatusColor(o.status))}
                            >
                              {o.status.toLowerCase()}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-0.5 p-0 sm:gap-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5 underline-offset-4 decoration-muted-foreground/30 leading-none">
                                <Calendar className="h-3 w-3 shrink-0" />
                                {new Date(o.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={updateLoading === o.id}>
                                  {updateLoading === o.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(o.id, 'PAID')}>
                                  Mark as Paid
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(o.id, 'SHIPPED')}>
                                  Mark as Shipped
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(o.id, 'COMPLETED')}>
                                  Mark as Completed
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem key="cancel" className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleUpdateStatus(o.id, 'CANCELLED')}>
                                  Cancel Order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
              {orders.map((o) => (
                <Card key={o.id} className="p-4 space-y-4 overflow-hidden border-border bg-background">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                        <img src={getImageUrl(o.product_images)} alt={o.product_name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold">Order #{o.id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge className={cn("capitalize px-2 py-0", getStatusColor(o.status))}>
                      {o.status.toLowerCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Customer</p>
                      <p className="text-sm font-medium">{o.customer_name || 'Guest'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total</p>
                      <p className="text-sm font-bold">{formatPrice(Number(o.total_amount))}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleUpdateStatus(o.id, 'PAID')}>Paid</Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleUpdateStatus(o.id, 'SHIPPED')}>Ship</Button>
                    <Button variant="secondary" size="sm" className="h-8 transition-colors active:scale-95" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
