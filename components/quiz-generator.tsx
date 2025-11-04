"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizGeneratorProps {
  text: string
}

export function QuizGenerator({ text }: QuizGeneratorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()

  const generateQuiz = async () => {
    if (!text) {
      toast({
        title: "错误",
        description: "请先上传并提取PDF文本",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setShowResults(false)
    setSelectedAnswers({})

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()
      setQuestions(data.questions)
    } catch (error) {
      console.error("[v0] Error generating quiz:", error)
      toast({
        title: "生成失败",
        description: "无法生成问答题，请重试",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (!showResults) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionIndex]: optionIndex,
      }))
    }
  }

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      toast({
        title: "提示",
        description: "请回答所有问题后再提交",
      })
      return
    }
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++
      }
    })
    return correct
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
          <p className="text-muted-foreground">正在生成问答题...</p>
        </div>
      </Card>
    )
  }

  if (questions.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground mb-2">点击下方按钮生成问答题</p>
          <Button onClick={generateQuiz} size="lg">
            <RefreshCw className="w-5 h-5 mr-2" />
            生成问答题
          </Button>
        </div>
      </Card>
    )
  }

  const score = showResults ? calculateScore() : 0

  return (
    <div className="space-y-6">
      {showResults && (
        <Card className="p-6 bg-primary/5 border-primary">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">
              得分: {score} / {questions.length}
            </h3>
            <p className="text-muted-foreground">正确率: {Math.round((score / questions.length) * 100)}%</p>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {questions.map((question, qIndex) => {
          const isAnswered = selectedAnswers[qIndex] !== undefined
          const isCorrect = selectedAnswers[qIndex] === question.correctAnswer

          return (
            <Card key={qIndex} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {qIndex + 1}
                  </span>
                  <h4 className="text-lg font-medium flex-1">{question.question}</h4>
                  {showResults && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 ml-11">
                  {question.options.map((option, oIndex) => {
                    const isSelected = selectedAnswers[qIndex] === oIndex
                    const isCorrectOption = oIndex === question.correctAnswer
                    const showCorrect = showResults && isCorrectOption
                    const showWrong = showResults && isSelected && !isCorrectOption

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        disabled={showResults}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          showCorrect
                            ? "border-green-500 bg-green-50 dark:bg-green-950"
                            : showWrong
                              ? "border-red-500 bg-red-50 dark:bg-red-950"
                              : isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                        } ${showResults ? "cursor-default" : "cursor-pointer"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                              showCorrect
                                ? "border-green-500 bg-green-500 text-white"
                                : showWrong
                                  ? "border-red-500 bg-red-500 text-white"
                                  : isSelected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border"
                            }`}
                          >
                            {String.fromCharCode(65 + oIndex)}
                          </span>
                          <span className="flex-1">{option}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {showResults && (
                  <div className="ml-11 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">解析:</p>
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex gap-3 justify-center">
        {!showResults ? (
          <Button onClick={handleSubmit} size="lg">
            提交答案
          </Button>
        ) : (
          <Button onClick={generateQuiz} size="lg" variant="outline">
            <RefreshCw className="w-5 h-5 mr-2" />
            重新生成
          </Button>
        )}
      </div>
    </div>
  )
}
