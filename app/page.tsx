"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { ProcessingTabs } from "@/components/processing-tabs"
import { FileText } from "lucide-react"

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = async (file: File) => {
    setPdfFile(file)
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setExtractedText(data.text)
    } catch (error) {
      console.error("[v0] Error extracting text:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-balance">PDF智能分析工具</h1>
          <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            上传PDF文档，自动提取文字、生成问答题、创建大纲和思维导图
          </p>
        </header>

        {!pdfFile ? (
          <FileUpload onFileSelect={handleFileSelect} />
        ) : (
          <ProcessingTabs
            fileName={pdfFile.name}
            extractedText={extractedText}
            isProcessing={isProcessing}
            onReset={() => {
              setPdfFile(null)
              setExtractedText("")
            }}
          />
        )}
      </div>
    </main>
  )
}
