"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { RefreshCw, ChevronRight, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OutlineItem {
  title: string
  level: number
  children?: OutlineItem[]
}

interface OutlineGeneratorProps {
  text: string
}

export function OutlineGenerator({ text }: OutlineGeneratorProps) {
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const generateOutline = async () => {
    if (!text) {
      toast({
        title: "错误",
        description: "请先上传并提取PDF文本",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()
      setOutline(data.outline)
      // Expand all items by default
      const allKeys = new Set<string>()
      const addKeys = (items: OutlineItem[], prefix = "") => {
        items.forEach((item, index) => {
          const key = `${prefix}${index}`
          allKeys.add(key)
          if (item.children) {
            addKeys(item.children, `${key}-`)
          }
        })
      }
      addKeys(data.outline)
      setExpandedItems(allKeys)
    } catch (error) {
      console.error("[v0] Error generating outline:", error)
      toast({
        title: "生成失败",
        description: "无法生成大纲，请重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const handleDownload = () => {
    const formatOutline = (items: OutlineItem[], level = 0): string => {
      return items
        .map((item) => {
          const indent = "  ".repeat(level)
          const bullet = level === 0 ? "•" : "◦"
          let text = `${indent}${bullet} ${item.title}\n`
          if (item.children) {
            text += formatOutline(item.children, level + 1)
          }
          return text
        })
        .join("")
    }

    const outlineText = formatOutline(outline)
    const blob = new Blob([outlineText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "outline.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderOutlineItem = (item: OutlineItem, index: number, prefix = "") => {
    const key = `${prefix}${index}`
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(key)

    return (
      <div key={key} className="space-y-2">
        <div
          className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
            hasChildren ? "cursor-pointer" : ""
          }`}
          onClick={() => hasChildren && toggleExpand(key)}
        >
          {hasChildren && (
            <ChevronRight
              className={`w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          )}
          {!hasChildren && <div className="w-5" />}
          <div className="flex-1">
            <p className={`${item.level === 1 ? "font-semibold text-lg" : item.level === 2 ? "font-medium" : ""}`}>
              {item.title}
            </p>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-8 space-y-2 border-l-2 border-border pl-4">
            {item.children!.map((child, childIndex) => renderOutlineItem(child, childIndex, `${key}-`))}
          </div>
        )}
      </div>
    )
  }

  if (!text) {
    return (
      <Card className="p-12">
        <div className="text-center text-muted-foreground">
          <p>请先上传PDF文件并提取文本</p>
        </div>
      </Card>
    )
  }

  if (isGenerating) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner className="w-8 h-8" />
          <p className="text-muted-foreground">正在生成大纲...</p>
        </div>
      </Card>
    )
  }

  if (outline.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground mb-2">点击下方按钮生成文档大纲</p>
          <Button onClick={generateOutline} size="lg">
            <RefreshCw className="w-5 h-5 mr-2" />
            生成大纲
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">文档大纲</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            下载
          </Button>
          <Button variant="outline" size="sm" onClick={generateOutline}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重新生成
          </Button>
        </div>
      </div>
      <div className="space-y-1">{outline.map((item, index) => renderOutlineItem(item, index))}</div>
    </Card>
  )
}
