import type { UpdateUserData, User } from "~/models/user";
import { useUpdateProfileMutation } from "~/store/services/api";
import { setUser } from "~/store/slices/userSlice";
import { store } from "~/store/store";
import { useToast } from "../toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues } from "react-hook-form";
import { GenericForm } from "./GenericForm";
import { TextRhfInput } from "./fields/TextRhfInput";
import { PasswordRhfInput } from "./fields/PasswordRhfInput";
import { showApiFormError } from "~/utils/error";

type ProfileFormProps = {
  user: User;
  onDone?: () => void;
  onCancel?: () => void;
};

export function ProfileForm({ user, onDone, onCancel }: ProfileFormProps) {
  const { t } = useTranslation();
  const toast = useToast();

  // Validation schema
  const schema = z.object({
    username: z.string().trim().min(1, t("signup.username.required")),
    email: z
      .email(t("signup.email.invalidFormat"))
      .min(1, t("signup.email.required")),
    // Optional, the password is unchanged if left empty
    newPassword: z
      .string()
      .refine((pwd) => pwd.length === 0 || pwd.length >= 8, {
        message: t("signup.password.gte8chars"),
      }),
    currentPassword: z
      .string()
      .min(1, t("profile.form.currentPassword.required")),
  });

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      username: user.username,
      email: user.email,
      newPassword: "",
      currentPassword: "",
    },
  });

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const triggerSubmission = (data: FieldValues) => {
    const payload: UpdateUserData = {
      username: data.username,
      email: data.email,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword || undefined,
    };

    updateProfile(payload)
      .unwrap()
      .then((response) => {
        store.dispatch(setUser(response.user));
        toast.success(t("profile.form.success"));
        // Execute onDone callback if provided
        onDone?.();
      })
      .catch((error) => {
        showApiFormError(
          error,
          t,
          setError,
          ["username", "email", "newPassword", "currentPassword"],
          toast.error,
          "profile.form.error",
        );
      });
  };

  const handleCancel = () => {
    // Execute onCancel callback if provided
    onCancel?.();
  };

  return (
    <GenericForm
      title={t("profile.form.header")}
      onCancel={handleCancel}
      onSubmit={handleSubmit(triggerSubmission)}
      isLoading={isLoading}
      disabled={isLoading}
    >
      <TextRhfInput
        label={t("signup.username")}
        registration={register("username")}
        inputProps={{ placeholder: t("signup.username.placeholder") }}
        error={errors.username}
      />

      <TextRhfInput
        label={t("signup.email")}
        registration={register("email")}
        inputProps={{ placeholder: t("signup.email.placeholder") }}
        error={errors.email}
      />

      <PasswordRhfInput
        label={t("profile.form.newPassword")}
        registration={register("newPassword")}
        inputProps={{ placeholder: t("profile.form.newPassword.placeholder") }}
        error={errors.newPassword}
      />

      <PasswordRhfInput
        label={t("profile.form.currentPassword")}
        registration={register("currentPassword")}
        error={errors.currentPassword}
      />
    </GenericForm>
  );
}
