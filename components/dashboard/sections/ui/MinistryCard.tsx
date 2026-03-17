"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import JoinMinistryButton from "./JoinMinistryButton"

export default function MinistryCard({ ministry }: any) {

const members = ministry.members?.length || 0
const trainings = ministry.trainings?.length || 0

return (

<Card>

<CardHeader>
<CardTitle>{ministry.name}</CardTitle>
</CardHeader>

<CardContent className="space-y-3">

<div className="text-sm text-muted-foreground">
Members: {members}
</div>

<div className="text-sm text-muted-foreground">
Trainings: {trainings}
</div>

<div className="flex items-center gap-2">

<Link className="" href={`/ministry/${ministry.id}`}>
View
</Link>

<JoinMinistryButton ministryId={ministry.id}/>

</div>

</CardContent>

</Card>

)

}