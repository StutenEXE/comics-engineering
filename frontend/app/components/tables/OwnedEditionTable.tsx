import { useEffect, useState } from "react";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { useTranslation } from "~/i18n/i18n";
import { type OwnedEdition } from "~/models/ownedEdition";
import { useCollectionQuery, useRemoveFromCollectionMutation } from "~/store/services/api";
import { compareDates } from "~/utils/date";
import { createError, type Error } from "~/utils/error";
import { EditionModal } from "../modals/EditionModal";
import { EditOwnedEditionModal } from "../modals/EditOwnedEditionModal";
import { GenericTable, type ColumnDef } from "./GenericTable";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { useToast } from "../toast/Toast";
import { useAppSelector } from "~/store/hooks";

function getOwnedEditionColumns(
  onCoverClick: (oe: OwnedEdition) => void,
): ColumnDef<OwnedEdition>[] {
  const { t, locale } = useTranslation();
  return [
    {
      key: "cover",
      header: t("oedition.cover"),
      searchable: false,
      cellRenderer: (oe) => (
        <div className="cursor-pointer" onClick={() => onCoverClick(oe)}>
          <img
            src={oe.edition.imgUrl}
            alt={oe.edition.book?.name}
            className="max-h-[75px]"
          />
        </div>
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
        oe.edition?.book
          ? `${t("generic.volume", { capitalize: true })} ${oe.edition.book?.number}`
          : "generic.n/a",
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
  className?: string;
}

export function OwnedEditionTable({}: OwnedEditionTableProps) {
  const confirm = useConfirm();
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.user);

  const { data, isLoading, error, refetch } = useCollectionQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const editionList = data?.ownedEditions ?? [];
  const err = createError(error);

  // State to have a better control on render lifecycle
  // const [localEditionList, setLocalEditionList] = useState([...editionList]);

  // Keep local state in sync when the prop changes
  // useEffect(() => {
  //   setLocalEditionList([...editionList]);
  // }, [editionList]);

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
      toast.success("collection.toast.remove.success");
      refetch();
    } else if (isError) {
      toast.success("collection.toast.remove.error");
    }
  }, [isSuccess, isError]);

  const [editionToShowId, setEditionToShowId] = useState<number>();
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
        <MdDelete
          size={20}
          onClick={() => {
            confirm({
              title: t("collection.remove.title"),
              message: t("collection.remove.message"),
              onConfirm: () => {
                removeFromCollection({ id: oe.id });
              },
            });
          }}
          className="cursor-pointer hover:text-red-500"
        />
      </div>
    );
  };

  const handleSubmit = (oe: OwnedEdition) => {
    refetch();
  };

  return (
    <>
      <GenericTable
        list={[...editionList].sort(
          (a, b) => -compareDates(a.date, b.date),
        )}
        columns={getOwnedEditionColumns((oe) => {
          setEditionToShowId(oe.edition.id);
          openEditionModal();
        })}
        addActions={true}
        actionGenerator={actionGenerator}
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
