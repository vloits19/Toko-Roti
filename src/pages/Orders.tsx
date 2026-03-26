import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Order } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.getUserOrders();
      if (response.success && response.data) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error('Gagal memuat pesanan');
    } finally {
      setIsLoading(false);
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
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
      pending: { label: 'Menunggu Pembayaran', variant: 'secondary', icon: Clock },
      paid: { label: 'Dibayar', variant: 'default', icon: CheckCircle },
      failed: { label: 'Gagal', variant: 'destructive', icon: XCircle },
      cancelled: { label: 'Dibatalkan', variant: 'destructive', icon: XCircle },
      processing: { label: 'Diproses', variant: 'secondary', icon: Package },
      confirmed: { label: 'Dikonfirmasi', variant: 'default', icon: CheckCircle },
      shipped: { label: 'Dikirim', variant: 'default', icon: Truck },
      delivered: { label: 'Diterima', variant: 'default', icon: CheckCircle }
    };

    const config = statusMap[status] || { label: status, variant: 'secondary', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const toggleExpand = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50/30 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-stone-800 mb-8">Pesanan Saya</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            Belum Ada Pesanan
          </h2>
          <p className="text-stone-600 mb-6">
            Anda belum membuat pesanan apapun
          </p>
          <a href="/products">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              Mulai Belanja
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">Pesanan Saya</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-stone-500 mb-1">
                      Order #{order.id.toString().padStart(6, '0')}
                    </p>
                    <p className="text-sm text-stone-400">
                      {formatDate(order.created_at || '')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.payment_status)}
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
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">
                      {order.items?.length || 0} item
                    </span>
                    <span className="text-lg font-semibold text-amber-600">
                      {formatPrice(order.total_price)}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && order.items && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-stone-800 mb-3">Detail Item</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg bg-amber-50"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/default-product.jpg';
                            }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-stone-800">{item.product_name}</p>
                            <p className="text-sm text-stone-500">
                              {item.quantity} x {formatPrice(item.price)}
                            </p>
                          </div>
                          <p className="font-medium text-stone-800">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-stone-500">Metode Pembayaran:</span>
                          <p className="font-medium text-stone-800 capitalize">
                            {order.payment_method?.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <span className="text-stone-500">Status Order:</span>
                          <p className="font-medium text-stone-800 capitalize">
                            {order.order_status}
                          </p>
                        </div>
                      </div>
                      
                      {order.shipping_address && (
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-stone-500 block mb-1">Pengiriman Ke:</span>
                          <p className="font-medium text-stone-800 text-sm">{order.shipping_phone}</p>
                          <p className="text-stone-600 text-sm whitespace-pre-wrap">{order.shipping_address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
