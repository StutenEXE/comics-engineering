import { OwnedEditionTable } from "~/components/tables/OwnedEditionTable";
import { useAppSelector } from "~/store/hooks";
import { useCollectionQuery } from "~/store/services/api";
import { createError } from "~/utils/error";

interface OwnedEditionTabProps {}

export function OwnedEditionTab({}: OwnedEditionTabProps) {
  const { user } = useAppSelector((state) => state.user);

  const { data, isLoading, error } = useCollectionQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );

  const ownedEds = data?.ownedEditions ?? [];
  const err = createError(error);
  return (
    <div className="space-y-2">
      <OwnedEditionTable
        editionList={ownedEds}
        isLoading={isLoading}
        error={err}
      />
    </div>
  );
}
