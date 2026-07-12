import { useEffect, useState } from "react";
import { useTranslation } from "~/i18n/i18n";
import {
  type SimpleContribution,
  wrapInNewBundle,
} from "~/models/contribution";
import { useAppSelector } from "~/store/hooks";
import {
  useEditionByIdQuery,
  useEditionRelationToUserQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import { createError } from "~/utils/error";
import { GenericButton } from "../buttons/GenericButton";
import { EditionDataDisplay } from "../datadisplay/EditionDataDisplay";
import { useToast } from "../toast/Toast";
import { AddToCollectionModal } from "./AddToCollectionModal";
import { EditionContributionModal } from "./contribution/EditionContributionModal";
import { GenericModal } from "./GenericModal";
import { OwnedEditionDataDisplay } from "../datadisplay/OwnedEditionDataDisplay";
import type { OwnedEdition } from "~/models/ownedEdition";

interface OwnedEditionModalProps {
  oedition: OwnedEdition;
  isOpen: boolean;
  onClose: () => void;
}

export function OwnedEditionModal({
  oedition,
  isOpen,
  onClose,
}: OwnedEditionModalProps) {
  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <OwnedEditionDataDisplay oedition={oedition}></OwnedEditionDataDisplay>
    </GenericModal>
  );
}
