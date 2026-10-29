import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "~/i18n/i18n";
import { type OwnedEdition } from "~/models/ownedEdition";
import { useAppSelector } from "~/store/hooks";
import {
  useFullCollectionQuery,
  useRemoveFromCollectionMutation,
} from "~/store/services/api";
import { compareDates, toDDmmYYYY } from "~/utils/date";
import { createError, translateApiError } from "~/utils/error";
import {
  OwnedEditionActions,
  OwnedEditionListItem,
} from "../cards/OwnedEditionListItem";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { EditOwnedEditionModal } from "../modals/EditOwnedEditionModal";
import { OwnedEditionModal } from "../modals/OwnedEditionModal";
import { useToast } from "../toast/Toast";
import { GenericTable } from "./GenericTable";
import {
  calcCost,
  calcReduction,
  calcSavings,
  formatCurrency,
  savingsClassName,
} from "~/utils/currency";

interface OwnedEditionPricesTableProps {
  className?: string;
}

export function OwnedEditionPricesTable({}: OwnedEditionPricesTableProps) {
  const confirm = useConfirm();
  const { t, locale } = useTranslation();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.user);

  // The prices table filters on computed values (cost, savings...), it needs the whole collection
  const { data, isFetching, error, refetch } = useFullCollectionQuery(
    { userId: user ? user.id : 0 },
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

  const handleSubmit = (oe: OwnedEdition) => {
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

  const eur = (amount: number) => formatCurrency(amount, "EUR", locale);

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
        cell: (info) => eur(info.getValue()),
      }),
      // Fees
      col.accessor("fees", {
        header: t("oedition.fees"),
        meta: { filterType: "numrange" },
        cell: (info) => eur(info.getValue()),
      }),
      // Total cost
      col.accessor((oe) => calcCost(oe), {
        id: "cost",
        header: t("stash.prices.cost"),
        meta: { filterType: "numrange" },
        cell: (info) => (
          <div>
            <p className="font-medium text-white/85">{eur(info.getValue())}</p>
            <p className="text-xs text-white/40">
              ({eur(info.row.original.purchasePrice)}
              &nbsp;+&nbsp;
              {eur(info.row.original.fees)})
            </p>
          </div>
        ),
      }),
      // Retail price
      col.accessor("retailPrice", {
        header: t("oedition.retailPrice"),
        meta: { filterType: "numrange" },
        cell: (info) => eur(info.getValue()),
      }),
      // Savings (€)
      col.accessor((oe) => calcSavings(oe), {
        id: "savings",
        header: t("stash.prices.savings.value"),
        meta: { filterType: "numrange" },
        cell: (info) => (
          <span className={savingsClassName(info.getValue())}>
            {eur(info.getValue())}
          </span>
        ),
      }),
      // Reduction (%)
      col.accessor((oe) => calcReduction(oe), {
        id: "reduction",
        header: t("stash.prices.savings.reduction"),
        meta: { filterType: "numrange" },
        cell: (info) => (
          <span className={savingsClassName(info.getValue())}>
            {info.getValue().toFixed(2)}%
          </span>
        ),
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
        list={sortedEditionList}
        columns={columns}
        isLoading={isFetching}
        error={err}
        renderCard={(oe) => {
          const savings = calcSavings(oe);
          return (
            <OwnedEditionListItem
              oedition={oe}
              onOpen={() => showOedition(oe)}
              onEdit={() => editOedition(oe)}
              onRemove={() => removeOedition(oe)}
            >
              <dl className="mt-1 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-white/35">{t("stash.prices.cost")}</dt>
                  <dd className="tabular-nums text-white/85">
                    {eur(calcCost(oe))}
                  </dd>
                  {oe.fees > 0 && (
                    <dd className="tabular-nums text-white/35">
                      +{eur(oe.fees)} {t("oedition.fees").toLowerCase()}
                    </dd>
                  )}
                </div>
                <div>
                  <dt className="text-white/35">
                    {t("oedition.retailPrice")}
                  </dt>
                  <dd className="tabular-nums text-white/70">
                    {eur(oe.retailPrice)}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/35">
                    {t("stash.prices.savings.value")}
                  </dt>
                  <dd
                    className={`tabular-nums ${savingsClassName(savings) || "text-white/70"}`}
                  >
                    {eur(savings)}
                    {oe.retailPrice > 0 && (
                      <span className="ml-1 opacity-70">
                        ({calcReduction(oe).toFixed(0)}%)
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </OwnedEditionListItem>
          );
        }}
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
