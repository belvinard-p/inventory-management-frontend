"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  return null
}