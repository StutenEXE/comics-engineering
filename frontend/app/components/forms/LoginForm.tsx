import type { UserCredentials } from "~/models/user";
import { useLoginMutation } from "~/store/services/api";
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

type LoginFormProps = {
  onDone?: () => void;
  onCancel?: () => void;
};

export function LoginForm({ onDone, onCancel }: LoginFormProps) {
  const { t } = useTranslation();
  const toast = useToast();

  // Validation schema
  const schema = z.object({
    email: z
      .email(t("login.email.invalidFormat"))
      .min(1, t("login.email.required")),
    password: z
      .string()
      .min(1, t("login.password.required")),
  });

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  const [login] = useLoginMutation();

  const triggerSubmission = (data: FieldValues) => {
    const email = data.email;
    const password = data.password;

    const credentials: UserCredentials = {
      email: email,
      password: password,
    };

    if (!credentials.email || !credentials.password) return;

    // Perform login mutation
    login(credentials)
      .unwrap()
      .then((response) => {
        store.dispatch(setUser(response.user));
        toast.success(t("login.success"));
        // Execute onDone callback if provided
        onDone?.();
      })
      .catch((error) => {
        const msg = error.data?.error || t("login.error");
        toast.error(String(msg));
      });
  };

  const handleCancel = () => {
    // Execute onCancel callback if provided
    if (onCancel) onCancel();
  };

  return (
    <GenericForm
      title={t("login.header")}
      onCancel={handleCancel}
      submitLabel={t("login.submit")}
      onSubmit={handleSubmit(triggerSubmission)}
    >
      <TextRhfInput
        label={t("login.email")}
        registration={register("email")}
        inputProps={{ placeholder: t("login.placeholder.email") }}
        error={errors.email}
      />

      <PasswordRhfInput
        label={t("login.password")}
        registration={register("password")}
        inputProps={{ placeholder: t("login.placeholder.password") }}
        error={errors.password}
      />
    </GenericForm>
  );
}
