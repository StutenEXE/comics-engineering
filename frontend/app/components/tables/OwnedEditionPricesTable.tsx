import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useTranslation } from "~/i18n/i18n";
import { type OwnedEdition } from "~/models/ownedEdition";
import { useAppSelector } from "~/store/hooks";
import {
  useCollectionQuery,
  useRemoveFromCollectionMutation,
} from "~/store/services/api";
import { compareDates, toDDmmYYYY } from "~/utils/date";
import { createError } from "~/utils/error";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { EditOwnedEditionModal } from "../modals/EditOwnedEditionModal";
import { OwnedEditionModal } from "../modals/OwnedEditionModal";
import { useToast } from "../toast/Toast";
import { BooleanCellRenderer, GenericTable } from "./GenericTable";
import {
  calcCost,
  calcReduction,
  calcSavings,
  formatCurrency,
} from "~/utils/currency";

interface OwnedEditionPricesTableProps {
  className?: string;
}

export function OwnedEditionPricesTable({}: OwnedEditionPricesTableProps) {
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
  const sortedEditionList = useMemo(
    () => [...editionList].sort((a, b) => -compareDates(a.date, b.date)),
    [editionList],
  );
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
      // Add Date (use raw date accessor so range filtering works)
      col.accessor("date", {
        header: t("oedition.addDate"),
        meta: { filterType: "range" },
        cell: (info) => info.getValue() && toDDmmYYYY(info.getValue(), locale),
        enableColumnFilter: false,
      }),
      // Purchase price
      col.accessor("purchasePrice", {
        header: t("oedition.purchasePrice"),
        meta: { filterType: "numrange" },
        cell: (info) => formatCurrency(info.getValue(), "EUR", locale),
      }),
      // Fees
      col.accessor("fees", {
        header: t("oedition.fees"),
        meta: { filterType: "numrange" },
        cell: (info) => formatCurrency(info.getValue(), "EUR", locale),
      }),
      // Total cost
      col.accessor((oe) => calcCost(oe), {
        header: t("stash.prices.cost"),
        meta: { filterType: "numrange" },
        cell: (info) => (
          <div>
            <p>{formatCurrency(info.getValue(), "EUR", locale)}</p>
            <p>
              ({formatCurrency(info.row.original.purchasePrice, "EUR", locale)}
              &nbsp;+&nbsp;
              {formatCurrency(info.row.original.fees, "EUR", locale)})
            </p>
          </div>
        ),
      }),
      // Retail price
      col.accessor("retailPrice", {
        header: t("oedition.retailPrice"),
        meta: { filterType: "numrange" },
        cell: (info) => formatCurrency(info.getValue(), "EUR", locale),
      }),
      // Savings (€)
      col.accessor((oe) => calcSavings(oe), {
        header: t("stash.prices.savings.value"),
        meta: { filterType: "numrange" },
        cell: (info) => formatCurrency(info.getValue(), "EUR", locale),
      }),
      // Reduction (%)
      col.accessor((oe) => calcReduction(oe), {
        header: t("stash.prices.savings.reduction"),
        meta: { filterType: "numrange" },
        cell: (info) => <p>{info.getValue().toFixed(2)}%</p>,
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
        list={sortedEditionList}
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
