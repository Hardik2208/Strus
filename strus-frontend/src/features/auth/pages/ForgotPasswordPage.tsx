import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { authService } from "../services/auth.service";
import styles from "./RegisterPage.module.css";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      await authService.forgotPassword(data.email);
    } catch (e) {
      // Ignore to prevent account enumeration
    } finally {
      toast.success("If an account exists, a verification code has been sent.");
      navigate("/verify-forgot-password", { state: { email: data.email } });
    }
  };

  return (
    <Card>
      <h2 className={styles.title}>Forgot your password?</h2>
      <p className={styles.subtitle}>Enter your email and we'll send you a verification code.</p>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <Input label="Email" error={errors.email?.message as string} {...register("email")} />
        <Button type="submit" disabled={isSubmitting} fullWidth>Send Code</Button>
      </form>
      
      <div className={styles.footer}>
        <Link to="/login" className={styles.link}>Back to sign in</Link>
      </div>
    </Card>
  );
};
