import MinistryMembers from "@/components/dashboard/sections/ui/MinistryMembers"
import MinistryTrainings from "@/components/dashboard/sections/ui/MinistryTrainings"
import { MinistryMembersProvider } from "@/context/MinistryMemberContext";

export default async function MinistryPage({params}:any){
 const resolvedParams = await params;
return(

<div className="space-y-8 p-6">
<MinistryMembersProvider ministryId={resolvedParams.id}>
 <MinistryTrainings ministryId={resolvedParams.id}/>
<MinistryMembers ministryId={resolvedParams.id}/>
</MinistryMembersProvider>


</div>

)

}