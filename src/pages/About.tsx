import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Heart, Users, Target, Sparkles, Shield } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: Heart,
      title: 'Dibuat dengan Cinta',
      description: 'Setiap roti dibuat dengan penuh passion dan perhatian pada detail'
    },
    {
      icon: Shield,
      title: 'Kualitas Terjamin',
      description: 'Hanya menggunakan bahan berkualitas tinggi dan proses higienis'
    },
    {
      icon: Sparkles,
      title: 'Inovasi Tanpa Henti',
      description: 'Terus berkembang dan menciptakan varian roti baru yang menarik'
    },
    {
      icon: Users,
      title: 'Fokus pada Pelanggan',
      description: 'Kepuasan pelanggan adalah prioritas utama kami'
    }
  ];

  const milestones = [
    { year: '2010', title: 'Berdiri', desc: 'Roti Lezat didirikan dengan satu toko kecil' },
    { year: '2015', title: 'Ekspansi', desc: 'Membuka 5 cabang di berbagai kota' },
    { year: '2018', title: 'Inovasi', desc: 'Meluncurkan 20 varian roti baru' },
    { year: '2023', title: 'Digital', desc: 'Launching toko online untuk layanan lebih baik' }
  ];

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-amber-200 text-amber-800 hover:bg-amber-200">
            Tentang Kami
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-6">
            Cerita <span className="text-amber-600">Roti Lezat</span>
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Perjalanan kami dalam menyajikan roti berkualitas dengan cinta dan dedikasi 
            sejak tahun 2010
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-3xl transform -rotate-3" />
              <img
                src="/images/bakery-shop.jpg"
                alt="Toko Roti Lezat"
                className="relative rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556217477-d325251ece38?w=800';
                }}
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-stone-800">Awal Mula Kami</h2>
              <p className="text-stone-600 leading-relaxed">
                Roti Lezat bermula dari impian sederhana: menyajikan roti berkualitas yang 
                dibuat dengan bahan terbaik dan penuh cinta. Didirikan pada tahun 2010 oleh 
                seorang baker yang passionate, kami memulai perjalanan dengan satu toko kecil 
                di pusat kota Jakarta.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Setiap hari, kami bangun pagi-pagi sekali untuk memastikan setiap roti yang 
                keluar dari oven kami adalah yang terbaik. Dari roti tawar klasik hingga 
                pastry artisan, kami berkomitmen untuk memberikan pengalaman kuliner yang 
                tak terlupakan.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-600">15+</p>
                  <p className="text-sm text-stone-500">Tahun Berdiri</p>
                </div>
                <div className="w-px h-12 bg-stone-300" />
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-600">10+</p>
                  <p className="text-sm text-stone-500">Cabang Toko</p>
                </div>
                <div className="w-px h-12 bg-stone-300" />
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-600">50+</p>
                  <p className="text-sm text-stone-500">Varian Roti</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-4">Visi Kami</h3>
                <p className="text-stone-600 leading-relaxed">
                  Menjadi toko roti terdepan di Indonesia yang dikenal karena kualitas, 
                  inovasi, dan pelayanan terbaik. Kami ingin menjadi bagian dari setiap 
                  momen spesial keluarga Indonesia.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-amber-100">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-4">Misi Kami</h3>
                <ul className="space-y-3 text-stone-600">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Menyajikan roti berkualitas premium dengan harga terjangkau
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Menggunakan bahan alami dan proses produksi higienis
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Terus berinovasi menciptakan produk baru yang menggugah selera
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Memberikan pelayanan terbaik untuk kepuasan pelanggan
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">Nilai-Nilai Kami</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Prinsip yang menjadi panduan kami dalam setiap langkah
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-stone-800 mb-2">{value.title}</h3>
                  <p className="text-stone-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">Perjalanan Kami</h2>
            <p className="text-stone-600">Momen-momen penting dalam perjalanan Roti Lezat</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                <div className="bg-amber-50 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 -mt-12 border-4 border-white">
                    <span className="text-white font-bold">{milestone.year}</span>
                  </div>
                  <h3 className="font-semibold text-stone-800 mb-2">{milestone.title}</h3>
                  <p className="text-stone-600 text-sm">{milestone.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">Tim Kami</h2>
            <p className="text-stone-600">Orang-orang hebat di balik setiap roti lezat</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Budi Santoso', role: 'Founder & Head Baker', image: '/images/team-1.jpg' },
              { name: 'Siti Rahayu', role: 'Executive Pastry Chef', image: '/images/team-2.jpg' },
              { name: 'Ahmad Wijaya', role: 'Operations Manager', image: '/images/team-3.jpg' },
              { name: 'Dewi Kusuma', role: 'Quality Control', image: '/images/team-4.jpg' }
            ].map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square bg-amber-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f59e0b&color=fff&size=200`;
                    }}
                  />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-stone-800">{member.name}</h3>
                  <p className="text-stone-500 text-sm">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
