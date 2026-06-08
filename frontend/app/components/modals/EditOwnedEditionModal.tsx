import { useTranslation } from "~/i18n/i18n";
import type { OwnedEdition, OwnedEditionDTO } from "~/models/ownedEdition";
import { useUpdateOwnedEditionMutation } from "~/store/services/api";
import { OwnedEditionForm } from "../forms/OwnedEditionForm";
import { useToast } from "../toast/Toast";
import { GenericModal } from "./GenericModal";

interface EditOwnedEditionModalProps {
  ownedEdition: OwnedEdition;
  isOpen: boolean;
  onSubmit: (oe: OwnedEdition) => void;
  onClose: () => void;
}

export function EditOwnedEditionModal({
  ownedEdition,
  isOpen,
  onSubmit,
  onClose,
}: EditOwnedEditionModalProps) {
  const { t } = useTranslation();
  const toast = useToast();

  const [updateOwnedEdition] = useUpdateOwnedEditionMutation();

  const handleSubmit = async (oe: Partial<OwnedEditionDTO>) => {
    await updateOwnedEdition(oe).then((res) => {
      if ("error" in res) {
        toast.error(t("toast.error"));
        return false;
      }
      toast.success(t("toast.addToCollection.success"));
      console.log(res);
      onSubmit(res.data.ownedEdition);
      onClose();
      return;
    });
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <OwnedEditionForm
        ownedEdition={ownedEdition}
        action="update"
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </GenericModal>
  );
}
