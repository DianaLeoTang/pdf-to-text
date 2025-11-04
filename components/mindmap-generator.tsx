"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { RefreshCw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MindMapNode {
  id: string
  label: string
  children?: MindMapNode[]
}

interface MindMapGeneratorProps {
  text: string
}

export function MindMapGenerator({ text }: MindMapGeneratorProps) {
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [scale, setScale] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const generateMindMap = async () => {
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
      const response = await fetch("/api/generate-mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()
      setMindMap(data.mindMap)
      setScale(1)
    } catch (error) {
      console.error("[v0] Error generating mind map:", error)
      toast({
        title: "生成失败",
        description: "无法生成思维导图，请重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handleResetZoom = () => {
    setScale(1)
  }

  const renderNode = (node: MindMapNode, level = 0, isLast = false, parentColor = "") => {
    const colors = [
      "bg-primary text-primary-foreground",
      "bg-accent text-accent-foreground",
      "bg-secondary text-secondary-foreground",
      "bg-muted text-muted-foreground",
    ]

    const color = level === 0 ? colors[0] : parentColor || colors[level % colors.length]
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id} className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div
            className={`px-6 py-3 rounded-xl font-medium shadow-md ${color} ${
              level === 0 ? "text-lg" : "text-sm"
            } whitespace-nowrap max-w-xs text-center`}
          >
            {node.label}
          </div>
          {hasChildren && <div className="w-0.5 h-8 bg-border my-2" />}
        </div>
        {hasChildren && (
          <div className="flex flex-col gap-6 pt-12">
            {node.children!.map((child, index) => (
              <div key={child.id} className="relative">
                <div className="absolute left-0 top-6 w-8 h-0.5 bg-border" />
                {renderNode(child, level + 1, index === node.children!.length - 1, color)}
              </div>
            ))}
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
          <p className="text-muted-foreground">正在生成思维导图...</p>
        </div>
      </Card>
    )
  }

  if (!mindMap) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground mb-2">点击下方按钮生成思维导图</p>
          <Button onClick={generateMindMap} size="lg">
            <RefreshCw className="w-5 h-5 mr-2" />
            生成思维导图
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">思维导图</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetZoom}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={generateMindMap}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重新生成
          </Button>
        </div>
      </div>
      <div className="border rounded-lg bg-muted/20 overflow-auto" style={{ minHeight: "500px" }}>
        <div
          ref={canvasRef}
          className="p-12 inline-block min-w-full"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            transition: "transform 0.2s ease",
          }}
        >
          {renderNode(mindMap)}
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-muted-foreground">当前缩放: {Math.round(scale * 100)}%</div>
    </Card>
  )
}
