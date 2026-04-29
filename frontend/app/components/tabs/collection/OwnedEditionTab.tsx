import { OwnedEditionTable } from "~/components/tables/OwnedEditionTable";
import type { OwnedEdition } from "~/models/ownedEdition";

interface OwnedEditionTabProps {
  ownedEditions: OwnedEdition[];
}

export function OwnedEditionTab({ ownedEditions }: OwnedEditionTabProps) {
  // TODO : fetch here
  return (
    <div className="space-y-2">
      <OwnedEditionTable editionList={ownedEditions}></OwnedEditionTable>
    </div>
  );
}
