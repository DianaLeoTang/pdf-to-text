import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "未提供文本" }, { status: 400 })
    }

    // Limit text length to avoid token limits
    const truncatedText = text.slice(0, 8000)

    const { text: quizJson } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `基于以下文本内容，生成5道选择题。每道题应该有4个选项，只有一个正确答案。

要求：
1. 题目应该测试对文本内容的理解
2. 选项应该合理且有一定迷惑性
3. 提供每道题的解析说明
4. 以JSON格式返回，格式如下：

{
  "questions": [
    {
      "question": "问题内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctAnswer": 0,
      "explanation": "答案解析"
    }
  ]
}

文本内容：
${truncatedText}`,
    })

    // Parse the JSON response
    const parsed = JSON.parse(quizJson)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("[v0] Error generating quiz:", error)
    return NextResponse.json({ error: "生成问答题失败" }, { status: 500 })
  }
}
