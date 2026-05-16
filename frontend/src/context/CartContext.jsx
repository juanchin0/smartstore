import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CART_KEY = 'smartstore_cart'

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] }
}

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image ?? null,
        store_slug: product.store_slug ?? '',
        store_name: product.store_name ?? '',
        quantity: 1,
      }]
    })
  }, [])

  const removeFromCart = useCallback((product_id) => {
    setItems(prev => prev.filter(i => i.product_id !== product_id))
  }, [])

  const updateQuantity = useCallback((product_id, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.product_id !== product_id))
    } else {
      setItems(prev => prev.map(i =>
        i.product_id === product_id ? { ...i, quantity: qty } : i
      ))
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, count, subtotal,
      addToCart, removeFromCart, updateQuantity, clearCart,
      add: addToCart,   // backward-compat alias
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
