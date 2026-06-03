import { OwnedEditionTable } from "~/components/tables/OwnedEditionTable";

interface OwnedEditionTabProps {}

export function OwnedEditionTab({}: OwnedEditionTabProps) {

  return (
    <div className="space-y-2">
      <OwnedEditionTable />
    </div>
  );
}
