import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const response = await api.getProduct(productId);
      if (response.success && response.data) {
        setProduct(response.data.product);
      } else {
        toast.error('Produk tidak ditemukan');
        navigate('/products');
      }
    } catch (error) {
      toast.error('Gagal memuat produk');
      navigate('/products');
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

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && product && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    await addToCart(product.id, quantity);
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl h-96 animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-white rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-white rounded w-1/4 animate-pulse" />
              <div className="h-24 bg-white rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-600 hover:text-amber-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <motion.div 
          className="grid lg:grid-cols-2 gap-8"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {/* Image */}
          <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
            <Card className="overflow-hidden border-amber-100 shadow-md">
              <div className="aspect-square bg-amber-50">
                <motion.img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-product.jpg';
                  }}
                />
              </div>
            </Card>
          </motion.div>

          {/* Details */}
          <motion.div 
            className="space-y-6"
            variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
          >
            <div>
              <Badge className="mb-3 capitalize">{product.category}</Badge>
              <h1 className="text-3xl font-bold text-stone-800 mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-amber-600">{formatPrice(product.price)}</p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-stone-800 mb-2">Deskripsi</h3>
              <p className="text-stone-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-stone-500">Stok:</span>
                <span className={`ml-2 font-medium ${product.stock < 5 ? 'text-orange-500' : 'text-green-600'}`}>
                  {product.stock} tersedia
                </span>
              </div>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-stone-800">Jumlah:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Total Harga:</span>
                <span className="text-2xl font-bold text-amber-600">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addedToCart}
              className={`w-full h-14 text-lg ${
                addedToCart 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-amber-500 hover:bg-amber-600'
              } text-white`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Ditambahkan!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Tambah ke Keranjang
                </>
              )}
            </Button>

            {product.stock === 0 && (
              <p className="text-center text-red-500 text-sm">
                Maaf, produk ini sedang habis
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
