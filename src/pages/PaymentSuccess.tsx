import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText } from 'lucide-react';

export function PaymentSuccess() {
  const location = useLocation();
  const { result, orderId } = location.state || {};

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-24 h-24 text-green-500" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-stone-600">
            Terima kasih, pembayaran untuk pesanan Anda telah kami terima.
          </p>
        </div>

        {orderId && (
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Nomor Pesanan</p>
            <p className="font-mono font-semibold text-lg text-stone-800">#{orderId}</p>
          </div>
        )}

        {result?.transaction_status && (
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Status Transaksi</p>
            <p className="font-semibold text-stone-800 capitalize">{result.transaction_status}</p>
          </div>
        )}

        <div className="pt-4 flex flex-col gap-3">
          <Link to="/orders">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12">
              <FileText className="w-4 h-4 mr-2" />
              Lihat Pesanan Saya
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="w-full h-12">
              Kembali Belanja
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
