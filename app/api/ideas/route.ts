import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo/client"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cookie = req.headers.get("cookie") || ""
    const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("session="))
    const token = match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    try {
      const secret = process.env.JWT_SECRET || "change-me"
      const decoded: any = jwt.verify(token, secret)
      const user = decoded.user

      const db = await getDb()
      const ideas = db.collection("ideas")
      const now = new Date()
      const doc = {
        user_id: user.id,
        title: body.title,
        problem_statement: body.problem_statement,
        solution: body.solution,
        market_opportunity: body.market_opportunity || null,
        team_description: body.team_description || null,
        category: body.category || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        status: body.status || "draft",
        whatsapp_group_url: body.whatsapp_group_url || null,
        mentor_assigned: body.mentor_assigned || null,
        achievements: body.achievements || null,
        skills_needed: Array.isArray(body.skills_needed) ? body.skills_needed : [],
        call_to_action: body.call_to_action || null,
        founder_program: body.founder_program || null,
        logo_url: body.logo_url || null,
        stage: body.stage || "Ideation",
        created_at: now,
        updated_at: now,
      }

      const r = await ideas.insertOne(doc)
      const created = await ideas.findOne({ _id: r.insertedId })
      return NextResponse.json({ data: created })
    } catch (e: any) {
      return NextResponse.json({ error: String(e) }, { status: 401 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || ""
    const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("session="))
    const token = match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const secret = process.env.JWT_SECRET || "change-me"
    const decoded: any = jwt.verify(token, secret)
    const user = decoded.user

    const db = await getDb()
    const ideas = db.collection("ideas")

    const rows = await ideas.find({ user_id: user.id }).sort({ created_at: -1 }).toArray()
    return NextResponse.json({ data: rows })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
