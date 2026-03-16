import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/middleware/auth"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(req:NextRequest,{params}:{params:{id:string}}){

const auth = await verifyAuth(req)

if(!auth) return NextResponse.json({error:"Unauthorized"},{status:401})

const body = await req.json()

const updated = await prisma.ministryMember.update({
where:{id:parseInt(params.id)},
data:{
status: body.status
}
})

return NextResponse.json({data:updated})

}