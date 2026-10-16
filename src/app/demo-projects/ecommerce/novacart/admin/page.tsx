"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  RotateCcw,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowLeft,
  X,
  Filter,
  Layers,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  Product,
  NOVACART_CATEGORIES,
  formatPrice,
} from "@/data/novacart-data";
import {
  DemoOrder,
  DemoOrderStatus,
  DemoCustomer,
  getStoredDemoOrders,
  saveStoredDemoOrders,
  getStoredDemoProducts,
  saveStoredDemoProducts,
  resetDemoStoreData,
  SEED_DEMO_CUSTOMERS,
} from "@/data/novacart-store-data";

export default function NovaCartAdminPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "orders" | "customers" | "inventory"
  >("overview");

  // State loaded from localStorage
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [customers, setCustomers] = useState<DemoCustomer[]>(SEED_DEMO_CUSTOMERS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderSearch, setOrderSearch] = useState("");

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<DemoOrder | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New/Edit product form state
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Fashion Accessories",
    price: 1999,
    compareAtPrice: 2499,
    stockStatus: "In Stock" as "In Stock" | "Low Stock" | "Sample Stock Only",
    shortDescription: "",
    fullDescription: "",
    image: "/images/demo-projects/novacart/watch-matte-chrono.jpg",
  });

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load from localStorage
  const refreshData = useCallback(() => {
    setProducts(getStoredDemoProducts());
    setOrders(getStoredDemoOrders());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle Demo Reset
  const handleResetData = () => {
    resetDemoStoreData();
    refreshData();
    setShowResetConfirm(false);
    notify("Demonstration store reset to default state.");
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
    const lowStockCount = products.filter(
      (p) => p.stockStatus === "Low Stock" || p.stockStatus === "Sample Stock Only"
    ).length;
    const pendingOrdersCount = orders.filter(
      (o) => o.status === "PENDING" || o.status === "PROCESSING"
    ).length;

    return {
      totalProducts: products.length,
      totalOrders,
      totalRevenue,
      lowStockCount,
      pendingOrdersCount,
    };
  }, [products, orders]);

  // Order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: DemoOrderStatus) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    saveStoredDemoOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    notify(`Order ${orderId} updated to ${newStatus}`);
  };

  // Open Edit Product Modal
  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsCreatingProduct(false);
    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || prod.price,
      stockStatus: prod.stockStatus,
      shortDescription: prod.shortDescription,
      fullDescription: prod.fullDescription,
      image: prod.images[0] || "/images/demo-projects/novacart/watch-matte-chrono.jpg",
    });
  };

  // Open Create Product Modal
  const openCreateProduct = () => {
    setEditingProduct(null);
    setIsCreatingProduct(true);
    setProductForm({
      name: "",
      category: "Fashion Accessories",
      price: 2999,
      compareAtPrice: 3499,
      stockStatus: "In Stock",
      shortDescription: "Precision-crafted everyday lifestyle essential.",
      fullDescription: "Constructed with premium materials and ergonomic design.",
      image: "/images/demo-projects/novacart/watch-matte-chrono.jpg",
    });
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: productForm.name,
              category: productForm.category,
              categorySlug: productForm.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              price: Number(productForm.price),
              compareAtPrice: Number(productForm.compareAtPrice),
              stockStatus: productForm.stockStatus,
              shortDescription: productForm.shortDescription,
              fullDescription: productForm.fullDescription,
              images: [productForm.image, ...p.images.slice(1)],
            }
          : p
      );
      setProducts(updated);
      saveStoredDemoProducts(updated);
      notify(`Product "${productForm.name}" updated successfully.`);
    } else {
      const newId = `nc-custom-${Date.now().toString(36)}`;
      const newSlug = productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newProd: Product = {
        id: newId,
        name: productForm.name,
        slug: newSlug,
        category: productForm.category,
        categorySlug: productForm.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        shortDescription: productForm.shortDescription,
        fullDescription: productForm.fullDescription,
        price: Number(productForm.price),
        compareAtPrice: Number(productForm.compareAtPrice),
        currency: "INR",
        images: [productForm.image],
        imageAlt: productForm.name,
        tags: ["demo", "custom"],
        stockStatus: productForm.stockStatus,
        isFeatured: false,
        isNewArrival: true,
        sampleRating: 4.8,
        sampleReviewCount: 12,
        specs: [{ label: "Material", value: "Premium Grade Alloy / Leather" }],
        highlights: ["Sample Custom Specimen", "1-Year Warranty Included"],
      };
      const updated = [newProd, ...products];
      setProducts(updated);
      saveStoredDemoProducts(updated);
      notify(`Product "${productForm.name}" created successfully.`);
    }

    setEditingProduct(null);
    setIsCreatingProduct(false);
  };

  // Delete Product
  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    const updated = products.filter((p) => p.id !== productToDelete.id);
    setProducts(updated);
    saveStoredDemoProducts(updated);
    notify(`Product "${productToDelete.name}" removed from catalog.`);
    setProductToDelete(null);
  };

  // Toggle Stock Status
  const handleToggleStockStatus = (prod: Product) => {
    const nextStatus: "In Stock" | "Low Stock" | "Sample Stock Only" =
      prod.stockStatus === "In Stock"
        ? "Low Stock"
        : prod.stockStatus === "Low Stock"
        ? "Sample Stock Only"
        : "In Stock";
    const updated = products.map((p) =>
      p.id === prod.id ? { ...p, stockStatus: nextStatus } : p
    );
    setProducts(updated);
    saveStoredDemoProducts(updated);
    notify(`${prod.name} status: ${nextStatus}`);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory =
        productCategoryFilter === "ALL" || p.category === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus =
        orderStatusFilter === "ALL" || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] p-8 flex items-center justify-center text-xs text-[#696D66]">
        Loading Axivon Commerce Admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#1C1D1A] font-sans antialiased pb-20">
      {/* Top Banner: Sandbox Notice */}
      <div className="bg-[#1C1D1A] text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-[#343630]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#D8F16A] animate-pulse" />
          <span className="font-bold tracking-wider uppercase text-[10px] text-[#D8F16A]">
            Sandbox Environment
          </span>
          <span className="text-[#A0A49C] hidden sm:inline">
            · Axivon Commerce Demonstration Admin Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Demo Data</span>
          </button>

          <Link
            href="/demo-projects/ecommerce/novacart"
            className="inline-flex items-center gap-1.5 rounded bg-[#D8F16A] text-[#1C1D1A] px-2.5 py-1 text-[11px] font-bold hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </div>

      {/* Main Admin Header */}
      <div className="bg-white border-b border-[#DCDDD5] px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1C1D1A] flex items-center justify-center text-[#D8F16A] font-mono font-black text-lg">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#1C1D1A] tracking-tight">
                  Axivon Commerce Admin
                </h1>
                <span className="rounded-full bg-[#E8EBE3] px-2 py-0.5 text-[10px] font-bold text-[#696D66] uppercase">
                  v1.0 Demo
                </span>
              </div>
              <p className="text-xs text-[#696D66] mt-0.5">
                Simulated inventory management, live order pipeline, and catalog control.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/application-demos/ecommerce"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCDDD5] bg-white px-3 py-2 text-xs font-semibold text-[#1C1D1A] hover:bg-[#F7F7F2] transition-colors"
            >
              <span>Download Standalone Package</span>
              <ExternalLink className="h-3 w-3 text-[#696D66]" />
            </Link>

            <button
              onClick={openCreateProduct}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1D1A] text-white px-3.5 py-2 text-xs font-bold hover:bg-[#343630] transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 text-[#D8F16A]" />
              <span>Add Sample Product</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-6 flex gap-2 border-b border-[#DCDDD5] -mb-5 overflow-x-auto">
          {[
            { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
            { id: "products", label: `Catalog (${products.length})`, icon: Package },
            { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: "inventory", label: "Inventory Control", icon: AlertTriangle },
            { id: "customers", label: "Customers", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#1C1D1A] text-[#1C1D1A]"
                    : "border-transparent text-[#696D66] hover:text-[#1C1D1A]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#1C1D1A]" : "text-[#696D66]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* ── TAB 1: OVERVIEW DASHBOARD ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-[#DCDDD5] p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#696D66]">
                  <span>Total Demo Revenue</span>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#1C1D1A] mt-2">
                  {formatPrice(metrics.totalRevenue)}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Calculated from {metrics.totalOrders} demonstration orders</span>
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#DCDDD5] p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#696D66]">
                  <span>Active Catalog Items</span>
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                    <Package className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#1C1D1A] mt-2">
                  {metrics.totalProducts}
                </p>
                <p className="text-[11px] text-[#696D66] mt-1">
                  Across 4 lifestyle categories
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#DCDDD5] p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#696D66]">
                  <span>Orders to Dispatch</span>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#1C1D1A] mt-2">
                  {metrics.pendingOrdersCount}
                </p>
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  Pending or in processing
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#DCDDD5] p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#696D66]">
                  <span>Low Stock Warnings</span>
                  <div className="p-2 rounded-lg bg-red-50 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#1C1D1A] mt-2">
                  {metrics.lowStockCount}
                </p>
                <p className="text-[11px] text-red-700 font-medium mt-1">
                  Requires restock attention
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders (2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#DCDDD5] p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#DCDDD5]">
                  <div>
                    <h2 className="text-base font-bold text-[#1C1D1A]">Recent Demo Orders</h2>
                    <p className="text-xs text-[#696D66]">Real-time pipeline of incoming sample purchases</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-[#1C1D1A] hover:underline flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="divide-y divide-[#DCDDD5]">
                  {orders.slice(0, 5).map((ord) => (
                    <div
                      key={ord.id}
                      className="py-3.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#E8EBE3] flex items-center justify-center font-bold text-[#1C1D1A] text-xs">
                          {ord.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#1C1D1A]">{ord.id}</p>
                          <p className="text-[#696D66]">
                            {ord.customerName} · {ord.items.length} item(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : ord.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                        <p className="font-bold text-[#1C1D1A] w-20 text-right">
                          {formatPrice(ord.total)}
                        </p>
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1 rounded text-[#696D66] hover:text-[#1C1D1A] hover:bg-[#F7F7F2]"
                          title="View order details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown & Quick Actions (1 col) */}
              <div className="bg-white rounded-2xl border border-[#DCDDD5] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#1C1D1A]">Catalog Categories</h2>
                  <p className="text-xs text-[#696D66] mt-0.5">Distribution of items across sections</p>

                  <div className="mt-5 space-y-3">
                    {NOVACART_CATEGORIES.map((cat) => {
                      const count = products.filter((p) => p.category === cat.name).length;
                      return (
                        <div key={cat.id} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#1C1D1A]">{cat.name}</span>
                          <span className="font-mono text-[#696D66] bg-[#F7F7F2] px-2 py-0.5 rounded">
                            {count} items
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-[#DCDDD5] space-y-2">
                  <p className="text-xs font-bold text-[#1C1D1A]">Demo Operations</p>
                  <button
                    onClick={openCreateProduct}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1C1D1A] text-white py-2.5 text-xs font-bold hover:bg-[#343630]"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#D8F16A]" />
                    <span>Create Sample Product</span>
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#DCDDD5] py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restore Seed State</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PRODUCTS CATALOG ── */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCDDD5]">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#696D66]" />
                  <input
                    type="text"
                    placeholder="Search products by title or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DCDDD5] focus:outline-none focus:border-[#1C1D1A]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-[#DCDDD5] bg-white text-[#1C1D1A] focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  {NOVACART_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={openCreateProduct}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1D1A] text-white px-3 py-2 text-xs font-bold hover:bg-[#343630]"
                >
                  <Plus className="h-3.5 w-3.5 text-[#D8F16A]" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-[#DCDDD5] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F7F2] border-b border-[#DCDDD5] text-[#696D66] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDDD5]">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#F7F7F2]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[#E8EBE3] overflow-hidden shrink-0 relative">
                            {prod.images[0] ? (
                              <Image
                                src={prod.images[0]}
                                alt={prod.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 m-auto text-[#696D66]" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#1C1D1A]">{prod.name}</p>
                            <p className="text-[11px] text-[#696D66]">ID: {prod.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#1C1D1A]">
                        {prod.category}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1C1D1A]">
                        {formatPrice(prod.price)}
                        {prod.compareAtPrice && (
                          <span className="text-[#696D66] line-through font-normal ml-1.5 text-[11px]">
                            {formatPrice(prod.compareAtPrice)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStockStatus(prod)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            prod.stockStatus === "In Stock"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : prod.stockStatus === "Low Stock"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-red-50 text-red-800 border-red-200"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          <span>{prod.stockStatus}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/demo-projects/ecommerce/novacart/products/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 rounded text-[#696D66] hover:text-[#1C1D1A] hover:bg-[#E8EBE3]"
                            title="Preview on Storefront"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="p-1.5 rounded text-[#696D66] hover:text-blue-700 hover:bg-blue-50"
                            title="Edit details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(prod)}
                            className="p-1.5 rounded text-[#696D66] hover:text-red-700 hover:bg-red-50"
                            title="Delete product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: ORDERS MANAGEMENT ── */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCDDD5]">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#696D66]" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, customer, or email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DCDDD5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#696D66]">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-[#DCDDD5] bg-white text-[#1C1D1A] focus:outline-none"
                >
                  <option value="ALL">All Statuses ({orders.length})</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-[#DCDDD5] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F7F2] border-b border-[#DCDDD5] text-[#696D66] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status & Pipeline</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDDD5]">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#F7F7F2]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#1C1D1A]">{ord.id}</p>
                        <p className="text-[11px] text-[#696D66]">
                          {new Date(ord.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#1C1D1A]">{ord.customerName}</p>
                        <p className="text-[11px] text-[#696D66]">{ord.customerEmail}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-[#1C1D1A] font-medium">
                          {ord.items.length} item(s)
                        </p>
                        <p className="text-[11px] text-[#696D66] truncate max-w-[200px]">
                          {ord.items.map((i) => i.productName).join(", ")}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1C1D1A]">
                        {formatPrice(ord.total)}
                        <span className="block text-[10px] text-emerald-700 font-semibold uppercase">
                          {ord.paymentStatus} · {ord.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(
                                ord.id,
                                e.target.value as DemoOrderStatus
                              )
                            }
                            className={`text-xs font-bold px-2.5 py-1 rounded-md border focus:outline-none ${
                              ord.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : ord.status === "SHIPPED"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : ord.status === "CANCELLED"
                                ? "bg-red-50 text-red-800 border-red-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="inline-flex items-center gap-1 font-semibold text-xs text-[#1C1D1A] hover:underline px-2 py-1 rounded bg-[#E8EBE3] hover:bg-[#DCDDD5]"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: INVENTORY CONTROL ── */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#DCDDD5] p-6 shadow-xs">
              <h2 className="text-base font-bold text-[#1C1D1A]">Inventory Alert & Restock Hub</h2>
              <p className="text-xs text-[#696D66] mt-0.5">
                Simulated stock level monitoring and batch restock triggers.
              </p>

              <div className="mt-6 divide-y divide-[#DCDDD5]">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-[#E8EBE3] overflow-hidden relative shrink-0">
                        {prod.images[0] && (
                          <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#1C1D1A] text-sm">{prod.name}</p>
                        <p className="text-[#696D66]">
                          SKU: {prod.id} · Category: {prod.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          prod.stockStatus === "In Stock"
                            ? "bg-emerald-100 text-emerald-800"
                            : prod.stockStatus === "Low Stock"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {prod.stockStatus}
                      </span>

                      <button
                        onClick={() => handleToggleStockStatus(prod)}
                        className="rounded-lg border border-[#DCDDD5] bg-white px-3 py-1.5 font-semibold text-[#1C1D1A] hover:bg-[#F7F7F2]"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: CUSTOMERS ── */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#DCDDD5] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#DCDDD5]">
                <div>
                  <h2 className="text-base font-bold text-[#1C1D1A]">Demo Customer Profiles</h2>
                  <p className="text-xs text-[#696D66]">Fictional sample customer profiles for demonstration</p>
                </div>
                <span className="text-xs bg-[#E8EBE3] px-2.5 py-1 rounded-md font-mono font-bold">
                  {customers.length} Profiles
                </span>
              </div>

              <div className="divide-y divide-[#DCDDD5]">
                {customers.map((c) => (
                  <div key={c.id} className="py-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#1C1D1A] text-[#D8F16A] flex items-center justify-center font-bold text-sm">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1C1D1A] text-sm">{c.name}</p>
                        <p className="text-[#696D66]">{c.email} · {c.phone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-[#1C1D1A]">{formatPrice(c.totalSpend)} spent</p>
                      <p className="text-[#696D66]">{c.city} · {c.ordersCount} order(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL 1: ORDER DETAILS ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCDDD5] max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCDDD5] pb-4">
              <div>
                <p className="text-xs text-[#696D66]">Order Details</p>
                <h3 className="text-lg font-black text-[#1C1D1A]">{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded text-[#696D66] hover:text-[#1C1D1A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-[#F7F7F2] p-4 rounded-xl">
                <div>
                  <span className="text-[#696D66]">Customer:</span>
                  <p className="font-bold text-[#1C1D1A] mt-0.5">{selectedOrder.customerName}</p>
                  <p className="text-[#696D66]">{selectedOrder.customerEmail}</p>
                  <p className="text-[#696D66]">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <span className="text-[#696D66]">Delivery Address:</span>
                  <p className="font-medium text-[#1C1D1A] mt-0.5">{selectedOrder.shippingAddress.address}</p>
                  <p className="text-[#696D66]">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#1C1D1A] block mb-2">Ordered Line Items:</span>
                <div className="border border-[#DCDDD5] rounded-xl divide-y divide-[#DCDDD5]">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#1C1D1A]">{it.productName}</p>
                        {it.variant && <p className="text-[11px] text-[#696D66]">Variant: {it.variant}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1C1D1A]">{formatPrice(it.price * it.quantity)}</p>
                        <p className="text-[#696D66]">Qty: {it.quantity} × {formatPrice(it.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#DCDDD5] pt-3 space-y-1.5 text-right">
                <div className="flex justify-between text-[#696D66]">
                  <span>Subtotal:</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#696D66]">
                  <span>Shipping:</span>
                  <span>{selectedOrder.shipping === 0 ? "FREE" : formatPrice(selectedOrder.shipping)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#1C1D1A] pt-1 border-t border-[#DCDDD5]">
                  <span>Total Paid:</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="font-bold text-[#1C1D1A] block mb-1.5">
                  Update Lifecycle Status:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as DemoOrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedOrder.status === st
                            ? "bg-[#1C1D1A] text-white"
                            : "border border-[#DCDDD5] bg-white text-[#1C1D1A] hover:bg-[#F7F7F2]"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD / EDIT PRODUCT ── */}
      {(isCreatingProduct || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCDDD5] max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCDDD5] pb-4">
              <h3 className="text-base font-bold text-[#1C1D1A]">
                {editingProduct ? "Edit Sample Product" : "Add New Sample Product"}
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreatingProduct(false);
                }}
                className="p-1 rounded text-[#696D66] hover:text-[#1C1D1A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="py-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#1C1D1A] block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Ergonomic Studio Desk Mat"
                  className="w-full px-3 py-2 rounded-lg border border-[#DCDDD5] focus:outline-none focus:border-[#1C1D1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1C1D1A] block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#DCDDD5] bg-white focus:outline-none"
                  >
                    {NOVACART_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1C1D1A] block mb-1">Availability Status</label>
                  <select
                    value={productForm.stockStatus}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        stockStatus: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#DCDDD5] bg-white focus:outline-none"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Sample Stock Only">Sample Stock Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1C1D1A] block mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#DCDDD5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1C1D1A] block mb-1">Compare Price (₹ INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.compareAtPrice}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        compareAtPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#DCDDD5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1C1D1A] block mb-1">Short Tagline</label>
                <input
                  type="text"
                  value={productForm.shortDescription}
                  onChange={(e) =>
                    setProductForm({ ...productForm, shortDescription: e.target.value })
                  }
                  placeholder="One sentence description"
                  className="w-full px-3 py-2 rounded-lg border border-[#DCDDD5] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#1C1D1A] block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={productForm.fullDescription}
                  onChange={(e) =>
                    setProductForm({ ...productForm, fullDescription: e.target.value })
                  }
                  placeholder="Detailed material and styling specifications..."
                  className="w-full px-3 py-2 rounded-lg border border-[#DCDDD5] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCDDD5]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsCreatingProduct(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-[#DCDDD5] font-semibold text-[#1C1D1A] hover:bg-[#F7F7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1C1D1A] text-white font-bold hover:bg-[#343630] flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5 text-[#D8F16A]" />
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DELETE PRODUCT CONFIRMATION ── */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCDDD5] max-w-sm w-full p-6 shadow-xl text-center text-xs">
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#1C1D1A]">Delete Sample Product?</h3>
            <p className="text-[#696D66] mt-1">
              Are you sure you want to remove &quot;{productToDelete.name}&quot; from the demo
              storefront?
            </p>

            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-lg border border-[#DCDDD5] font-semibold text-[#1C1D1A]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: RESET STORE CONFIRMATION ── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCDDD5] max-w-sm w-full p-6 shadow-xl text-center text-xs">
            <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#1C1D1A]">Reset Demonstration Data?</h3>
            <p className="text-[#696D66] mt-1">
              This will restore all sample products, demo orders, cart items, and metrics back to
              the initial clean state.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg border border-[#DCDDD5] font-semibold text-[#1C1D1A]"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 rounded-lg bg-[#1C1D1A] text-[#D8F16A] font-bold hover:bg-[#343630]"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1D1A] text-white px-4 py-3 rounded-xl shadow-lg text-xs flex items-center gap-2 border border-[#343630]">
          <CheckCircle2 className="h-4 w-4 text-[#D8F16A]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
