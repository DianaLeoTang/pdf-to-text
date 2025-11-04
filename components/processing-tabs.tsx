"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TextExtraction } from "@/components/text-extraction"
import { QuizGenerator } from "@/components/quiz-generator"
import { OutlineGenerator } from "@/components/outline-generator"
import { MindMapGenerator } from "@/components/mindmap-generator"
import { ArrowLeft, FileText, HelpCircle, List, Network } from "lucide-react"

interface ProcessingTabsProps {
  fileName: string
  extractedText: string
  isProcessing: boolean
  onReset: () => void
}

export function ProcessingTabs({ fileName, extractedText, isProcessing, onReset }: ProcessingTabsProps) {
  const [activeTab, setActiveTab] = useState("text")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="h-6 w-px bg-border" />
          <p className="text-sm text-muted-foreground">
            文件: <span className="font-medium text-foreground">{fileName}</span>
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="text" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">文本提取</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">问答题</span>
          </TabsTrigger>
          <TabsTrigger value="outline" className="gap-2">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">大纲</span>
          </TabsTrigger>
          <TabsTrigger value="mindmap" className="gap-2">
            <Network className="w-4 h-4" />
            <span className="hidden sm:inline">思维导图</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-6">
          <TextExtraction text={extractedText} isProcessing={isProcessing} />
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <QuizGenerator text={extractedText} />
        </TabsContent>

        <TabsContent value="outline" className="mt-6">
          <OutlineGenerator text={extractedText} />
        </TabsContent>

        <TabsContent value="mindmap" className="mt-6">
          <MindMapGenerator text={extractedText} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
