import type { SimpleEdition } from "~/models/edition";
import type { OwnedEdition, OwnedEditionDTO } from "~/models/ownedEdition";
import { GenericModal } from "./GenericModal";
import {
  useAddToCollectionMutation,
  useEditionByIdQuery,
} from "~/store/services/api";
import { useToast } from "../toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import { OwnedEditionForm } from "../forms/OwnedEditionForm";

interface AddToCollectionModalProps {
  editionId: number;
  isOpen: boolean;
  onSubmit: (oe: OwnedEdition) => void;
  onClose: () => void;
}

export function AddToCollectionModal({
  editionId,
  isOpen,
  onSubmit,
  onClose,
}: AddToCollectionModalProps) {
  const { t } = useTranslation();
  const toast = useToast();

  const [addToCollection] = useAddToCollectionMutation();

  const handleSubmit = async (oe: Partial<OwnedEditionDTO>) => {
    await addToCollection(oe).then((res) => {
      if ("error" in res) {
        toast.error(t("toast.addToCollection.error"));
        return false;
      }

      toast.success(t("toast.addToCollection.success"));
      onSubmit(res.data.ownedEdition);
      onClose();
      return res.data.ownedEdition;
    });
  };

  const { data, isError } = useEditionByIdQuery({ id: editionId });

  if (isError) {
    toast.error(t("toast.addToCollection.error"));
    onClose();
  }

  const edition = data?.edition;

  const ownedEdition: Partial<OwnedEdition> = {
    edition: edition,
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <OwnedEditionForm
        ownedEdition={ownedEdition}
        action="create"
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </GenericModal>
  );
}
