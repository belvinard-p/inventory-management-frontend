# Module Lignes de Commande Client

Ce module gère les lignes de commande client (articles dans une commande).

## Architecture

### Composants Principaux

- **AdminCmdClientLine.tsx** - Composant racine qui orchestre toute la logique
- **AdminClientLineContent.tsx** - Composant de présentation principal avec le tableau et les stats
- **AdminClientLineStates.tsx** - Composants d'état (loading, error, empty)

### Composants de Formulaire

- **CmdClientLienForm.tsx** - Formulaire pour ajouter/modifier une ligne de commande
  - Mode création : sélection d'article + quantité
  - Mode édition : modification de la quantité uniquement

### Composants de Tableau

- **Columns.tsx** - Définition des colonnes du tableau
- **CmdClientLineDtaTableRowActions.tsx** - Actions sur chaque ligne (modifier, supprimer, augmenter/diminuer quantité)
- **CmdClientLineDetailsDialog.tsx** - Dialog de détails d'une ligne

### Composants Utilitaires

- **CmdClientLineContext.tsx** - Context React pour partager l'état
- **CmdClientLineSearch.tsx** - Composant de recherche/filtrage
- **BulkActions.tsx** - Actions groupées (suppression, export CSV)

## Hooks

### useAdminCmdClientLineLogic
Hook principal qui gère toute la logique métier :
- Chargement des lignes de commande
- Récupération des détails des articles
- Gestion des mutations (create, update, delete)
- Calcul des statistiques
- Gestion de l'état du formulaire

### useOrderClientLines
Hook de mutations React Query pour :
- Créer une ligne de commande
- Mettre à jour la quantité
- Supprimer une ligne

## Services

### orderClientLineService
- `create(data)` - Créer une nouvelle ligne
- `getById(id)` - Récupérer une ligne par ID
- `getAllLinesForOrder(clientOrderId)` - Récupérer toutes les lignes d'une commande
- `updateLineQuantity(id, quantity)` - Mettre à jour la quantité
- `delete(id)` - Supprimer une ligne
- `calculateTotal(clientOrderId)` - Calculer le total de la commande

## Types

```typescript
interface OrderClientLineRequest {
  clientOrderId: number
  articleId: number
  quantity: number
}

interface OrderClientLineResponse {
  id: number
  quantity: number
  unitPrice: number
  totalPrice: number
  clientOrderId: number
  articleId: number
  articleDesignation: string
  articleCode: string
}
```

## Utilisation

```tsx
import { AdminCmdClientLinePage } from './clientLIne'

function OrderDetailsPage() {
  const orderId = 123 // ID de la commande
  
  return <AdminCmdClientLinePage clientOrderId={orderId} />
}
```

## Fonctionnalités

### Statistiques
- Total d'articles
- Quantité moyenne
- Montant total

### Filtres
- Quantité faible (≤ 5)
- Quantité moyenne (6-20)
- Quantité élevée (> 20)
- Prix élevé (> 1000€)

### Actions
- Ajouter un article
- Modifier la quantité
- Augmenter/Diminuer la quantité rapidement
- Supprimer une ligne
- Actions groupées (suppression, export CSV)

## Pattern Architectural

Ce module suit le même pattern que le module des commandes client :
1. **Hook de logique** - Gère l'état et la logique métier
2. **Composant racine** - Gère les états de chargement/erreur
3. **Composant de contenu** - Affiche les données
4. **Composants réutilisables** - Formulaires, tableaux, dialogs

## Dépendances

- React Query pour la gestion des données
- React Hook Form + Zod pour les formulaires
- TanStack Table pour le tableau
- Shadcn/ui pour les composants UI
