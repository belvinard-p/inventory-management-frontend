import { useState } from 'react'
import { useSearchUsers } from './useUsers'

export const useUserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const searchQuery = useSearchUsers(searchTerm)
  
  const executeSearch = (keyword: string) => {
    setSearchTerm(keyword.trim())
  }
  
  const clearSearch = () => {
    setSearchTerm('')
  }
  
  return {
    searchResults: searchQuery.data || [],
    searchTerm,
    executeSearch,
    clearSearch,
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    isFetching: searchQuery.isFetching,
    hasResults: !!searchQuery.data && searchQuery.data.length > 0,
    resultsCount: searchQuery.data?.length || 0,
  }
}