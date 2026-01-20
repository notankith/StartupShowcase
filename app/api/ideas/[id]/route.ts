import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo/client"
import jwt from "jsonwebtoken"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const cookie = req.headers.get("cookie") || ""
    const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("session="))
    const token = match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const secret = process.env.JWT_SECRET || "change-me"
    const decoded: any = jwt.verify(token, secret)
    const user = decoded.user

    const db = await getDb()
    const ideas = db.collection("ideas")
    const files = db.collection("idea_files")

    const idea = await ideas.findOne({ _id: id })
    if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (String(idea.user_id) !== String(user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const ideaFiles = await files.find({ idea_id: id }).toArray()
    return NextResponse.json({ data: { idea, files: ideaFiles } })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()
    const cookie = req.headers.get("cookie") || ""
    const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("session="))
    const token = match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const secret = process.env.JWT_SECRET || "change-me"
    const decoded: any = jwt.verify(token, secret)
    const user = decoded.user

    const db = await getDb()
    const ideas = db.collection("ideas")

    const idea = await ideas.findOne({ _id: id })
    if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (String(idea.user_id) !== String(user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const update: any = { updated_at: new Date() }
    if (body.title !== undefined) update.title = body.title
    if (body.problem_statement !== undefined) update.problem_statement = body.problem_statement
    if (body.solution !== undefined) update.solution = body.solution
    if (body.market_opportunity !== undefined) update.market_opportunity = body.market_opportunity
    if (body.team_description !== undefined) update.team_description = body.team_description
    if (body.category !== undefined) update.category = body.category
    if (body.tags !== undefined) update.tags = body.tags
    if (body.status !== undefined) update.status = body.status
    if (body.whatsapp_group_url !== undefined) update.whatsapp_group_url = body.whatsapp_group_url
    if (body.mentor_assigned !== undefined) update.mentor_assigned = body.mentor_assigned
    if (body.achievements !== undefined) update.achievements = body.achievements
    if (body.skills_needed !== undefined) update.skills_needed = body.skills_needed
    if (body.call_to_action !== undefined) update.call_to_action = body.call_to_action
    if (body.founder_program !== undefined) update.founder_program = body.founder_program
    if (body.logo_url !== undefined) update.logo_url = body.logo_url
    if (body.stage !== undefined) update.stage = body.stage

    await ideas.updateOne({ _id: id }, { $set: update })
    const updated = await ideas.findOne({ _id: id })
    return NextResponse.json({ data: updated })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const cookie = req.headers.get("cookie") || ""
    const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("session="))
    const token = match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const secret = process.env.JWT_SECRET || "change-me"
    const decoded: any = jwt.verify(token, secret)
    const user = decoded.user

    const db = await getDb()
    const ideas = db.collection("ideas")

    const idea = await ideas.findOne({ _id: id })
    if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (String(idea.user_id) !== String(user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await ideas.deleteOne({ _id: id })
    return NextResponse.json({ data: { deleted: true } })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
