"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

interface TextExtractionProps {
  text: string
  isProcessing: boolean
}

export function TextExtraction({ text, isProcessing }: TextExtractionProps) {
  const { toast } = useToast()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    toast({
      title: "已复制",
      description: "文本已复制到剪贴板",
    })
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "extracted-text.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isProcessing) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner className="w-8 h-8" />
          <p className="text-muted-foreground">正在提取文本...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">提取的文本</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            复制
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            下载
          </Button>
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap font-mono text-sm max-h-[600px] overflow-y-auto">
          {text || "暂无文本内容"}
        </div>
      </div>
    </Card>
  )
}
