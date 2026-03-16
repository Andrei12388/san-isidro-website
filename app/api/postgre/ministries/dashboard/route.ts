import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(){

const ministries = await prisma.ministry.findMany({
include:{
members:{
where:{status:"APPROVED"}
},
trainings:true
}
})

const data = ministries.map(m=>{

const totalMembers = m.members.length

return{
id:m.id,
name:m.name,
members:totalMembers,
trainings:m.trainings.length
}

})

return NextResponse.json({data})

}