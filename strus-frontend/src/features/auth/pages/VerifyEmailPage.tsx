import React, { useState } from "react";
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
import { useAuthStore } from "../store/auth.store";
import styles from "./RegisterPage.module.css"; 

const verifySchema = z.object({
  otp: z.string().length(6, "Verification code must be 6 digits"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  
  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const onSubmit = async (data: VerifyFormValues) => {
    try {
      await authService.verifyEmail({ email, otp: data.otp });
      toast.success('Email verified successfully.');
      const profileCompleted = useAuthStore.getState().profileCompleted;
      if (profileCompleted === false) {
        navigate('/profile/setup', { replace: true });
      } else {
        navigate('/dashboard/client', { replace: true });
      }
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOtp(email);
      toast.success("Verification code resent.");
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    } finally {
      setResending(false);
    }
  };

  return (
    <Card>
      <h2 className={styles.title}>Verify your email</h2>
      <p className={styles.subtitle}>
        We've sent a verification code to<br/>
        <strong>{email}</strong>
      </p>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="1 2 3 4 5 6"
          maxLength={6}
          error={errors.otp?.message}
          {...register("otp")}
          style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '20px' }}
        />

        <Button type="submit" disabled={isSubmitting} fullWidth>
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </Button>
      </form>

      <div className={styles.footer}>
        Didn't receive the code?
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className={styles.link}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-primary)' }}
        >
          {resending ? "Resending..." : "Resend code"}
        </button>
      </div>
    </Card>
  );
};
