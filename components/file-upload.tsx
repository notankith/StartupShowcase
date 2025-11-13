"use client"

import type React from "react"

import { useState } from "react"
import { Upload, AlertCircle } from "lucide-react"

interface FileUploadProps {
  ideaId: string
  onFileUploaded: (file: any) => void
  disabled?: boolean
}

export function FileUpload({ ideaId, onFileUploaded, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("ideaId", ideaId)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await response.json()
      onFileUploaded(data.file)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      uploadFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  return (
    <div className="space-y-3">
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          type="file"
          id="file-input"
          onChange={handleFileInput}
          disabled={disabled || isUploading}
          accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.doc,.docx"
          className="hidden"
        />
        <label htmlFor="file-input" className="cursor-pointer block">
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">{isUploading ? "Uploading..." : "Drag and drop your file"}</p>
              <p className="text-xs text-muted-foreground mt-1">or click to select (Max 50MB)</p>
            </div>
          </div>
        </label>
      </div>

      {/* Allowed Formats */}
      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Allowed formats:</p>
        <p>PDF, PowerPoint (PPT/PPTX), Word (DOC/DOCX), Images (PNG/JPG/GIF)</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex gap-3 p-3 bg-error/10 rounded-lg text-error text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Upload failed</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
