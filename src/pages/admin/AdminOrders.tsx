import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'cancelled'];
const ORDER_STATUSES = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder] = useState<Order | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.getAllOrders();
      if (response.success && response.data) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error('Gagal memuat pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, paymentStatus?: string, orderStatus?: string) => {
    try {
      await api.updateOrderStatus(orderId, paymentStatus, orderStatus);
      toast.success('Status pesanan diupdate');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Gagal update status');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      paid: 'default',
      failed: 'destructive',
      cancelled: 'destructive',
      processing: 'secondary',
      confirmed: 'default',
      shipped: 'default',
      delivered: 'default'
    };

    const labels: Record<string, string> = {
      pending: 'Menunggu',
      paid: 'Dibayar',
      failed: 'Gagal',
      cancelled: 'Dibatalkan',
      processing: 'Diproses',
      confirmed: 'Dikonfirmasi',
      shipped: 'Dikirim',
      delivered: 'Diterima'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const toggleExpand = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter(order =>
    order.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-amber-50/30">
      <header className="bg-white border-b border-amber-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-stone-800">Kelola Pesanan</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Cari pesanan berdasarkan ID atau nama customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-stone-500">
                      Tidak ada pesanan ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow>
                        <TableCell className="font-medium">
                        #{order.id.toString().padStart(6, '0')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user_name}</p>
                          <p className="text-sm text-stone-500">{order.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-amber-600">
                        {formatPrice(order.total_price)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(order.payment_status)}
                          <Select
                            value={order.payment_status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(order.order_status)}
                          <Select
                            value={order.order_status}
                            onValueChange={(value) => updateOrderStatus(order.id, undefined, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-stone-500">
                        {formatDate(order.created_at || '')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(order.id)}
                        >
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedOrder === order.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-amber-50/50 p-4">
                          <div className="flex gap-8 text-sm">
                            <div className="flex-1">
                              <span className="font-semibold block mb-2 text-stone-700">Detail Pengiriman</span>
                              <p><span className="text-stone-500">No. HP:</span> {order.shipping_phone || order.user_phone || '-'}</p>
                              <p className="mt-1"><span className="text-stone-500">Alamat:</span></p>
                              <p className="whitespace-pre-wrap">{order.shipping_address || '-'}</p>
                            </div>
                            <div className="flex-1 border-l pl-8 border-amber-200">
                              <span className="font-semibold block mb-2 text-stone-700">Rincian Item</span>
                              <ul className="space-y-1">
                                {order.items?.map(item => (
                                  <li key={item.id} className="text-stone-600">
                                    {item.quantity}x {item.product_name} 
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.toString().padStart(6, '0')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-stone-500">Customer</p>
                  <p className="font-medium">{selectedOrder.user_name}</p>
                  <p className="text-sm text-stone-500">{selectedOrder.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Tanggal</p>
                  <p className="font-medium">{formatDate(selectedOrder.created_at || '')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-stone-500 mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-stone-500">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-stone-600">Total</span>
                <span className="text-xl font-bold text-amber-600">
                  {formatPrice(selectedOrder.total_price)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
