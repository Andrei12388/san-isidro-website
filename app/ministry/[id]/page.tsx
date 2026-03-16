import MinistryMembers from "@/components/dashboard/sections/ui/MinistryMembers"
import MinistryTrainings from "@/components/dashboard/sections/ui/MinistryTrainings"

export default async function MinistryPage({params}:any){
 const resolvedParams = await params;
return(

<div className="space-y-8 p-6">

<MinistryMembers ministryId={resolvedParams.id}/>

<MinistryTrainings ministryId={resolvedParams.id}/>

</div>

)

}