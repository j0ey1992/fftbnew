'use client'

import React from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
}

interface TableHeaderProps {
  children: React.ReactNode
  className?: string
}

interface TableBodyProps {
  children: React.ReactNode
  className?: string
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
}

interface TableHeaderCellProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse ${className}`}>
        {children}
      </table>
    </div>
  )
}

function Header({ children, className = '' }: TableHeaderProps) {
  return (
    <thead className={`bg-[#0a0f1f]/50 ${className}`}>
      {children}
    </thead>
  )
}

function Body({ children, className = '' }: TableBodyProps) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  )
}

function Row({ children, className = '' }: TableRowProps) {
  return (
    <tr className={`border-b border-white/5 hover:bg-white/5 transition-colors ${className}`}>
      {children}
    </tr>
  )
}

function Cell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-4 py-3 ${className}`}>
      {children}
    </td>
  )
}

function HeaderCell({ children, className = '' }: TableHeaderCellProps) {
  return (
    <th className={`px-4 py-3 text-left font-medium text-gray-300 ${className}`}>
      {children}
    </th>
  )
}

Table.Header = Header
Table.Body = Body
Table.Row = Row
Table.Cell = Cell
Table.HeaderCell = HeaderCell
