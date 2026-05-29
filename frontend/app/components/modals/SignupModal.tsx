import { SignupForm } from "../forms/SignupForm";
import { GenericModal } from "./GenericModal";

type SignupModalProps = {
  isOpen: boolean;
  onDone: () => void;
  onCancel: () => void;
};

export function SignupModal({ isOpen, onDone, onCancel }: SignupModalProps) {
  return (
    <GenericModal isOpen={isOpen} onClose={onCancel}>
      <div className="border border-gray-300 rounded-lg shadow-md bg-black">
        <SignupForm onDone={onDone} onCancel={onCancel} />
      </div>
    </GenericModal>
  );
}
