import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { LogOut, Package, ShoppingCart, TrendingUp, BarChart3, Star, Loader2, AlertCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import { formatPrice } from "@/lib/utils";

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenue: string | number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/dashboard/stats');
        setStats(response.data.data);
      } catch (err: any) {
        console.error('❌ Failed to fetch dashboard stats:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <AdminLayout title="System Overview" activeTab="dashboard">
      <div className="space-y-8">
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Products Card */}
          <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalProducts || 0}</p>
                <p className="text-xs text-green-500 mt-2 font-medium">{stats?.activeProducts || 0} active</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          {/* Total Orders Card */}
          <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalOrders || 0}</p>
                <p className="text-xs text-blue-500 mt-2 font-medium">{stats?.paidOrders || 0} paid</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </Card>

          {/* Pending Orders Card */}
          <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-3xl font-bold mt-2">{stats?.pendingOrders || 0}</p>
                <p className="text-xs text-yellow-500 mt-2 font-medium">Requiring attention</p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-xl">
                <ShoppingCart className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </Card>

          {/* Total Revenue Card */}
          <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold mt-2 tracking-tight">
                  {formatPrice(Number(stats?.totalRevenue || 0))}
                </p>
                <p className="text-xs text-green-500 mt-2 font-medium">Cumulative earnings</p>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Access Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 font-display">Management Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Products Management */}
            <Card className="p-6 hover:shadow-md transition-all cursor-pointer hover:border-primary border-transparent border-2 bg-card/50"
              onClick={() => navigate("/admin/products")}
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-xl">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Inventory</h3>
                  <p className="text-sm text-muted-foreground">Manage details & stock</p>
                </div>
              </div>
            </Card>

            {/* Orders Management */}
            <Card className="p-6 hover:shadow-md transition-all cursor-pointer hover:border-blue-500 border-transparent border-2 bg-card/50"
              onClick={() => navigate("/admin/orders")}
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 p-4 rounded-xl">
                  <ShoppingCart className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Orders</h3>
                  <p className="text-sm text-muted-foreground">Track & update status</p>
                </div>
              </div>
            </Card>

            {/* Reviews Management */}
            <Card className="p-6 hover:shadow-md transition-all cursor-pointer hover:border-yellow-500 border-transparent border-2 bg-card/50"
              onClick={() => navigate("/admin/reviews")}
            >
              <div className="flex items-center gap-4">
                <div className="bg-yellow-500/10 p-4 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Reviews</h3>
                  <p className="text-sm text-muted-foreground">Monitor feedback</p>
                </div>
              </div>
            </Card>

            {/* Placeholder for Analytics */}
            <Card className="p-6 opacity-60 border-dashed border-2 bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="bg-muted p-4 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Analytics</h3>
                  <p className="text-sm text-muted-foreground italic">Coming Soon</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* System Health / Alerts */}
        {stats?.outOfStock ? stats.outOfStock > 0 : false && (
          <div className="mt-12 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">
              Alert: {stats?.outOfStock} products are currently out of stock.
              <button
                onClick={() => navigate("/admin/products?filter=out-of-stock")}
                className="underline ml-2 hover:text-amber-600 font-bold"
              >
                View Inventory
              </button>
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
