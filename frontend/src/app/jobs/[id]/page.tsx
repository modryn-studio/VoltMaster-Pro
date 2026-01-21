'use client'

import { useParams } from 'next/navigation'

export default function JobDetailPage() {
  const params = useParams()
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
        Job Details
      </h1>
      <p className="text-muted-foreground">
        Viewing job #{params.id}
      </p>
    </div>
  )
}
