import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ShoppingCart, Package, CreditCard, RotateCw, Home } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: "Products",
      description: "Manage perfume products",
      icon: Package,
      link: "/admin/products",
      color: "bg-blue-100",
    },
    {
      title: "Inventory",
      description: "Stock & warehouse management",
      icon: BarChart3,
      link: "/admin/inventory",
      color: "bg-green-100",
    },
    {
      title: "Orders",
      description: "View & manage orders",
      icon: ShoppingCart,
      link: "/admin/orders",
      color: "bg-purple-100",
    },
    {
      title: "Payments",
      description: "Payment & refunds handling",
      icon: CreditCard,
      link: "/admin/payments",
      color: "bg-yellow-100",
    },
    {
      title: "Returns & Exchanges",
      description: "Manage returns & refunds",
      icon: RotateCw,
      link: "/admin/returns",
      color: "bg-red-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => navigate("/")} className="flex-1 sm:flex-none text-xs sm:text-sm h-9 sm:h-10">
              <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Store</span>
              <span className="sm:hidden">Store</span>
            </Button>
            <Button variant="destructive" onClick={logout} className="flex-1 sm:flex-none text-xs sm:text-sm h-9 sm:h-10">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-12 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-12">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">245</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">18</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue (This Month)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹2.5L</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.link}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(card.link)}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg">{card.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{card.description}</CardDescription>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg ${card.color}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full text-xs sm:text-sm h-8 sm:h-10" onClick={(e) => {
                    e.stopPropagation();
                    navigate(card.link);
                  }}>
                    Manage
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
