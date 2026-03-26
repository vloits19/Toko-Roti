import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import type { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Truck, Shield, Clock, ChefHat, Wheat, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.getProducts(undefined, true);
      if (response.success && response.data) {
        setFeaturedProducts(response.data.products.slice(0, 4));
      }
    } catch (error) {
      toast.error('Gagal memuat produk');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: ChefHat,
      title: 'Dibuat dengan Cinta',
      description: 'Setiap roti dibuat oleh baker berpengalaman dengan resep rahasia turun-temurun'
    },
    {
      icon: Wheat,
      title: 'Bahan Berkualitas',
      description: 'Menggunakan tepung premium dan bahan alami pilihan terbaik'
    },
    {
      icon: Flame,
      title: 'Fresh dari Oven',
      description: 'Roti selalu segar karena dipanggang setiap hari dengan standar tinggi'
    }
  ];

  const benefits = [
    { icon: Truck, title: 'Pengiriman Cepat', desc: 'Gratis ongkir untuk pesanan di atas Rp 100.000' },
    { icon: Shield, title: 'Jaminan Kualitas', desc: 'Uang kembali jika tidak puas' },
    { icon: Clock, title: 'Fresh Setiap Hari', desc: 'Dipanggang pagi hari untuk kesegaran maksimal' },
    { icon: Star, title: 'Terpercaya', desc: 'Lebih dari 10 tahun melayani pelanggan' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 px-4 py-1">
                🥖 Roti Fresh Setiap Hari
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-stone-800 leading-tight">
                Nikmati <span className="text-amber-600">Roti Hangat</span> & Lezat Setiap Hari
              </h1>
              <p className="text-lg text-stone-600 max-w-lg">
                Dibuat dengan bahan berkualitas tinggi dan penuh cinta. 
                Setiap gigitan membawa kebahagiaan!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95">
                    Beli Sekarang
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="border-amber-300 transition-all hover:bg-amber-50 active:scale-95">
                    Tentang Kami
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <p className="text-3xl font-bold text-amber-600">10K+</p>
                  <p className="text-sm text-stone-500">Pelanggan Puas</p>
                </div>
                <div className="w-px h-12 bg-stone-300" />
                <div>
                  <p className="text-3xl font-bold text-amber-600">50+</p>
                  <p className="text-sm text-stone-500">Varian Roti</p>
                </div>
                <div className="w-px h-12 bg-stone-300" />
                <div>
                  <p className="text-3xl font-bold text-amber-600">15+</p>
                  <p className="text-sm text-stone-500">Tahun Pengalaman</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut", type: "spring" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-3xl transform rotate-3" />
              <img
                src="/images/hero-bread.jpg"
                alt="Roti Lezat"
                className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800';
                }}
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">4.9 Rating</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">Mengapa Memilih Kami?</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Kami berkomitmen untuk memberikan roti terbaik dengan kualitas premium dan pelayanan istimewa
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-amber-50/50 hover:bg-amber-50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-default"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 hover:rotate-12 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-stone-800 mb-2">{feature.title}</h3>
                <p className="text-stone-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-amber-50/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-2">Produk Unggulan</h2>
              <p className="text-stone-600">Roti favorit pelanggan kami</p>
            </div>
            <Link to="/products" className="hidden sm:block">
              <Button variant="outline" className="border-amber-300 transition-all hover:bg-amber-50 active:scale-95">
                Lihat Semua
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link to="/products">
                  <Button variant="outline" className="border-amber-300">
                    Lihat Semua Produk
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 p-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-800">{benefit.title}</h4>
                  <p className="text-sm text-stone-500">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-500">
        <motion.div 
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Pesan Roti Favorit Anda Sekarang!
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Nikmati roti segar yang dipanggang dengan cinta. 
            Pesan sekarang dan rasakan kelezatannya!
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50 transition-all hover:scale-105 active:scale-95 hover:shadow-lg">
              Mulai Berbelanja
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
