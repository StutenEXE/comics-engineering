import type { SignupData } from "~/models/user";
import { useSignupMutation } from "~/store/services/api";
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

type SignupFormProps = {
  onDone?: () => void;
  onCancel?: () => void;
};

export function SignupForm({ onDone, onCancel }: SignupFormProps) {
  const { t } = useTranslation();
  const toast = useToast();

  // Validation schema
  const schema = z.object({
    username: z.string().min(1, t("signup.username.required")),
    email: z
      .email(t("signup.email.invalidFormat"))
      .min(1, t("signup.email.required")),
    password: z
      .string()
      .min(1, t("signup.password.required"))
      .min(8, t("signup.password.gte8chars")),
  });

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  const [signup] = useSignupMutation();

  const triggerSubmission = (data: FieldValues) => {
    const username = data.username;
    const email = data.email;
    const password = data.password;

    const payload: SignupData = { username, email, password };

    if (!payload.username || !payload.email || !payload.password) return;

    // Perform login mutation
    signup(payload)
      .unwrap()
      .then((response) => {
        store.dispatch(setUser(response.user));
        toast.success(t("signup.success"));
        // Execute onDone callback if provided
        onDone?.();
      })
      .catch((error) => {
        const msg = error.data?.error || t("signup.error");
        toast.error(String(msg));
      });
  };

  const handleCancel = () => {
    // Execute onCancel callback if provided
    onCancel?.();
  };

  return (
    <GenericForm
      title={t("signup.header")}
      onCancel={handleCancel}
      submitLabel={t("signup.submit")}
      onSubmit={handleSubmit(triggerSubmission)}
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
        label={t("signup.password")}
        registration={register("password")}
        inputProps={{ placeholder: t("signup.password.placeholder") }}
        error={errors.password}
      />
    </GenericForm>
  );
}
