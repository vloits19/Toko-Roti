import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Order } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
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
  Truck,
  MessageSquare,
  Send,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  
  const { user } = useAuth();
  const [messageTexts, setMessageTexts] = useState<Record<number, string>>({});
  const [isSending, setIsSending] = useState<Record<number, boolean>>({});
  const [isPaying, setIsPaying] = useState<Record<number, boolean>>({});

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

  const handlePayNow = async (order: Order) => {
    setIsPaying(prev => ({ ...prev, [order.id]: true }));
    try {
      const apiUrl = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';
      const tokenResponse = await fetch(`${apiUrl}/midtrans/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: String(order.id) + '-' + Date.now(),
          gross_amount: order.total_price,
          item_details: order.items?.map(item => ({
            id: String(item.product_id),
            price: item.price,
            quantity: item.quantity,
            name: (item.product_name || 'Item').substring(0, 50),
            merchant_name: "Roti Lezat"
          })) || [],
          customer_details: {
            first_name: user?.name,
            email: user?.email,
            phone: order.shipping_phone
          }
        })
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.success && tokenData.token) {
        (window as any).snap.pay(tokenData.token, {
          onSuccess: function() { 
            window.location.href = '/payment/success'; 
          },
          onPending: function() { 
            window.location.href = '/payment/pending';
          },
          onError: function() { 
            window.location.href = '/payment/error'; 
          },
          onClose: function() { 
            toast.info('Anda menutup popup pembayaran');
            fetchOrders();
          }
        });
      } else {
        toast.error('Gagal mendapatkan token pembayaran');
      }
    } catch (error) {
      toast.error('Gagal memproses pembayaran');
    } finally {
      setIsPaying(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const setOrderMessage = (orderId: number, text: string) => {
    setMessageTexts(prev => ({ ...prev, [orderId]: text }));
  };

  const handleSendMessage = async (order: Order) => {
    const text = messageTexts[order.id];
    if (!text?.trim() || !user) return;

    setIsSending(prev => ({ ...prev, [order.id]: true }));
    try {
      const fullMessage = `Terkait Pesanan #${order.id.toString().padStart(6, '0')}:\n\n${text}`;
      const response = await api.sendMessage(user.name, user.email, fullMessage);
      if (response.success) {
        toast.success('Pesan berhasil dikirim ke penjual');
        setMessageTexts(prev => ({ ...prev, [order.id]: '' }));
      }
    } catch (error) {
      toast.error('Gagal mengirim pesan');
    } finally {
      setIsSending(prev => ({ ...prev, [order.id]: false }));
    }
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
                    {order.payment_status === 'pending' && (
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                        disabled={isPaying[order.id]}
                        onClick={() => handlePayNow(order)}
                      >
                        {isPaying[order.id] ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Bayar Sekarang
                          </>
                        )}
                      </Button>
                    )}
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

                      {(order.payment_status === 'paid' || ['processing', 'confirmed', 'shipped'].includes(order.order_status)) && (
                        <div className="mt-6 pt-4 border-t bg-stone-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-5 h-5 text-amber-500" />
                            <h4 className="font-semibold text-stone-800">Hubungi Penjual</h4>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs bg-white"
                              onClick={() => setOrderMessage(order.id, 'Apakah pesanan saya sudah bisa dikirim?')}
                            >
                              Apakah pesanan saya sudah bisa dikirim?
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs bg-white"
                              onClick={() => setOrderMessage(order.id, 'Pesanan saya dikirim kapan?')}
                            >
                              Pesanan saya dikirim kapan?
                            </Button>
                          </div>
                          
                          <div className="flex gap-2">
                            <textarea
                              value={messageTexts[order.id] || ''}
                              onChange={(e) => setOrderMessage(order.id, e.target.value)}
                              placeholder="Tulis pesan untuk penjual..."
                              className="flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                              rows={2}
                            />
                            <Button 
                              className="bg-amber-500 hover:bg-amber-600 self-end px-3"
                              disabled={!messageTexts[order.id]?.trim() || isSending[order.id]}
                              onClick={() => handleSendMessage(order)}
                            >
                              {isSending[order.id] ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
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
