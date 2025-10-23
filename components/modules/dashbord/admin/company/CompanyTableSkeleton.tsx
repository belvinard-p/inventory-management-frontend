"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function CompanyTableSkeleton() {
  return (
    <Card className="p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Search bar skeleton */}
      <div className="mb-4">
        <Skeleton className="h-10 w-80" />
      </div>
      
      {/* Table header skeleton */}
      <div className="border rounded-lg">
        <div className="flex items-center p-4 border-b bg-muted/50">
          <Skeleton className="h-4 w-4 mr-4" />
          <Skeleton className="h-4 w-32 mr-8" />
          <Skeleton className="h-4 w-48 mr-8" />
          <Skeleton className="h-4 w-32 mr-8" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Table rows skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center p-4 border-b last:border-b-0">
            <Skeleton className="h-4 w-4 mr-4" />
            <div className="flex items-center gap-3 mr-8">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-48 mr-8" />
            <Skeleton className="h-4 w-32 mr-8" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </Card>
  )
}