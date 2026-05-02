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
  const [chatResetKey, setChatResetKey] = useState(0)

  const refreshFiles = () => setFilesRefreshKey((key) => key + 1)
  const refreshUsage = () => setUsageRefreshKey((key) => key + 1)
  const startNewChat = () => {
    setSelectedFile(null)
    setChatResetKey((key) => key + 1)
  }

  return (
    <main className="mx-auto grid h-[calc(100vh-65px)] max-w-[1600px] grid-cols-1 gap-0 px-4 py-4 lg:grid-cols-[420px_1fr]">
      <aside className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 border-r border-neutral-200 pr-4">
        <section className="rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-950">Documents</h2>
            <div className="flex items-center gap-1">
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
              <button
                type="button"
                onClick={startNewChat}
                className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
              >
                New draft
              </button>
            </div>
          </div>
          <FileUploader
            onFileUploaded={(file) => {
              setSelectedFile(file)
              refreshFiles()
            }}
          />
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-[#fbfbfa] p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-950">Your Files</h2>
            <span className="text-xs text-neutral-500">Scroll to view</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
          resetKey={chatResetKey}
          onMessageSent={refreshUsage}
        />
      </section>
    </main>
  )
}
