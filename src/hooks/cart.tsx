import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productStorage = await AsyncStorage.getItem(
        '@GoMarketPlaclace:ProductCart',
      );

      if (productStorage) {
        setProducts(JSON.parse(productStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productExist = products.find(item => item.id === product.id);

      if (!productExist) {
        setProducts([...products, { ...product, quantity: 1 }]);
      } else {
        const productsQuantityIncremented = products.map(pr => {
          if (pr.id === product.id) {
            return { ...pr, quantity: pr.quantity + 1 };
          }
          return pr;
        });
        setProducts(productsQuantityIncremented);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlaclace:ProductCart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsQuantityIncremented = products.map(pr => {
        if (pr.id === id) {
          return { ...pr, quantity: pr.quantity + 1 };
        }
        return pr;
      });
      setProducts(productsQuantityIncremented);

      await AsyncStorage.setItem(
        '@GoMarketPlaclace:ProductCart',
        JSON.stringify(products),
      );

      console.log('@@@', JSON.parse(storage));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsQuantityDecremented = products.map(pr => {
        if (pr.id === id) {
          if (pr.quantity > 1) {
            return { ...pr, quantity: pr.quantity - 1 };
          }
        }
        return pr;
      });
      setProducts(productsQuantityDecremented);

      await AsyncStorage.setItem(
        '@GoMarketPlaclace:ProductCart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
