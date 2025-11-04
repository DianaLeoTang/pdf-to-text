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

    const { text: mindMapJson } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `基于以下文本内容，生成一个思维导图结构。

要求：
1. 提取文本的核心主题作为中心节点
2. 识别主要分支（2-5个）
3. 每个分支可以有子节点（最多2层）
4. 节点标签应该简洁（不超过15个字）
5. 以JSON格式返回，格式如下：

{
  "mindMap": {
    "id": "root",
    "label": "中心主题",
    "children": [
      {
        "id": "branch1",
        "label": "分支1",
        "children": [
          {
            "id": "branch1-1",
            "label": "子节点1-1"
          }
        ]
      }
    ]
  }
}

文本内容：
${truncatedText}`,
    })

    // Parse the JSON response
    const parsed = JSON.parse(mindMapJson)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("[v0] Error generating mind map:", error)
    return NextResponse.json({ error: "生成思维导图失败" }, { status: 500 })
  }
}
