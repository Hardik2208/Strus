import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { authService } from "../services/auth.service";
import { mapAuthError } from "../../../lib/api/api-error";
import styles from "./RegisterPage.module.css";

const schema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  if (!resetToken) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (data: any) => {
    try {
      await authService.resetPassword({ resetToken, newPassword: data.newPassword });
      toast.success("Password reset successfully.");
      navigate("/login", { replace: true });
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    }
  };

  return (
    <Card>
      <h2 className={styles.title}>Create a new password</h2>
      <p className={styles.subtitle}>Please enter your new password.</p>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input 
          label="New password"
          type="password"
          error={errors.newPassword?.message as string} 
          {...register("newPassword")} 
        />
        <Input 
          label="Confirm password"
          type="password"
          error={errors.confirmPassword?.message as string} 
          {...register("confirmPassword")} 
        />
        <Button type="submit" disabled={isSubmitting} fullWidth>Reset Password</Button>
      </form>
    </Card>
  );
};
