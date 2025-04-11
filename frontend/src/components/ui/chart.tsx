import React from "react"

export const ChartContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`chart-container ${className}`}>
    {children}
  </div>
)

export const ChartTooltip: React.FC<{ payload?: any; content: any; cursor?: any }> = ({
  content,
  cursor,
}) => content

export const ChartTooltipContent: React.FC<{ hideLabel?: boolean }> = ({ hideLabel }) => (
  <div className="bg-gray-800 p-2 rounded-md text-sm text-white">
    {!hideLabel && <p className="text-gray-400">Label</p>}
    <p className="font-semibold">Tooltip Content</p>
  </div>
)

export type ChartConfig = {
  [key: string]: {
    label: string
    color: string
  }
}
