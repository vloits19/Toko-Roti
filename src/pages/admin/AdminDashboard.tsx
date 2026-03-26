import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  MessageSquare,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

interface Statistics {
  total_sales: number;
  total_orders: number;
  pending_orders: number;
  today_sales: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Statistics>({
    total_sales: 0,
    total_orders: 0,
    pending_orders: 0,
    today_sales: 0
  });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
    fetchUnreadMessages();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.getOrderStatistics();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('Gagal memuat statistik');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const response = await api.getUnreadMessages();
      if (response.success && response.data) {
        setUnreadMessages(response.data.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch unread messages:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const statCards = [
    {
      title: 'Total Penjualan',
      value: formatPrice(stats.total_sales),
      icon: DollarSign,
      trend: '+12%',
      trendUp: true,
      color: 'bg-green-500'
    },
    {
      title: 'Total Pesanan',
      value: stats.total_orders.toString(),
      icon: ShoppingCart,
      trend: '+8%',
      trendUp: true,
      color: 'bg-blue-500'
    },
    {
      title: 'Pesanan Pending',
      value: stats.pending_orders.toString(),
      icon: Package,
      trend: '-3%',
      trendUp: false,
      color: 'bg-orange-500'
    },
    {
      title: 'Penjualan Hari Ini',
      value: formatPrice(stats.today_sales),
      icon: TrendingUp,
      trend: '+15%',
      trendUp: true,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Header */}
      <header className="bg-white border-b border-amber-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-800">Dashboard Admin</h1>
              <p className="text-stone-500 text-sm">Selamat datang kembali, Admin!</p>
            </div>
            {unreadMessages > 0 && (
              <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {unreadMessages} pesan baru
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-stone-500 text-sm mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-stone-800">{card.value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-sm ${
                      card.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trendUp ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>{card.trend}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/products'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                Manajemen Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-600">
                Tambah, edit, atau hapus produk dari katalog toko Anda.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/orders'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                Kelola Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-600">
                Lihat dan kelola semua pesanan dari pelanggan.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/messages'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                Pesan Masuk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-600">
                {unreadMessages > 0 
                  ? `Ada ${unreadMessages} pesan baru dari pelanggan.`
                  : 'Tidak ada pesan baru.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
