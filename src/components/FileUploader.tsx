'use client'

import { useRef, useState } from 'react'

interface FileInfo {
  id: string
  filename: string
  originalName: string
  contentType: string
  fileSize: number
  createdAt: string
}

interface FileUploaderProps {
  onFileUploaded?: (file: FileInfo) => void
}

export function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = async (file: File) => {
    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      onFileUploaded?.(data)
    } catch {
      setError('An error occurred during upload')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className="w-full">
      <div
        className={`rounded-md border border-dashed p-4 text-center transition-colors ${
          dragOver
            ? 'border-neutral-900 bg-white'
            : 'border-neutral-300 bg-white hover:border-neutral-500'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />

        <label htmlFor="file-upload" className="block cursor-pointer">
          <div className="space-y-2">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-lg font-medium text-white">
              +
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {uploading ? 'Uploading...' : 'Drop file or click'}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                PDF or TXT, up to 10MB
              </p>
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
