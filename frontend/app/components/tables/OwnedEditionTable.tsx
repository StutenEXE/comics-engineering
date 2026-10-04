import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useTranslation } from "~/i18n/i18n";
import { type OwnedEdition } from "~/models/ownedEdition";
import { useAppSelector } from "~/store/hooks";
import {
  useCollectionQuery,
  useRemoveFromCollectionMutation,
} from "~/store/services/api";
import type { CollectionSortField } from "~/store/services/apiModels";
import { toDDmmYYYY } from "~/utils/date";
import { createError, translateApiError } from "~/utils/error";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { EditOwnedEditionModal } from "../modals/EditOwnedEditionModal";
import { OwnedEditionModal } from "../modals/OwnedEditionModal";
import { useToast } from "../toast/Toast";
import { BooleanCellRenderer, GenericTable } from "./GenericTable";
import { useServerTable } from "./useServerTable";

interface OwnedEditionTableProps {
  className?: string;
}

export function OwnedEditionTable({}: OwnedEditionTableProps) {
  const confirm = useConfirm();
  const { t, locale } = useTranslation();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.user);

  // Pagination, sorting and filtering are done by the API, latest additions first
  const { control, request, filters } = useServerTable<CollectionSortField>({
    initialSorting: [{ id: "addDate", desc: true }],
  });

  // Fetch owned editions for current page
  const { data, isLoading, isFetching, error, refetch } = useCollectionQuery(
    {
      ...request,
      userId: user ? user.id : 0,
      bookName: filters.bookName,
      serieName: filters.serieName,
      publisherName: filters.publisherName,
      read: filters.read === undefined ? undefined : filters.read === "true",
    },
    { skip: !user },
  );
  const editionList = data?.items ?? [];
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
  const [isOeditionModalOpen, setIsEditionModalOpen] = useState(false);
  const openOeditionModal = () => {
    setIsEditionModalOpen(true);
  };
  const closeOeditionModal = () => {
    setIsEditionModalOpen(false);
  };

  // Query to remove from a lib
  const [removeFromCollection, { isSuccess, isError, error: removeError }] =
    useRemoveFromCollectionMutation();
  useEffect(() => {
    if (isSuccess) {
      toast.success(t("toast.removeFromCollection.success"));
      refetch();
    } else if (isError) {
      toast.error(translateApiError(removeError, t, "toast.error"));
    }
  }, [isSuccess, isError]);

  const [oeditionToShow, setEditionToShow] = useState<OwnedEdition>();
  const [editedOwnedEdition, setEditedOwnedEdition] = useState<OwnedEdition>();

  const handleSubmit = () => {
    refetch();
  };

  // Define columns
  const col = createColumnHelper<OwnedEdition>();
  const columns = useMemo(
    () => [
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
      // Column IDs are the API sort fields and filter names
      // Book name
      col.accessor("edition.book.name", {
        id: "bookName",
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
        id: "serieName",
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
        id: "volume",
        header: t("oedition.book.volume"),
        meta: { filterType: "text" },
        cell: (info) => (
          <span>
            {info.row.original.edition?.book?.number ? (
              // If number is present
              <>
                {t("generic.volume", { capitalize: true })}&nbsp;
                {info.getValue()}
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
        id: "publisherName",
        header: t("oedition.book.publisher"),
        meta: { filterType: "text" },
      }),
      // Add Date
      col.accessor("date", {
        id: "addDate",
        header: t("oedition.addDate"),
        meta: { filterType: "range" },
        cell: (info) => info.getValue() && toDDmmYYYY(info.getValue(), locale),
        enableColumnFilter: false,
      }),
      // Read
      col.accessor("read", {
        id: "read",
        header: t("oedition.read"),
        cell: (info) => (
          <div className="flex flex-col gap-1 items-center text-xs">
            <BooleanCellRenderer val={info.getValue()} />
            {info.row.original.dateRead &&
              toDDmmYYYY(info.row.original.dateRead, locale)}
          </div>
        ),
        meta: { filterType: "boolean" },
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
    ],
    [col, t, locale, confirm, removeFromCollection],
  );

  return (
    <>
      <GenericTable
        list={editionList}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        error={err}
        server={{ ...control, rowCount: data?.total ?? 0 }}
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
