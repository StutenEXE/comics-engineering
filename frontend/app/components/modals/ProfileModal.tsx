import type { User } from "~/models/user";
import { ProfileForm } from "../forms/ProfileForm";
import { GenericModal } from "./GenericModal";

type ProfileModalProps = {
  user: User;
  isOpen: boolean;
  onDone: () => void;
  onCancel: () => void;
};

export function ProfileModal({
  user,
  isOpen,
  onDone,
  onCancel,
}: ProfileModalProps) {
  return (
    <GenericModal isOpen={isOpen} onClose={onCancel}>
      <div className="border border-gray-300 rounded-lg shadow-md bg-black">
        <ProfileForm user={user} onDone={onDone} onCancel={onCancel} />
      </div>
    </GenericModal>
  );
}
