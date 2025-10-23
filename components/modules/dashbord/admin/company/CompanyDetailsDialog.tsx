"use client"

import { Company } from "@/types"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CompanyImage } from "./CompanyImage"
import { CopyButton } from "@/components/ui/copy-button"
import { Mail, Phone, Globe, MapPin, Calendar, FileText } from "lucide-react"

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
            <h3 className="text-lg font-semibold mb-4 text-foreground">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold">{company.email}</p>
                </div>
                <CopyButton 
                  text={company.email} 
                  label="Email"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
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
                    <p className="font-medium">{company.address.street}</p>
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
              <h3 className="text-lg font-semibold mb-4 text-foreground">Site web</h3>
              <div className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <a 
                      href={`https://${company.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                    >
                      {company.website}
                    </a>
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