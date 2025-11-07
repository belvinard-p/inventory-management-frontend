"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function TestModal() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => {
        console.log('Test button clicked, setting open to true')
        setOpen(true)
      }}>
        Test Modal
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Modal</DialogTitle>
            <DialogDescription>
              This is a test modal to verify Dialog component works.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>Modal is working!</p>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}