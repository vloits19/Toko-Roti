import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -5 }}
    >
      <Card className="group overflow-hidden border-amber-100 hover:shadow-xl transition-shadow shadow-md h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-amber-50">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/default-product.jpg';
            }}
          />
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded shadow-sm">
              Stok Terbatas
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 left-2 bg-stone-500 text-white text-xs px-2 py-1 rounded shadow-sm">
              Habis
            </span>
          )}
        </div>
        
        <CardContent className="p-4 flex-grow">
          <div className="text-xs text-amber-600 mb-1 capitalize font-medium">{product.category}</div>
          <h3 className="font-semibold text-stone-800 mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-stone-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
          <div className="mt-auto">
            <p className="text-lg font-bold text-amber-600">{formatPrice(product.price)}</p>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Link to={`/products/${product.id}`} className="flex-1">
            <Button variant="outline" className="w-full border-amber-200 hover:bg-amber-50 hover:text-amber-700 transition-colors">
              <Eye className="w-4 h-4 mr-2" />
              Detail
            </Button>
          </Link>
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white hover:shadow-md transition-all active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Beli
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
