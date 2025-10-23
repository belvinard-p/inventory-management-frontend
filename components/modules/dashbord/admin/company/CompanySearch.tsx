"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Search, Filter, X, Building2, Mail, Phone, Globe } from "lucide-react"
import { Company } from "@/types"

interface SearchFilters {
  hasWebsite?: boolean
  hasImage?: boolean
  city?: string
}

interface CompanySearchProps {
  data: Company[]
  onFilteredData: (filtered: Company[]) => void
  placeholder?: string
}

export function CompanySearch({ data, onFilteredData, placeholder = "Rechercher une entreprise..." }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      filterData()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, filters, data])

  const filterData = () => {
    let filtered = data

    // Recherche textuelle
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(term) ||
        company.email.toLowerCase().includes(term) ||
        company.phoneNumber.includes(term) ||
        company.fiscalCode.toLowerCase().includes(term) ||
        company.website?.toLowerCase().includes(term) ||
        company.address?.city?.toLowerCase().includes(term)
      )
    }

    // Filtres avancés
    if (filters.hasWebsite !== undefined) {
      filtered = filtered.filter(company => !!company.website === filters.hasWebsite)
    }

    if (filters.hasImage !== undefined) {
      filtered = filtered.filter(company => !!company.hasImage === filters.hasImage)
    }

    if (filters.city) {
      filtered = filtered.filter(company => 
        company.address?.city?.toLowerCase().includes(filters.city!.toLowerCase())
      )
    }

    onFilteredData(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilters({})
    setIsFilterOpen(false)
  }

  const removeFilter = (key: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  const activeFiltersCount = Object.keys(filters).length
  const hasActiveFilters = activeFiltersCount > 0 || searchTerm

  // Focus sur la recherche avec Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="space-y-3">
      {/* Barre de recherche */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Bouton filtres */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filtres avancés</h4>
              
              {/* Filtre site web */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Site web</label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.hasWebsite === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      hasWebsite: prev.hasWebsite === true ? undefined : true 
                    }))}
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Avec site
                  </Button>
                  <Button
                    variant={filters.hasWebsite === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      hasWebsite: prev.hasWebsite === false ? undefined : false 
                    }))}
                  >
                    Sans site
                  </Button>
                </div>
              </div>

              {/* Filtre image */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.hasImage === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      hasImage: prev.hasImage === true ? undefined : true 
                    }))}
                  >
                    Avec image
                  </Button>
                  <Button
                    variant={filters.hasImage === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      hasImage: prev.hasImage === false ? undefined : false 
                    }))}
                  >
                    Sans image
                  </Button>
                </div>
              </div>

              {/* Filtre ville */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ville</label>
                <Input
                  placeholder="Filtrer par ville..."
                  value={filters.city || ""}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    city: e.target.value || undefined 
                  }))}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Effacer tout
                </Button>
                <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                  Appliquer
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Bouton clear si filtres actifs */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Chips des filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              <Search className="h-3 w-3" />
              "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.hasWebsite === true && (
            <Badge variant="secondary" className="gap-1">
              <Globe className="h-3 w-3" />
              Avec site web
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('hasWebsite')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.hasWebsite === false && (
            <Badge variant="secondary" className="gap-1">
              Sans site web
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('hasWebsite')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.city && (
            <Badge variant="secondary" className="gap-1">
              Ville: {filters.city}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('city')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Indicateur de résultats */}
      <div className="text-sm text-muted-foreground">
        {data.length > 0 && (
          <>
            {hasActiveFilters ? (
              <>Affichage de {onFilteredData.length} résultat(s) sur {data.length} entreprise(s)</>
            ) : (
              <>{data.length} entreprise(s) au total</>
            )}
          </>
        )}
      </div>
    </div>
  )
}