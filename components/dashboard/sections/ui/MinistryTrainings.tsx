"use client"

import { useEffect,useState } from "react"

export default function MinistryTrainings({ministryId}:any){

const [trainings,setTrainings] = useState([])

useEffect(()=>{

async function fetchTrainings(){

const res = await fetch(`/api/postgre/ministries/${ministryId}/trainings`)
const data = await res.json()

setTrainings(data.data)

}

fetchTrainings()

},[])

return(

<div>

<h2 className="text-xl font-bold mb-4">Trainings</h2>

<ul className="space-y-2">

{trainings.map((t:any)=>(
<li key={t.id} className="border rounded p-2">

{t.title}

</li>
))}

</ul>

</div>

)

}