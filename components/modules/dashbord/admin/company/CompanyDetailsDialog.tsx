"use client"

import { Company } from "@/types"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CompanyImage } from "./CompanyImage"
import { CopyButton } from "@/components/ui/copy-button"
import { Mail, Phone, Globe, MapPin, Calendar, FileText, Tag } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CompanyDetailsDialogProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyDetailsDialog({ company, open, onOpenChange }: CompanyDetailsDialogProps) {
  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header avec photo en grand */}
        <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <CompanyImage
              companyId={company.id}
              companyName={company.name}
              className="h-48 w-48 rounded-2xl object-cover border-4 border-white shadow-lg"
              fallbackClassName="h-48 w-48 rounded-2xl bg-white/90 flex items-center justify-center border-4 border-white shadow-lg"
            />
            <div>
              <h2 className="text-2xl font-bold text-foreground">{company.name}</h2>
              <p className="text-sm text-muted-foreground font-mono bg-white/50 px-3 py-1 rounded-full mt-2">
                {company.fiscalCode}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-8 space-y-8">
          {/* Informations de contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer" onClick={() => window.open(`mailto:${company.email}`)}>
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold break-all">{company.email}</p>
                </div>
                <CopyButton 
                  text={company.email} 
                  label="Email"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer" onClick={() => window.open(`tel:${company.phoneNumber}`)}>
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                  <p className="text-sm font-semibold font-mono">{company.phoneNumber}</p>
                </div>
                <CopyButton 
                  text={company.phoneNumber} 
                  label="Téléphone"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          {company.address && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Adresse</h3>
              <div className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{company.address.address1}</p>
                    {company.address.address2 && (
                      <p className="text-sm text-muted-foreground">{company.address.address2}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {company.address.city}, {company.address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{company.address.country}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Site web */}
          {company.website && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Site web
              </h3>
              <div className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer" onClick={() => window.open(`https://${company.website}`, '_blank')}>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">URL</p>
                    <p className="text-blue-600 hover:text-blue-800 font-medium transition-colors break-all">
                      {company.website}
                    </p>
                  </div>
                  <CopyButton 
                    text={company.website} 
                    label="Site web"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {company.description && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Description</h3>
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {company.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Catégories */}
          {company.categories && company.categories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Catégories
              </h3>
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {company.categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{category.designation}</span>
                              <span className="text-xs text-muted-foreground ml-2">{category.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {company.categories.length} catégorie{company.categories.length > 1 ? 's' : ''} disponible{company.categories.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Date de création */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Informations</h3>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Créée le</p>
                  <p className="font-semibold">
                    {new Date(company.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}