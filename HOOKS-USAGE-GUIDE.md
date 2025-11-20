# 🎣 Guide d'Utilisation des Hooks Client Order

## 📋 Vue d'ensemble

Ce guide montre comment utiliser les hooks React Query pour gérer les commandes clients et leurs lignes.

---

## 🎯 Hooks Client Order

### **1. useClientOrders() - Liste de toutes les commandes**

```typescript
import { useClientOrders } from '@/hooks/commandes/cmdClient/useClientOrder'

function OrdersListPage() {
  const { data: orders, isLoading, isError, error, refetch } = useClientOrders()

  if (isLoading) return <div>Chargement...</div>
  if (isError) return <div>Erreur: {error.message}</div>

  return (
    <div>
      <h1>Toutes les commandes ({orders?.length})</h1>
      <button onClick={() => refetch()}>Actualiser</button>
      
      {orders?.map(order => (
        <div key={order.id}>
          <h3>{order.code}</h3>
          <p>Client: {order.clientName}</p>
          <p>Statut: {order.stateOrder}</p>
          <p>Date: {order.orderDate}</p>
        </div>
      ))}
    </div>
  )
}
```

---

### **2. useClientOrder(id) - Gestion d'une commande spécifique**

```typescript
import { useClientOrder } from '@/hooks/commandes/cmdClient/useClientOrder'
import { OrderStatus } from '@/types/client/clientOrder'

function OrderDetailsPage({ orderId }: { orderId: number }) {
  const {
    // Query data
    order,
    isLoading,
    isError,
    error,
    refetch,
    
    // Mutations
    updateClientOrder,
    deleteClientOrder,
    updateOrderStatus,
    cancelOrder,
    
    // Loading states
    isUpdating,
    isDeleting,
    isUpdatingStatus,
    isCancelling,
    
    // Errors
    updateError,
    deleteError,
    statusError,
    cancelError,
  } = useClientOrder(orderId)

  const handleUpdate = () => {
    updateClientOrder({
      code: order!.code,
      orderDate: order!.orderDate,
      clientId: order!.clientId,
      comments: "Commande modifiée"
    })
  }

  const handleConfirm = () => {
    updateOrderStatus(OrderStatus.CONFIRMED)
  }

  const handleCancel = () => {
    if (confirm('Annuler cette commande?')) {
      cancelOrder()
    }
  }

  const handleDelete = () => {
    if (confirm('Supprimer cette commande?')) {
      deleteClientOrder()
    }
  }

  if (isLoading) return <div>Chargement...</div>
  if (isError) return <div>Erreur: {error?.message}</div>
  if (!order) return <div>Commande non trouvée</div>

  return (
    <div>
      <h1>Commande {order.code}</h1>
      <p>Client: {order.clientName}</p>
      <p>Statut: {order.stateOrder}</p>
      <p>Date: {order.orderDate}</p>
      {order.comments && <p>Commentaires: {order.comments}</p>}
      
      <div className="actions">
        <button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? 'Mise à jour...' : 'Modifier'}
        </button>
        
        <button onClick={handleConfirm} disabled={isUpdatingStatus}>
          {isUpdatingStatus ? 'Confirmation...' : 'Confirmer'}
        </button>
        
        <button onClick={handleCancel} disabled={isCancelling}>
          {isCancelling ? 'Annulation...' : 'Annuler'}
        </button>
        
        <button onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? 'Suppression...' : 'Supprimer'}
        </button>
      </div>
      
      {updateError && <p className="error">Erreur: {updateError.message}</p>}
      {statusError && <p className="error">Erreur: {statusError.message}</p>}
      {cancelError && <p className="error">Erreur: {cancelError.message}</p>}
      {deleteError && <p className="error">Erreur: {deleteError.message}</p>}
    </div>
  )
}
```

---

### **3. useCreateClientOrder() - Créer une nouvelle commande**

```typescript
import { useCreateClientOrder } from '@/hooks/commandes/cmdClient/useClientOrder'
import { ClientOrderRequest } from '@/types/client/clientOrder'
import { useRouter } from 'next/navigation'

function CreateOrderForm({ clientId }: { clientId: number }) {
  const router = useRouter()
  const createMutation = useCreateClientOrder()
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const orderData: ClientOrderRequest = {
      code: formData.get('code') as string,
      orderDate: formData.get('orderDate') as string,
      clientId: clientId,
      comments: formData.get('comments') as string || undefined,
      // Note: pas de stateOrder (géré automatiquement par le backend)
    }
    
    try {
      const newOrder = await createMutation.mutateAsync(orderData)
      console.log('Commande créée:', newOrder)
      router.push(`/orders/${newOrder.id}`)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nouvelle Commande</h2>
      
      <div>
        <label>Code:</label>
        <input name="code" required />
      </div>
      
      <div>
        <label>Date:</label>
        <input name="orderDate" type="date" required />
      </div>
      
      <div>
        <label>Commentaires:</label>
        <textarea name="comments" />
      </div>
      
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Création...' : 'Créer la commande'}
      </button>
      
      {createMutation.isError && (
        <p className="error">Erreur: {createMutation.error.message}</p>
      )}
    </form>
  )
}
```

---

### **4. useClientOrdersByClient(clientId) - Commandes d'un client**

```typescript
import { useClientOrdersByClient } from '@/hooks/commandes/cmdClient/useClientOrder'

function ClientOrdersPage({ clientId }: { clientId: number }) {
  const { data: orders, isLoading, isError, error } = useClientOrdersByClient(clientId)

  if (isLoading) return <div>Chargement...</div>
  if (isError) return <div>Erreur: {error.message}</div>

  return (
    <div>
      <h2>Commandes du client ({orders?.length})</h2>
      {orders?.map(order => (
        <div key={order.id}>
          <h3>{order.code}</h3>
          <p>Statut: {order.stateOrder}</p>
          <p>Date: {order.orderDate}</p>
        </div>
      ))}
    </div>
  )
}
```

---

### **5. useClientOrdersByStatus(status) - Commandes par statut**

```typescript
import { useClientOrdersByStatus } from '@/hooks/commandes/cmdClient/useClientOrder'
import { OrderStatus } from '@/types/client/clientOrder'

function PendingOrdersPage() {
  const { data: orders, isLoading } = useClientOrdersByStatus(OrderStatus.PENDING)

  return (
    <div>
      <h2>Commandes en attente ({orders?.length})</h2>
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        orders?.map(order => (
          <div key={order.id}>
            <h3>{order.code}</h3>
            <p>Client: {order.clientName}</p>
          </div>
        ))
      )}
    </div>
  )
}
```

---

## 🎯 Hooks Order Client Line

### **1. useOrderClientLines() - Créer, Modifier, Supprimer**

```typescript
import { useOrderClientLines } from '@/hooks/commandes/cmdClient/useOrderClientLine'
import { OrderClientLineRequest } from '@/types/client/orderClientLine'

function OrderLinesManager({ orderId }: { orderId: number }) {
  const {
    // Mutations
    createOrderClientLine,
    createOrderClientLineAsync,
    updateOrderClientLine,
    deleteOrderClientLine,
    
    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    
    // Errors
    createError,
    updateError,
    deleteError,
  } = useOrderClientLines()

  const handleAddLine = () => {
    const lineData: OrderClientLineRequest = {
      clientOrderId: orderId,
      articleId: 5,
      quantity: 10
    }
    
    createOrderClientLine(lineData)
  }

  const handleUpdateQuantity = (lineId: number, newQuantity: number) => {
    updateOrderClientLine({ id: lineId, quantity: newQuantity })
  }

  const handleDeleteLine = (lineId: number) => {
    if (confirm('Supprimer cette ligne?')) {
      deleteOrderClientLine(lineId)
    }
  }

  return (
    <div>
      <button onClick={handleAddLine} disabled={isCreating}>
        {isCreating ? 'Ajout...' : 'Ajouter une ligne'}
      </button>
      
      {createError && <p className="error">Erreur: {createError.message}</p>}
      {updateError && <p className="error">Erreur: {updateError.message}</p>}
      {deleteError && <p className="error">Erreur: {deleteError.message}</p>}
    </div>
  )
}
```

---

### **2. useOrderClientLinesByOrder(orderId) - Lignes d'une commande**

```typescript
import { useOrderClientLinesByOrder } from '@/hooks/commandes/cmdClient/useOrderClientLine'

function OrderLinesDisplay({ orderId }: { orderId: number }) {
  const {
    // Lines data
    lines,
    isLoading,
    isError,
    error,
    refetch,
    
    // Total data
    total,
    isLoadingTotal,
    refetchTotal,
  } = useOrderClientLinesByOrder(orderId)

  if (isLoading) return <div>Chargement des lignes...</div>
  if (isError) return <div>Erreur: {error?.message}</div>

  return (
    <div>
      <h2>Lignes de commande</h2>
      
      <table>
        <thead>
          <tr>
            <th>Article</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {lines?.map(line => (
            <tr key={line.id}>
              <td>
                {line.articleDesignation}
                <br />
                <small>{line.articleCode}</small>
              </td>
              <td>{line.quantity}</td>
              <td>{line.unitPrice.toFixed(2)}€</td>
              <td>{line.totalPrice.toFixed(2)}€</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}><strong>Total:</strong></td>
            <td>
              <strong>
                {isLoadingTotal ? '...' : `${total?.toFixed(2)}€`}
              </strong>
            </td>
          </tr>
        </tfoot>
      </table>
      
      <button onClick={() => { refetch(); refetchTotal(); }}>
        Actualiser
      </button>
    </div>
  )
}
```

---

### **3. useOrderClientLine(id) - Gestion d'une ligne spécifique**

```typescript
import { useOrderClientLine } from '@/hooks/commandes/cmdClient/useOrderClientLine'

function OrderLineEditor({ lineId }: { lineId: number }) {
  const {
    // Query data
    line,
    isLoading,
    isError,
    error,
    
    // Mutations
    updateOrderClientLine,
    deleteOrderClientLine,
    
    // Loading states
    isUpdating,
    isDeleting,
    
    // Errors
    updateError,
    deleteError,
  } = useOrderClientLine(lineId)

  const [quantity, setQuantity] = React.useState(line?.quantity || 0)

  React.useEffect(() => {
    if (line) setQuantity(line.quantity)
  }, [line])

  const handleUpdate = () => {
    updateOrderClientLine(quantity)
  }

  const handleDelete = () => {
    if (confirm('Supprimer cette ligne?')) {
      deleteOrderClientLine()
    }
  }

  if (isLoading) return <div>Chargement...</div>
  if (isError) return <div>Erreur: {error?.message}</div>
  if (!line) return <div>Ligne non trouvée</div>

  return (
    <div>
      <h3>{line.articleDesignation}</h3>
      <p>Code: {line.articleCode}</p>
      <p>Prix unitaire: {line.unitPrice}€</p>
      
      <div>
        <label>Quantité:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
        />
        <button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </div>
      
      <p>Total: {line.totalPrice}€</p>
      
      <button onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? 'Suppression...' : 'Supprimer'}
      </button>
      
      {updateError && <p className="error">Erreur: {updateError.message}</p>}
      {deleteError && <p className="error">Erreur: {deleteError.message}</p>}
    </div>
  )
}
```

---

## 🎨 Exemple Complet: Page de Gestion de Commande

```typescript
'use client'

import { useState } from 'react'
import { useClientOrder } from '@/hooks/commandes/cmdClient/useClientOrder'
import { useOrderClientLines, useOrderClientLinesByOrder } from '@/hooks/commandes/cmdClient/useOrderClientLine'
import { OrderStatus } from '@/types/client/clientOrder'
import { OrderClientLineRequest } from '@/types/client/orderClientLine'

export default function OrderManagementPage({ orderId }: { orderId: number }) {
  // Hooks pour la commande
  const {
    order,
    isLoading: isLoadingOrder,
    updateOrderStatus,
    cancelOrder,
    isUpdatingStatus,
    isCancelling,
  } = useClientOrder(orderId)

  // Hooks pour les lignes
  const {
    lines,
    total,
    isLoading: isLoadingLines,
    refetch: refetchLines,
  } = useOrderClientLinesByOrder(orderId)

  const {
    createOrderClientLine,
    updateOrderClientLine,
    deleteOrderClientLine,
    isCreating,
  } = useOrderClientLines()

  // État local pour le formulaire
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)

  // Handlers
  const handleAddLine = () => {
    if (!selectedArticleId || quantity < 1) return

    const lineData: OrderClientLineRequest = {
      clientOrderId: orderId,
      articleId: selectedArticleId,
      quantity: quantity,
    }

    createOrderClientLine(lineData, {
      onSuccess: () => {
        setShowAddForm(false)
        setSelectedArticleId(0)
        setQuantity(1)
        refetchLines()
      }
    })
  }

  const handleUpdateQuantity = (lineId: number, newQuantity: number) => {
    updateOrderClientLine({ id: lineId, quantity: newQuantity })
  }

  const handleDeleteLine = (lineId: number) => {
    if (confirm('Supprimer cette ligne?')) {
      deleteOrderClientLine(lineId)
    }
  }

  const handleConfirmOrder = () => {
    if (confirm('Confirmer cette commande?')) {
      updateOrderStatus(OrderStatus.CONFIRMED)
    }
  }

  const handleCancelOrder = () => {
    if (confirm('Annuler cette commande?')) {
      cancelOrder()
    }
  }

  // Loading
  if (isLoadingOrder || isLoadingLines) {
    return <div className="p-6">Chargement...</div>
  }

  if (!order) {
    return <div className="p-6">Commande non trouvée</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4">Commande {order.code}</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Client</p>
            <p className="font-semibold">{order.clientName}</p>
          </div>
          <div>
            <p className="text-gray-600">Date</p>
            <p className="font-semibold">{order.orderDate}</p>
          </div>
          <div>
            <p className="text-gray-600">Statut</p>
            <p className="font-semibold">
              <span className={`px-2 py-1 rounded ${
                order.stateOrder === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                order.stateOrder === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.stateOrder}
              </span>
            </p>
          </div>
          {order.comments && (
            <div>
              <p className="text-gray-600">Commentaires</p>
              <p className="font-semibold">{order.comments}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lignes de commande */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Lignes de commande</h2>
          {order.stateOrder === 'IN_PREPARATION' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showAddForm ? 'Annuler' : 'Ajouter une ligne'}
            </button>
          )}
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Article</label>
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value={0}>Sélectionner...</option>
                  {/* Charger la liste des articles */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantité</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddLine}
                  disabled={isCreating || !selectedArticleId}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isCreating ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table des lignes */}
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Article</th>
              <th className="p-3 text-right">Quantité</th>
              <th className="p-3 text-right">Prix unitaire</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lines?.map(line => (
              <tr key={line.id} className="border-t">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{line.articleDesignation}</p>
                    <p className="text-sm text-gray-500">{line.articleCode}</p>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    value={line.quantity}
                    onChange={(e) => handleUpdateQuantity(line.id, Number(e.target.value))}
                    className="w-20 text-right border rounded px-2 py-1"
                    min="1"
                    disabled={order.stateOrder !== 'IN_PREPARATION'}
                  />
                </td>
                <td className="p-3 text-right">{line.unitPrice.toFixed(2)}€</td>
                <td className="p-3 text-right font-semibold">{line.totalPrice.toFixed(2)}€</td>
                <td className="p-3 text-center">
                  {order.stateOrder === 'IN_PREPARATION' && (
                    <button
                      onClick={() => handleDeleteLine(line.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 font-bold">
            <tr>
              <td colSpan={3} className="p-3 text-right">Total:</td>
              <td className="p-3 text-right text-xl">{total?.toFixed(2)}€</td>
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
            disabled={isUpdatingStatus}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isUpdatingStatus ? 'Confirmation...' : 'Confirmer la commande'}
          </button>
        )}
        
        {order.stateOrder !== 'CONFIRMED' && order.stateOrder !== 'DELIVERED' && (
          <button
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isCancelling ? 'Annulation...' : 'Annuler la commande'}
          </button>
        )}
      </div>
    </div>
  )
}
```

---

**God is good all the time** 🙏
