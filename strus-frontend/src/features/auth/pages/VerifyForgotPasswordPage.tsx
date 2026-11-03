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
  otp: z.string().length(6, "Verification code must be 6 digits"),
});

export const VerifyForgotPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = async (data: any) => {
    try {
      const res = await authService.verifyForgotPassword({ email, otp: data.otp });
      navigate("/reset-password", { state: { resetToken: res.data.resetToken } });
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    }
  };

  return (
    <Card>
      <h2 className={styles.title}>Enter verification code</h2>
      <p className={styles.subtitle}>We've sent a code to:<br/><strong>{email}</strong></p>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input 
          placeholder="1 2 3 4 5 6" 
          maxLength={6} 
          error={errors.otp?.message as string} 
          {...register("otp")} 
          style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '20px' }}
        />
        <Button type="submit" disabled={isSubmitting} fullWidth>Verify Code</Button>
      </form>
    </Card>
  );
};
