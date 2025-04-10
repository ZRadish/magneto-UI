import * as React from "react"

export const Card = ({ children, className = "" }: any) => (
  <div className={`bg-gray-800 p-4 rounded-xl border border-violet-700 ${className}`}>
    {children}
  </div>
)

export const CardHeader = ({ children, className = "" }: any) => (
  <div className={`text-lg font-bold text-gray-200 mb-2 ${className}`}>
    {children}
  </div>
)

export const CardTitle = ({ children }: any) => (
  <div className="text-xl font-bold text-gray-300">{children}</div>
)

export const CardDescription = ({ children }: any) => (
  <p className="text-sm text-gray-400">{children}</p>
)

export const CardContent = ({ children, className = "" }: any) => (
  <div className={`text-gray-300 ${className}`}>{children}</div>
)

export const CardFooter = ({ children, className = "" }: any) => (
  <div className={`mt-4 text-sm text-gray-400 ${className}`}>{children}</div>
)