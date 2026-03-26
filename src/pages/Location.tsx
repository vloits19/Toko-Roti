import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function Location() {
  const openGoogleMaps = () => {
    window.open('https://maps.google.com/?q=-6.2088,106.8456', '_blank');
  };

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-stone-800 mb-4">Lokasi Toko</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Kunjungi toko kami dan nikmati roti segar langsung dari oven
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-amber-100 relative">
                {/* Placeholder for map - in production, use Google Maps or similar */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-stone-600 font-medium">Roti Lezat - Jakarta</p>
                    <p className="text-stone-500 text-sm">Jl. Roti No. 123, Jakarta Selatan</p>
                  </div>
                </div>
                <Button
                  onClick={openGoogleMaps}
                  className="absolute bottom-4 right-4 bg-white text-stone-800 hover:bg-stone-100"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Buka di Google Maps
                </Button>
              </div>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 mb-1">Alamat</h3>
                    <p className="text-stone-600 text-sm">
                      Jl. Roti No. 123<br />
                      Kebayoran Baru, Jakarta Selatan<br />
                      DKI Jakarta, 12345
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 mb-1">Telepon</h3>
                    <p className="text-stone-600 text-sm">
                      +62 812-3456-7890<br />
                      +62 21-1234-5678
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 mb-1">Email</h3>
                    <p className="text-stone-600 text-sm">
                      hello@rotilezat.com<br />
                      order@rotilezat.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 mb-1">Jam Buka</h3>
                    <div className="text-stone-600 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Senin - Jumat</span>
                        <span>07:00 - 21:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sabtu - Minggu</span>
                        <span>08:00 - 22:00</span>
                      </div>
                      <div className="flex justify-between text-amber-600 font-medium">
                        <span>Hari Libur</span>
                        <span>08:00 - 20:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Branches */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-stone-800 mb-6">Cabang Lainnya</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Roti Lezat - Bandung',
                address: 'Jl. Braga No. 45, Bandung',
                phone: '+62 812-9876-5432'
              },
              {
                name: 'Roti Lezat - Surabaya',
                address: 'Jl. Tunjungan No. 78, Surabaya',
                phone: '+62 812-3456-9876'
              },
              {
                name: 'Roti Lezat - Bali',
                address: 'Jl. Sunset Road No. 99, Denpasar',
                phone: '+62 812-7654-3210'
              }
            ].map((branch, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-stone-800 mb-2">{branch.name}</h3>
                  <p className="text-stone-600 text-sm mb-1">{branch.address}</p>
                  <p className="text-stone-500 text-sm">{branch.phone}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
