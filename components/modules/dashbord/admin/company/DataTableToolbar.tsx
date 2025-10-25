"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { DataTableViewOptions } from "./DataTableViewOptions"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-end">
      <DataTableViewOptions table={table} />
    </div>
  )
}