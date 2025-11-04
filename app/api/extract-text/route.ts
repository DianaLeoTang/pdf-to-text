import { type NextRequest, NextResponse } from "next/server"
import pdf from "pdf-parse/lib/pdf-parse"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "未找到文件" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const data = await pdf(buffer)

    return NextResponse.json({
      text: data.text,
      pages: data.numpages,
    })
  } catch (error) {
    console.error("[v0] Error extracting PDF text:", error)
    return NextResponse.json({ error: "提取文本失败" }, { status: 500 })
  }
}
