import { useEffect, useState } from "react";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useTranslation } from "~/i18n/i18n";
import { type OwnedEdition } from "~/models/ownedEdition";
import { useAppSelector } from "~/store/hooks";
import {
  useCollectionQuery,
  useRemoveFromCollectionMutation,
} from "~/store/services/api";
import { compareDates } from "~/utils/date";
import { createError } from "~/utils/error";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { EditionModal } from "../modals/EditionModal";
import { EditOwnedEditionModal } from "../modals/EditOwnedEditionModal";
import { useToast } from "../toast/Toast";
import { GenericTable } from "./GenericTable";
import { createColumnHelper } from "@tanstack/react-table";

interface OwnedEditionTableProps {
  className?: string;
}

export function OwnedEditionTable({}: OwnedEditionTableProps) {
  const confirm = useConfirm();
  const { t, locale } = useTranslation();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.user);

  const { data, isLoading, error, refetch } = useCollectionQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const editionList = data?.ownedEditions ?? [];
  const err = createError(error);

  // Handles modal open/close state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const openModal = () => {
    setIsEditModalOpen(true);
  };
  const closeModal = () => {
    setIsEditModalOpen(false);
  };

  // Handles edition details modal
  const [isEditionModalOpen, setIsEditionModalOpen] = useState(false);
  const openEditionModal = () => {
    setIsEditionModalOpen(true);
  };
  const closeEditionModal = () => {
    setIsEditionModalOpen(false);
  };

  // Query to remove from a lib
  const [removeFromCollection, { isSuccess, isError }] =
    useRemoveFromCollectionMutation();
  useEffect(() => {
    if (isSuccess) {
      toast.success("toast.removeFromCollection.success");
      refetch();
    } else if (isError) {
      toast.success("toast.removeFromCollection.error");
    }
  }, [isSuccess, isError]);

  const [editionToShowId, setEditionToShowId] = useState<number>();
  const [editedOwnedEdition, setEditedOwnedEdition] = useState<OwnedEdition>();

  const handleSubmit = (oe: OwnedEdition) => {
    refetch();
  };

  // Define columns
  const col = createColumnHelper<OwnedEdition>();
  const columns = [
    // Cover
    col.display({
      id: "cover",
      header: t("oedition.cover"),
      cell: ({ row }) => (
        <div
          className="cursor-pointer"
          onClick={() => {
            setEditionToShowId(row.original.id);
            openEditionModal();
          }}
        >
          <img
            src={row.original.edition.imgUrl}
            alt={row.original.edition.book?.name}
            className="max-h-[75px]"
          />
        </div>
      ),
    }),
    // Book name
    col.accessor("edition.book.name", {
      header: t("oedition.book.name"),
      cell: (info) => (
        <a
          className="hover:underline"
          href={`/book/${info.row.original.edition.book?.id}`}
        >
          {info.getValue()}&nbsp;<span className="font-normal">↗</span>
        </a>
      ),
    }),
    // Serie name
    col.accessor("edition.serie.name", {
      header: t("oedition.serie.name"),
      cell: (info) => (
        <a
          className="hover:underline"
          href={`/serie/${info.row.original.edition.serie?.id}`}
        >
          {info.getValue()}&nbsp;<span className="font-normal">↗</span>
        </a>
      ),
    }),
    // Volume
    col.accessor("edition.book.number", {
      header: t("oedition.book.volume"),
      cell: (info) => (
        <span>
          {info.row.original.edition?.book?.number ? (
            // If number is present
            <>
              {t("generic.volume", { capitalize: true })}&nbsp;{info.getValue()}
            </>
          ) : (
            // If no number
            t("generic.n/a")
          )}
        </span>
      ),
      enableGlobalFilter: false,
    }),
    // Publisher name
    col.accessor("edition.publisher.name", {
      header: t("oedition.book.publisher"),
    }),
    // Add Date
    col.accessor((row) => row.date.toLocaleDateString(locale), {
      header: t("oedition.addDate"),
    }),
    // Read
    col.accessor(
      (row) => t(row.read ? "generic.yes" : "generic.no", { capitalize: true }),
      {
        header: t("oedition.read"),
      },
    ),
    // Actions
    col.display({
      id: "actions",
      cell: ({ row }) => (
        <div className="w-min flex gap-2 justify-center items-center">
          <MdModeEdit
            size={20}
            onClick={() => {
              setEditedOwnedEdition(row.original);
              openModal();
            }}
            className="cursor-pointer hover:text-blue-500"
          />
          <MdDelete
            size={20}
            onClick={() => {
              confirm({
                title: t("collection.remove.title"),
                message: t("collection.remove.message"),
                onConfirm: () => {
                  removeFromCollection({ id: row.original.id });
                },
              });
            }}
            className="cursor-pointer hover:text-red-500"
          />
        </div>
      ),
    }),
  ];

  return (
    <>
      <GenericTable
        list={[...editionList].sort((a, b) => -compareDates(a.date, b.date))}
        columns={columns}
        isLoading={isLoading}
        error={err}
      />
      <EditOwnedEditionModal
        ownedEdition={editedOwnedEdition!}
        isOpen={isEditModalOpen}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
      {editionToShowId && (
        <EditionModal
          editionId={editionToShowId}
          isOpen={isEditionModalOpen}
          onClose={closeEditionModal}
        />
      )}
    </>
  );
}
