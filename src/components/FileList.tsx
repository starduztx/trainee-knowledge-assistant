'use client'

import { useEffect, useState } from 'react'

interface FileInfo {
  id: string
  filename: string
  originalName: string
  contentType: string
  fileSize: number
  createdAt: string
}

interface FileListProps {
  onFileSelect?: (file: FileInfo) => void
  selectedFileId?: string
  refreshKey?: number
}

export function FileList({ onFileSelect, selectedFileId, refreshKey = 0 }: FileListProps) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/files')
        if (res.ok) {
          const data = await res.json()
          setFiles(data)
        }
      } catch (error) {
        console.error('Failed to fetch files:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [refreshKey])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="p-4 text-center text-sm text-neutral-500">Loading files...</div>
  }

  if (files.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-neutral-200 p-4 text-center text-sm text-neutral-500">
        No files uploaded yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <button
          key={file.id}
          type="button"
          onClick={() => onFileSelect?.(file)}
          className={`w-full cursor-pointer rounded-md border p-3 text-left transition-colors ${
            selectedFileId === file.id
              ? 'border-neutral-900 bg-white'
              : 'border-transparent bg-transparent hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-white text-[10px] font-bold text-neutral-700">
              {file.contentType.includes('pdf') ? 'PDF' : 'TXT'}
            </span>
            <div className="min-w-0">
              <p className="max-w-[220px] truncate text-sm font-medium text-neutral-950">
                {file.originalName}
              </p>
              <p className="text-xs text-neutral-500">
                {formatFileSize(file.fileSize)} - {formatDate(file.createdAt)}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
