import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req:NextRequest){

const body = await req.json()

const completion = await prisma.ministryTrainingCompletion.upsert({

where:{
ministryMemberId_trainingId:{
ministryMemberId: body.memberId,
trainingId: body.trainingId
}
},

update:{
completed:true,
completedAt:new Date()
},

create:{
ministryMemberId: body.memberId,
trainingId: body.trainingId,
completed:true
}

})

return NextResponse.json({data:completion})

}