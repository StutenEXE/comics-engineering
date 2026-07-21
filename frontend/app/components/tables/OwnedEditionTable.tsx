import { useEffect, useState } from "react";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdModeEdit,
} from "react-icons/md";
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
import { BooleanCellRenderer, GenericTable } from "./GenericTable";
import { createColumnHelper } from "@tanstack/react-table";
import { OwnedEditionModal } from "../modals/OwnedEditionModal";

interface OwnedEditionTableProps {
  className?: string;
}

export function OwnedEditionTable({}: OwnedEditionTableProps) {
  const confirm = useConfirm();
  const { t, locale } = useTranslation();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.user);

  const { data, isFetching, error, refetch } = useCollectionQuery(
    { id: user ? user.id : 0 },
    { skip: !user },
  );
  const editionList = data?.ownedEditions ?? [];
  const err = createError(error);
  const publishers = [
    ...new Set(editionList.map((e) => e.edition.publisher?.name)),
  ];

  // Handles modal open/close state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const openModal = () => {
    setIsEditModalOpen(true);
  };
  const closeModal = () => {
    setIsEditModalOpen(false);
  };

  // Handles edition details modal
  const [isOeditionModalOpen, setIsEditionModalOpen] = useState(false);
  const openOeditionModal = () => {
    setIsEditionModalOpen(true);
  };
  const closeOeditionModal = () => {
    setIsEditionModalOpen(false);
  };

  // Query to remove from a lib
  const [removeFromCollection, { isSuccess, isError }] =
    useRemoveFromCollectionMutation();
  useEffect(() => {
    if (isSuccess) {
      toast.success(t("toast.removeFromCollection.success"));
      refetch();
    } else if (isError) {
      toast.success(t("toast.error"));
    }
  }, [isSuccess, isError]);

  const [oeditionToShow, setEditionToShow] = useState<OwnedEdition>();
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
            setEditionToShow(row.original);
            openOeditionModal();
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
      meta: { filterType: "text" },
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
      meta: { filterType: "text" },
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
      meta: { filterType: "text" },
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
      enableColumnFilter: false,
    }),
    // Publisher name
    col.accessor("edition.publisher.name", {
      header: t("oedition.book.publisher"),
      meta: {
        filterType: "single",
        options: publishers,
        placeholder: t("oedition.publisher.select"),
      },
      filterFn: "arrIncludes",
    }),
    // Add Date (use raw date accessor so range filtering works)
    col.accessor("date", {
      header: t("oedition.addDate"),
      meta: { filterType: "range" },
      cell: (info) =>
        info.getValue()
          ? (info.getValue() as Date).toLocaleDateString(locale)
          : "",
      enableColumnFilter: false,
    }),
    // Read
    col.accessor("dateRead", {
      header: t("oedition.read"),
      cell: (info) => (
        <div className="flex flex-col gap-1 items-center text-xs">
          <BooleanCellRenderer val={info.row.original.read} />
          {info.getValue()
            ? (info.getValue() as Date).toLocaleDateString(locale)
            : ""}
        </div>
      ),
    }),
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
                title: t("stash.remove.title"),
                message: t("stash.remove.message"),
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
        isLoading={isFetching}
        error={err}
      />
      <EditOwnedEditionModal
        ownedEdition={editedOwnedEdition!}
        isOpen={isEditModalOpen}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
      {oeditionToShow && (
        <OwnedEditionModal
          oedition={oeditionToShow}
          isOpen={isOeditionModalOpen}
          onClose={closeOeditionModal}
        />
      )}
    </>
  );
}
