# 🚀 Guide d'Utilisation - Client Order APIs

## 📋 Vue d'ensemble

Ce guide vous montre comment utiliser les services `clientOrderService` et `orderClientLineService` dans vos composants React.

---

## 🎯 Client Order Service

### **1. Créer une Commande**

```typescript
import { clientOrderService } from '@/service/client/clientOrderService'
import { ClientOrderRequest } from '@/types/client/clientOrder'

// Créer une nouvelle commande
const createNewOrder = async () => {
  try {
    const orderData: ClientOrderRequest = {
      code: "ORD-2025-001",
      orderDate: "2025-11-09",
      clientId: 5,
      comments: "Commande urgente"
      // Note: stateOrder n'est pas requis (toujours IN_PREPARATION)
    }
    
    const order = await clientOrderService.create(orderData)
    console.log('Commande créée:', order)
    console.log('Client:', order.clientName) // Nom du client retourné
    console.log('Statut:', order.stateOrder) // IN_PREPARATION
  } catch (error) {
    console.error('Erreur création:', error)
  }
}
```

### **2. Récupérer une Commande**

```typescript
// Par ID
const getOrder = async (orderId: number) => {
  try {
    const order = await clientOrderService.getById(orderId)
    console.log('Commande:', order)
    console.log('Lignes:', order.orderClientLineList)
  } catch (error) {
    console.error('Commande non trouvée:', error)
  }
}

// Par Client
const getClientOrders = async (clientId: number) => {
  try {
    const orders = await clientOrderService.getOrdersByClient(clientId)
    console.log(`${orders.length} commandes trouvées`)
  } catch (error) {
    console.error('Erreur:', error)
  }
}

// Par Statut
const getPendingOrders = async () => {
  try {
    const orders = await clientOrderService.getOrdersByStatus('PENDING')
    console.log('Commandes en attente:', orders)
  } catch (error) {
    console.error('Erreur:', error)
  }
}

// Toutes les commandes
const getAllOrders = async () => {
  try {
    const orders = await clientOrderService.getAllOrders()
    console.log('Total commandes:', orders.length)
  } catch (error) {
    console.error('Erreur:', error)
  }
}
```

### **3. Mettre à Jour une Commande**

```typescript
const updateOrder = async (orderId: number) => {
  try {
    const updatedData: ClientOrderRequest = {
      code: "ORD-2025-001-UPDATED",
      orderDate: "2025-11-09",
      clientId: 5,
      comments: "Commande modifiée"
    }
    
    const order = await clientOrderService.update(orderId, updatedData)
    console.log('Commande mise à jour:', order)
  } catch (error) {
    console.error('Erreur mise à jour:', error)
  }
}
```

### **4. Changer le Statut**

```typescript
import { OrderStatus } from '@/types/client/clientOrder'

const confirmOrder = async (orderId: number) => {
  try {
    const order = await clientOrderService.updateOrderStatus(
      orderId,
      OrderStatus.CONFIRMED
    )
    console.log('Commande confirmée:', order.stateOrder)
  } catch (error) {
    console.error('Transition invalide:', error)
  }
}
```

### **5. Annuler une Commande**

```typescript
const cancelOrder = async (orderId: number) => {
  try {
    const order = await clientOrderService.cancelOrder(orderId)
    console.log('Commande annulée:', order)
    // Les réservations de stock sont libérées automatiquement
  } catch (error) {
    console.error('Impossible d\'annuler:', error)
    // Erreur si la commande est CONFIRMED
  }
}
```

### **6. Supprimer une Commande**

```typescript
const deleteOrder = async (orderId: number) => {
  try {
    await clientOrderService.delete(orderId)
    console.log('Commande supprimée')
  } catch (error) {
    console.error('Impossible de supprimer:', error)
    // Erreur si DELIVERED ou CANCELED
  }
}
```

---

## 🎯 Order Client Line Service

### **1. Ajouter une Ligne à une Commande**

```typescript
import { orderClientLineService } from '@/service/client/orderClientLineService'
import { OrderClientLineRequest } from '@/types/client/orderClientLine'

const addLineToOrder = async () => {
  try {
    const lineData: OrderClientLineRequest = {
      clientOrderId: 1,
      articleId: 5,
      quantity: 10
    }
    
    const line = await orderClientLineService.create(lineData)
    console.log('Ligne ajoutée:', line)
    console.log('Prix unitaire:', line.unitPrice)
    console.log('Prix total:', line.totalPrice)
    console.log('Article:', line.articleDesignation)
  } catch (error) {
    console.error('Erreur ajout ligne:', error)
    // Erreur si la commande n'est pas IN_PREPARATION
  }
}
```

### **2. Récupérer les Lignes**

```typescript
// Une ligne spécifique
const getLine = async (lineId: number) => {
  try {
    const line = await orderClientLineService.getById(lineId)
    console.log('Ligne:', line)
  } catch (error) {
    console.error('Ligne non trouvée:', error)
  }
}

// Toutes les lignes d'une commande
const getOrderLines = async (orderId: number) => {
  try {
    const lines = await orderClientLineService.getAllLinesForOrder(orderId)
    console.log(`${lines.length} lignes dans la commande`)
    
    lines.forEach(line => {
      console.log(`- ${line.articleDesignation}: ${line.quantity} x ${line.unitPrice}€`)
    })
  } catch (error) {
    console.error('Erreur:', error)
  }
}
```

### **3. Modifier la Quantité**

```typescript
const updateQuantity = async (lineId: number, newQuantity: number) => {
  try {
    const line = await orderClientLineService.updateLineQuantity(lineId, newQuantity)
    console.log('Quantité mise à jour:', line.quantity)
    console.log('Nouveau total:', line.totalPrice)
  } catch (error) {
    console.error('Erreur mise à jour:', error)
    // Erreur si stock insuffisant
  }
}
```

### **4. Supprimer une Ligne**

```typescript
const removeLine = async (lineId: number) => {
  try {
    await orderClientLineService.delete(lineId)
    console.log('Ligne supprimée')
    // La quantité est retournée au stock automatiquement
  } catch (error) {
    console.error('Impossible de supprimer:', error)
    // Erreur si la commande est DELIVERED
  }
}
```

### **5. Calculer le Total**

```typescript
const calculateOrderTotal = async (orderId: number) => {
  try {
    const total = await orderClientLineService.calculateTotal(orderId)
    console.log(`Total de la commande: ${total}€`)
  } catch (error) {
    console.error('Erreur calcul:', error)
  }
}
```

---

## 🎨 Exemple Complet: Composant React

```typescript
'use client'

import { useState, useEffect } from 'react'
import { clientOrderService } from '@/service/client/clientOrderService'
import { orderClientLineService } from '@/service/client/orderClientLineService'
import { ClientOrder, OrderStatus } from '@/types/client/clientOrder'
import { OrderClientLine } from '@/types/client/orderClientLine'

export default function OrderDetailsPage({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<ClientOrder | null>(null)
  const [lines, setLines] = useState<OrderClientLine[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrderData()
  }, [orderId])

  const loadOrderData = async () => {
    try {
      setLoading(true)
      
      // Charger la commande
      const orderData = await clientOrderService.getById(orderId)
      setOrder(orderData)
      
      // Charger les lignes
      const linesData = await orderClientLineService.getAllLinesForOrder(orderId)
      setLines(linesData)
      
      // Calculer le total
      const totalAmount = await orderClientLineService.calculateTotal(orderId)
      setTotal(totalAmount)
      
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    if (!order) return
    
    try {
      const updatedOrder = await clientOrderService.updateOrderStatus(
        order.id,
        OrderStatus.CONFIRMED
      )
      setOrder(updatedOrder)
      alert('Commande confirmée!')
    } catch (error) {
      alert('Erreur lors de la confirmation')
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    
    if (!confirm('Voulez-vous vraiment annuler cette commande?')) return
    
    try {
      const cancelledOrder = await clientOrderService.cancelOrder(order.id)
      setOrder(cancelledOrder)
      alert('Commande annulée')
    } catch (error) {
      alert('Impossible d\'annuler cette commande')
    }
  }

  const handleUpdateQuantity = async (lineId: number, newQuantity: number) => {
    try {
      await orderClientLineService.updateLineQuantity(lineId, newQuantity)
      await loadOrderData() // Recharger les données
    } catch (error) {
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleRemoveLine = async (lineId: number) => {
    if (!confirm('Supprimer cette ligne?')) return
    
    try {
      await orderClientLineService.delete(lineId)
      await loadOrderData() // Recharger les données
    } catch (error) {
      alert('Impossible de supprimer cette ligne')
    }
  }

  if (loading) return <div>Chargement...</div>
  if (!order) return <div>Commande non trouvée</div>

  return (
    <div className="p-6">
      {/* En-tête de la commande */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commande {order.code}</h1>
        <p className="text-gray-600">Client: {order.clientName}</p>
        <p className="text-gray-600">Date: {order.orderDate}</p>
        <p className="text-gray-600">Statut: {order.stateOrder}</p>
        {order.comments && (
          <p className="text-gray-600">Commentaires: {order.comments}</p>
        )}
      </div>

      {/* Lignes de commande */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Lignes de commande</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Article</th>
              <th className="p-2 text-right">Quantité</th>
              <th className="p-2 text-right">Prix unitaire</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(line => (
              <tr key={line.id} className="border-t">
                <td className="p-2">
                  {line.articleDesignation}
                  <br />
                  <span className="text-sm text-gray-500">{line.articleCode}</span>
                </td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    value={line.quantity}
                    onChange={(e) => handleUpdateQuantity(line.id, Number(e.target.value))}
                    className="w-20 text-right border rounded px-2 py-1"
                    min="1"
                  />
                </td>
                <td className="p-2 text-right">{line.unitPrice.toFixed(2)}€</td>
                <td className="p-2 text-right font-semibold">
                  {line.totalPrice.toFixed(2)}€
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleRemoveLine(line.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 font-bold">
              <td colSpan={3} className="p-2 text-right">Total:</td>
              <td className="p-2 text-right">{total.toFixed(2)}€</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {order.stateOrder === 'IN_PREPARATION' && (
          <button
            onClick={handleConfirmOrder}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Confirmer la commande
          </button>
        )}
        
        {order.stateOrder !== 'CONFIRMED' && order.stateOrder !== 'DELIVERED' && (
          <button
            onClick={handleCancelOrder}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Annuler la commande
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## 🎯 Workflow Complet

### **Scénario: Créer et Traiter une Commande**

```typescript
// 1. Créer la commande
const order = await clientOrderService.create({
  code: "ORD-2025-001",
  orderDate: "2025-11-09",
  clientId: 5,
  comments: "Nouvelle commande"
})
console.log('Statut:', order.stateOrder) // IN_PREPARATION

// 2. Ajouter des lignes
await orderClientLineService.create({
  clientOrderId: order.id,
  articleId: 1,
  quantity: 5
})

await orderClientLineService.create({
  clientOrderId: order.id,
  articleId: 2,
  quantity: 3
})

// 3. Calculer le total
const total = await orderClientLineService.calculateTotal(order.id)
console.log('Total:', total)

// 4. Confirmer la commande
await clientOrderService.updateOrderStatus(order.id, OrderStatus.CONFIRMED)

// 5. Marquer comme livrée
await clientOrderService.updateOrderStatus(order.id, OrderStatus.DELIVERED)
```

---

## ⚠️ Règles Importantes

### **Client Order**
- ✅ Créé avec statut `IN_PREPARATION`
- ❌ Ne peut pas supprimer si `DELIVERED` ou `CANCELED`
- ❌ Ne peut pas annuler si `CONFIRMED`

### **Order Client Line**
- ✅ Peut ajouter seulement si commande `IN_PREPARATION`
- ✅ Suppression retourne le stock automatiquement
- ❌ Ne peut pas supprimer si commande `DELIVERED`

---

**God is good all the time** 🙏
