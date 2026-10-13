import { LoginForm } from "../forms/LoginForm";
import { GenericModal } from "./GenericModal";

type LoginModalProps = {
  isOpen: boolean;
  onDone: () => void;
  onCancel: () => void;
};

export function LoginModal({ isOpen, onDone, onCancel }: LoginModalProps) {
  return (
    <GenericModal isOpen={isOpen} onClose={onCancel}>
      <div>
        <LoginForm onDone={onDone} onCancel={onCancel} />
      </div>
    </GenericModal>
  );
}
