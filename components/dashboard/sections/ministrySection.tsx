"use client"

import { useEffect, useState } from "react"
import MinistryCard from "./ui/MinistryCard"

export default function MinistriesSection() {

const [ministries,setMinistries] = useState([])
const [loading,setLoading] = useState(true)

useEffect(()=>{

async function fetchMinistries(){

const token = localStorage.getItem("token")

const res = await fetch("/api/postgre/ministries",{
headers:{
Authorization:`Bearer ${token}`
}
})

const data = await res.json()

setMinistries(data.data || [])
setLoading(false)

}

fetchMinistries()

},[])

if(loading) return <div>Loading ministries...</div>

return(

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{ministries.map((m:any)=>(
<MinistryCard key={m.id} ministry={m}/>
))}

</div>

)

}