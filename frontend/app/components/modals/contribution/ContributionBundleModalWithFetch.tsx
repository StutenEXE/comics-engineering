import { useEffect } from "react";
import { type ContributionBundle } from "~/models/contributionBundle";
import { useLazyBundleByIdQuery } from "~/store/services/api";
import { ContributionBundleModal } from "./ContributionBundleModal";

interface ContributionBundleModalWithFetchProps {
  id?: number;
  action: "create" | "update";
  isOpen: boolean;
  onSubmit?: (
    bundle: Partial<ContributionBundle>,
    hasChanges: boolean,
  ) => Promise<void>;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function ContributionBundleModalWithFetch({
  id,
  action,
  isOpen,
  onSubmit,
  onClose,
}: ContributionBundleModalWithFetchProps) {
  const [getBundleById, { data }] = useLazyBundleByIdQuery();
  const bundle = data?.bundle;
  const currentBundle = isOpen && bundle?.id === id ? bundle : undefined;

  useEffect(() => {
    if (id && isOpen && bundle?.id !== id) {
      getBundleById({ id });
    }
  }, [id, isOpen, bundle, getBundleById]);

  return (
    <ContributionBundleModal
      bundle={currentBundle}
      action={action}
      isOpen={isOpen}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}
