import { MdDelete, MdModeEdit } from "react-icons/md";
import { useTranslation } from "~/i18n/i18n";
import { type OwnedEdition } from "~/models/ownedEdition";
import type { Error } from "~/utils/error";
import { GenericTable, type ColumnDef } from "./GenericTable";
import { EditOwnedEditionModal } from "../modals/EditOwnedEditionModal";
import { useState } from "react";
import { compareDates } from "~/utils/date";

function getOwnedEditionColumns(): ColumnDef<OwnedEdition>[] {
  const { t, locale } = useTranslation();
  return [
    {
      key: "cover",
      header: t("oedition.cover"),
      searchable: false,
      cellRenderer: (oe) => (
        <a className="hover:underline" href={`/edition/${oe.edition.id}`}>
          <img
            src={oe.edition.imgUrl}
            alt={oe.edition.book?.name}
            className="max-h-[75px]"
          />
        </a>
      ),
    },
    {
      key: "edition.book.name",
      header: t("oedition.book.name"),
      searchable: true,
      cellRenderer: (oe) => (
        <a className="hover:underline" href={`/book/${oe.edition.book?.id}`}>
          {oe.edition.book?.name}&nbsp;<span className="font-normal">↗</span>
        </a>
      ),
      getValue: (oe) => oe.edition.book?.name || "",
    },
    {
      key: "serie",
      header: t("oedition.serie.name"),
      searchable: true,
      cellRenderer: (oe) => (
        <a
          className="hover:underline"
          href={`/serie/${oe.edition.book?.serieId}`}
        >
          {oe.edition.serie?.name}&nbsp;<span className="font-normal">↗</span>
        </a>
      ),
      getValue: (oe) => oe.edition.serie?.name || "",
    },
    {
      key: "volume",
      header: t("oedition.book.volume"),
      cellRenderer: (oe) =>
        oe.edition?.book ? `${t("generic.volume", { capitalize: true })} ${oe.edition.book?.number}` : "generic.n/a",
    },
    {
      key: "publisher",
      header: t("oedition.book.publisher"),
      searchable: true,
      cellRenderer: (oe) => <span>{oe.edition.publisher?.name}</span>,
      getValue: (oe) => oe.edition.publisher?.name || "",
    },
    {
      key: "addDate",
      header: t("oedition.addDate"),
      cellRenderer: (oe) => {
        return oe?.date.toLocaleDateString(locale);
      },
    },
    {
      key: "read",
      header: t("oedition.read"),
      cellRenderer: (oe) => {
        return t(oe.read ? "generic.yes" : "generic.no", { capitalize: true });
      },
    },
  ];
}

interface OwnedEditionTableProps {
  editionList: OwnedEdition[];
  isLoading?: boolean;
  error?: Error;
  className?: string;
}

export function OwnedEditionTable({
  editionList,
  isLoading,
  error,
}: OwnedEditionTableProps) {
  // State to have a better control on render lifecycle
  const [localEditionList, setLocalEditionList] = useState([...editionList]);

  // Handles modal open/close state
  const [isModalOpen, setisModalOpen] = useState(false);
  const openModal = () => {
    setisModalOpen(true);
  };

  const closeModal = () => {
    setisModalOpen(false);
  };

  const [editedOwnedEdition, setEditedOwnedEdition] = useState<OwnedEdition>();
  const actionGenerator = (oe: OwnedEdition) => {
    return (
      <div className="w-min flex gap-2 justify-center items-center">
        <MdModeEdit
          size={20}
          onClick={() => {
            setEditedOwnedEdition(oe);
            openModal();
          }}
          className="cursor-pointer hover:text-blue-500"
        />
        <MdDelete size={20} className="cursor-pointer hover:text-red-500" />
      </div>
    );
  };

  const handleSubmit = (oe: OwnedEdition) => {
    setLocalEditionList(
      localEditionList?.map((ed) => (ed.id === oe.id ? oe : ed)),
    );
  };

  return (
    <>
      <GenericTable
        list={[...localEditionList].sort(
          (a, b) => -compareDates(a.date, b.date),
        )}
        columns={getOwnedEditionColumns()}
        addActions={true}
        actionGenerator={actionGenerator}
        isLoading={isLoading}
        error={error}
      />
      <EditOwnedEditionModal
        ownedEdition={editedOwnedEdition!}
        isOpen={isModalOpen}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </>
  );
}
