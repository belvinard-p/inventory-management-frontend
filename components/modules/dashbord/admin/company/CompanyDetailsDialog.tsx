"use client"

import { Company } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CompanyImage } from "./CompanyImage"
import { Building2, Mail, Phone, Globe, MapPin, Calendar, FileText } from "lucide-react"

interface CompanyDetailsDialogProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyDetailsDialog({ company, open, onOpenChange }: CompanyDetailsDialogProps) {
  if (!company) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CompanyImage
              companyId={company.id}
              companyName={company.name}
              className="h-12 w-12 rounded-lg object-cover border"
              fallbackClassName="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
            />
            <div>
              <h2 className="text-xl font-semibold">{company.name}</h2>
              <p className="text-sm text-muted-foreground">{company.fiscalCode}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de contact */}
          <div>
            <h3 className="text-lg font-medium mb-3">Informations de contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{company.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground font-mono">{company.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Adresse */}
          {company.address && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-3">Adresse</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="space-y-1">
                    <p className="text-sm">{company.address.street}</p>
                    <p className="text-sm">
                      {company.address.city}, {company.address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{company.address.country}</p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Site web */}
          {company.website && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-3">Site web</h3>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`https://${company.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Description */}
          {company.description && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-3">Description</h3>
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {company.description}
                  </p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Informations système */}
          <div>
            <h3 className="text-lg font-medium mb-3">Informations système</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date de création</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(company.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Statut</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}