import { DataTable } from "../data-table"
import data from "../../../app/dashboard/data.json"

const MembersSection = () => {
  return (
    <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
              <span className="text-center"> Members Page </span>
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                     <DataTable data={data} />
                </div>
                </div>
            </div>
  )
}

export default MembersSection