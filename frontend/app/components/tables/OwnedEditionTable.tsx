import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
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
import { OwnedEditionStatusIcons } from "../badges/OwnedEditionStatusIcons";
import {
  OwnedEditionActions,
  OwnedEditionListItem,
} from "../cards/OwnedEditionListItem";
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
  const closeModal = () => {
    setIsEditModalOpen(false);
  };

  // Handles edition details modal
  const [isOeditionModalOpen, setIsEditionModalOpen] = useState(false);
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

  // Row actions, shared by the table and the cards
  const showOedition = (oe: OwnedEdition) => {
    setEditionToShow(oe);
    setIsEditionModalOpen(true);
  };
  const editOedition = (oe: OwnedEdition) => {
    setEditedOwnedEdition(oe);
    setIsEditModalOpen(true);
  };
  const removeOedition = (oe: OwnedEdition) =>
    confirm({
      title: t("stash.remove.title"),
      message: t("stash.remove.message"),
      onConfirm: () => {
        removeFromCollection({ id: oe.id });
      },
    });

  // Define columns
  const col = createColumnHelper<OwnedEdition>();
  const columns = useMemo(
    () => [
      // Cover
      col.display({
        id: "cover",
        header: t("oedition.cover"),
        cell: ({ row }) => (
          <button
            type="button"
            className="cursor-pointer overflow-hidden rounded border border-white/8 transition-colors hover:border-stash-400/40"
            onClick={() => showOedition(row.original)}
            aria-label={row.original.edition.book?.name}
          >
            <img
              src={row.original.edition.imgUrl}
              alt=""
              className="max-h-[75px]"
            />
          </button>
        ),
      }),
      // Column IDs are the API sort fields and filter names
      // Book name
      col.accessor("edition.book.name", {
        id: "bookName",
        header: t("oedition.book.name"),
        meta: { filterType: "text" },
        cell: (info) => (
          <Link
            className="hover:underline"
            to={`/book/${info.row.original.edition.book?.id}`}
          >
            {info.getValue()}&nbsp;<span className="font-normal">↗</span>
          </Link>
        ),
      }),
      // Serie name
      col.accessor("edition.serie.name", {
        id: "serieName",
        header: t("oedition.serie.name"),
        meta: { filterType: "text" },
        cell: (info) => (
          <Link
            className="hover:underline"
            to={`/serie/${info.row.original.edition.serie?.id}`}
          >
            {info.getValue()}&nbsp;<span className="font-normal">↗</span>
          </Link>
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
          <OwnedEditionActions
            onEdit={() => editOedition(row.original)}
            onRemove={() => removeOedition(row.original)}
          />
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
        renderCard={(oe) => (
          <OwnedEditionListItem
            oedition={oe}
            onOpen={() => showOedition(oe)}
            onEdit={() => editOedition(oe)}
            onRemove={() => removeOedition(oe)}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
              <span className="tabular-nums">{toDDmmYYYY(oe.date, locale)}</span>
              <OwnedEditionStatusIcons oedition={oe} />
            </div>
          </OwnedEditionListItem>
        )}
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
