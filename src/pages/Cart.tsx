import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Package,
  Shield,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function CurrentLocationButton({ setPosition, setAddress }: { setPosition: (pos: L.LatLng) => void, setAddress: (addr: string) => void }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng = new L.LatLng(position.coords.latitude, position.coords.longitude);
          setPosition(latlng);
          map.flyTo(latlng, 15);
          
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.display_name) {
                setAddress(data.display_name);
              }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
        },
        (error) => {
          console.error(error);
          alert('Gagal mendapatkan lokasi Anda. Pastikan ada izin akses lokasi.');
          setLoading(false);
        }
      );
    } else {
      alert('Browser Anda tidak mendukung fitur lokasi geografi.');
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      className="absolute top-2 right-2 z-[400] bg-white text-stone-800 hover:bg-stone-100 shadow-md border"
      onClick={handleCurrentLocation}
      disabled={loading}
    >
      <MapPin className="w-4 h-4 mr-2" />
      {loading ? 'Mencari...' : 'Gunakan Lokasi Saya'}
    </Button>
  );
}

function LocationMarker({ position, setPosition, setAddress }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void, setAddress: (addr: string) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          if(data && data.display_name) {
            setAddress(data.display_name);
          }
        })
        .catch(err => console.error(err));
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Lokasi Pengiriman Anda</Popup>
    </Marker>
  );
}

// Removed custom PAYMENT_METHODS since we use Midtrans

export function Cart() {
  const navigate = useNavigate();
  const { items, total, updateQuantity, removeFromCart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [selectedPayment] = useState('midtrans');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingLocation, setShippingLocation] = useState<L.LatLng | null>(null);
  const storeLocationRaw: [number, number] = [-7.3940165, 109.7008494];

  useEffect(() => {
    // Pre-fill from profile when dialog opens
    if (showCheckoutDialog && user) {
      setShippingPhone(user.phone || '');
      setShippingAddress(user.address || '');
    }
  }, [showCheckoutDialog, user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    setShowCheckoutDialog(true);
  };

  const processOrder = async () => {
    if (!shippingPhone || !shippingAddress) {
      toast.error('Mohon lengkapi info pengiriman');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await api.createOrder(selectedPayment, shippingPhone, shippingAddress);
      
      if (response.success && response.data) {
        const order = (response.data as any).order;

        // Prepare items for Midtrans
        const item_details = items.map(item => ({
          id: String(item.product_id),
          price: item.price,
          quantity: item.quantity,
          name: item.name.substring(0, 50),
          merchant_name: "Roti Lezat"
        }));

        // Get midtrans token 
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');
        const tokenResponse = await fetch(`${apiUrl}/midtrans/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: String(order.id) + '-' + Date.now(), // Append timestamp to avoid duplicate order ID in sandbox
            gross_amount: total,
            item_details: item_details,
            customer_details: {
              first_name: user?.name,
              email: user?.email,
              phone: shippingPhone
            }
          })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.success && tokenData.token) {
          // Clear cart right before payment popup
          await refreshCart();
          setShowCheckoutDialog(false);

          // Trigger Midtrans Snap
          (window as any).snap.pay(tokenData.token, {
            onSuccess: async function(result: any) { 
              await api.markOrderPaid(order.id);
              navigate('/payment/success', { state: { result, orderId: order.id } }); 
            },
            onPending: function(result: any) { 
              navigate('/payment/pending', { state: { result, orderId: order.id } }); 
            },
            onError: function(result: any) { 
              navigate('/payment/error', { state: { result, orderId: order.id } }); 
            },
            onClose: function() { 
              toast.info('Anda menutup popup pembayaran sebelum menyelesaikan pembayaran');
              navigate('/orders'); 
            }
          });
        } else {
          toast.error('Gagal mendapatkan token pembayaran');
          await refreshCart();
          setShowCheckoutDialog(false);
          navigate('/orders');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat pesanan');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            Keranjang Belanja Kosong
          </h2>
          <p className="text-stone-600 mb-6">
            Anda belum menambahkan produk ke keranjang
          </p>
          <Link to="/products">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              Mulai Belanja
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">Keranjang Belanja</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg bg-amber-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/default-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-stone-800">{item.name}</h3>
                      <p className="text-amber-600 font-medium">
                        {formatPrice(item.price)}
                      </p>
                      <p className="text-sm text-stone-500">
                        Stok: {item.stock}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-800">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">
                  Ringkasan Pesanan
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal ({items.length} item)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Ongkir</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-semibold mb-6">
                  <span>Total</span>
                  <span className="text-amber-600">{formatPrice(total)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Shield className="w-4 h-4" />
                    <span>Pembayaran aman & terenkripsi</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Package className="w-4 h-4" />
                    <span>Gratis ongkir untuk pesanan di atas Rp 100rb</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Pengiriman</DialogTitle>
            <DialogDescription>
              Silakan lengkapi informasi pengiriman pesanan Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="shippingPhone">Nomor Telepon</Label>
              <Input
                id="shippingPhone"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                placeholder="08123456789"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Lokasi pada Peta</Label>
              <div className="h-[200px] w-full rounded-md border overflow-hidden relative z-0">
                <MapContainer center={storeLocationRaw} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={storeLocationRaw} icon={storeIcon}>
                    <Popup>
                      <strong>Toko Roti Lezat</strong><br/>
                      Lokasi Toko
                    </Popup>
                  </Marker>
                  <LocationMarker position={shippingLocation} setPosition={setShippingLocation} setAddress={setShippingAddress} />
                  <CurrentLocationButton setPosition={setShippingLocation} setAddress={setShippingAddress} />
                </MapContainer>
              </div>
              <p className="text-xs text-stone-500 mb-4">Klik pada peta untuk menentukan lokasi tujuan pengiriman secara otomatis.</p>
              
              <Label htmlFor="shippingAddress">Alamat Lengkap (Detail)</Label>
              <textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Contoh: Jl. Merdeka No 123, Blok A2..."
                required
              />
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-stone-600">Total Pembayaran</span>
              <span className="text-xl font-bold text-amber-600">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCheckoutDialog(false)}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={processOrder}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                'Bayar Sekarang'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
