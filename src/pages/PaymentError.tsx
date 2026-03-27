import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw } from 'lucide-react';

export function PaymentError() {
  const location = useLocation();
  const { result, orderId } = location.state || {};

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <XCircle className="w-24 h-24 text-red-500" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Pembayaran Gagal</h1>
          <p className="text-stone-600">
            Maaf, proses pembayaran Anda tidak dapat diselesaikan atau telah kedaluwarsa.
          </p>
        </div>

        {orderId && (
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Nomor Pesanan</p>
            <p className="font-mono font-semibold text-lg text-stone-800">#{orderId}</p>
          </div>
        )}

        {result?.status_message && (
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Pesan Error</p>
            <p className="font-semibold text-stone-800 text-sm">{result.status_message}</p>
          </div>
        )}

        <div className="pt-4 flex flex-col gap-3">
          <Link to="/cart">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12">
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Bayar Lagi
            </Button>
          </Link>
          <Link to="/orders">
            <Button variant="outline" className="w-full h-12">
              Lihat Pesanan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
