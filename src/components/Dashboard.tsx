'use client'

import { useState } from 'react'
import { ChatBox } from '@/components/ChatBox'
import { FileList } from '@/components/FileList'
import { FileUploader } from '@/components/FileUploader'
import { TokenUsage } from '@/components/TokenUsage'

interface FileInfo {
  id: string
  filename: string
  originalName: string
  contentType: string
  fileSize: number
  createdAt: string
}

export function Dashboard({ currentUser }: { currentUser: string }) {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)
  const [filesRefreshKey, setFilesRefreshKey] = useState(0)
  const [usageRefreshKey, setUsageRefreshKey] = useState(0)

  const refreshFiles = () => setFilesRefreshKey((key) => key + 1)
  const refreshUsage = () => setUsageRefreshKey((key) => key + 1)

  return (
    <main className="mx-auto grid h-[calc(100vh-57px)] max-w-[1500px] grid-cols-1 gap-0 px-4 py-4 lg:grid-cols-[340px_1fr]">
      <aside className="flex min-h-0 flex-col gap-3 border-r border-neutral-200 pr-4">
        <section className="rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-950">Documents</h2>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className={`rounded-md px-2.5 py-1 text-xs ${
                selectedFile
                  ? 'text-neutral-600 hover:bg-neutral-100'
                  : 'bg-neutral-900 text-white'
              }`}
            >
              General
            </button>
          </div>
          <FileUploader
            onFileUploaded={(file) => {
              setSelectedFile(file)
              refreshFiles()
            }}
          />
        </section>

        <section className="min-h-0 flex-1 rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-950">Your Files</h2>
          <div className="max-h-[280px] overflow-y-auto pr-1">
            <FileList
              refreshKey={filesRefreshKey}
              selectedFileId={selectedFile?.id}
              onFileSelect={setSelectedFile}
            />
          </div>
        </section>

        <TokenUsage refreshKey={usageRefreshKey} currentUser={currentUser} />
      </aside>

      <section className="min-h-0 pl-4">
        <ChatBox
          fileId={selectedFile?.id}
          selectedFileName={selectedFile?.originalName}
          onMessageSent={refreshUsage}
        />
      </section>
    </main>
  )
}
