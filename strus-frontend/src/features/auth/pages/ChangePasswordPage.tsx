import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";

import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { authService } from "../services/auth.service";
import { mapAuthError } from "../../../lib/api/api-error";
import styles from "./RegisterPage.module.css";

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ChangePasswordPage: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success("Password changed successfully. Other active sessions have been signed out.");
      reset();
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    }
  };

  return (
    <Card style={{ maxWidth: '400px' }}>
      <h2 className={styles.title} style={{ textAlign: 'left' }}>Change Password</h2>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input 
          label="Current password"
          type="password"
          error={errors.currentPassword?.message as string} 
          {...register("currentPassword")} 
        />
        <Input 
          label="New password"
          type="password"
          error={errors.newPassword?.message as string} 
          {...register("newPassword")} 
        />
        <Input 
          label="Confirm new password"
          type="password"
          error={errors.confirmPassword?.message as string} 
          {...register("confirmPassword")} 
        />
        <Button type="submit" disabled={isSubmitting} fullWidth>Change Password</Button>
      </form>
    </Card>
  );
};
