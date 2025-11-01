export const getFrenchColumnHeader = (accessorKey: string): string => {
  const frenchHeaders: { [key: string]: string } = {
    'username': 'Nom',
    'userName': 'Nom',
    'name': 'Nom de l\'entreprise',
    'email': 'Email',
    'phoneNumber': 'Téléphone',
    'role': 'Rôle',
    'roleName': 'Rôle',
    'status': 'Statut',
    'createdAt': 'Date de création',
    'createdDate': 'Date de création',
    'actions': 'Actions',
    // Article columns
    'codeArticle': 'Code Article',
    'designation': 'Désignation',
    'availableQuantity': 'Stock disponible',
    'quantityInStock': 'Stock',
    'reservedQuantity': 'Réservé',
    'unitPriceExclTax': 'Prix unitaire HT',
    'unitPriceAllTax': 'Prix unitaire TTC',
    'rateTva': 'TVA',
    'categoryDesignation': 'Catégorie',
    'updatedDate': 'Date de mise à jour'
  }
  
  return frenchHeaders[accessorKey] || accessorKey
}