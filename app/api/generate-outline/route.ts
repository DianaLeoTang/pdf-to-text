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

    const { text: outlineJson } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `基于以下文本内容，生成一个结构化的文档大纲。

要求：
1. 提取文本的主要主题和子主题
2. 创建层次化的大纲结构（最多3层）
3. 每个主题应该简洁明了
4. 以JSON格式返回，格式如下：

{
  "outline": [
    {
      "title": "主题标题",
      "level": 1,
      "children": [
        {
          "title": "子主题标题",
          "level": 2,
          "children": [
            {
              "title": "详细点",
              "level": 3
            }
          ]
        }
      ]
    }
  ]
}

文本内容：
${truncatedText}`,
    })

    // Parse the JSON response
    const parsed = JSON.parse(outlineJson)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("[v0] Error generating outline:", error)
    return NextResponse.json({ error: "生成大纲失败" }, { status: 500 })
  }
}
