"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const pdfFile = files.find((file) => file.type === "application/pdf")

      if (pdfFile) {
        onFileSelect(pdfFile)
      }
    },
    [onFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type === "application/pdf") {
        onFileSelect(file)
      }
    },
    [onFileSelect],
  )

  return (
    <Card className="max-w-3xl mx-auto">
      <div
        className={`p-12 border-2 border-dashed rounded-xl transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border bg-card"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="p-6 bg-primary/10 rounded-2xl">
            <Upload className="w-12 h-12 text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">上传PDF文档</h3>
            <p className="text-muted-foreground text-balance">拖放PDF文件到此处，或点击下方按钮选择文件</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild>
              <label className="cursor-pointer">
                <FileText className="w-5 h-5 mr-2" />
                选择PDF文件
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileInput} />
              </label>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">支持最大50MB的PDF文件</p>
        </div>
      </div>
    </Card>
  )
}
