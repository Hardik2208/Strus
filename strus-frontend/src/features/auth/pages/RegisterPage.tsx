
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { authService } from "../services/auth.service";
import { mapAuthError } from "../../../lib/api/api-error";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

import styles from "./RegisterPage.module.css";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/auth.schemas";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await authService.register(data);

      toast.success("Verification code sent successfully.");

      navigate("/verify-email", {
        state: { email: data.email },
      });
    } catch (error: any) {
      toast.error(mapAuthError(error.code));
    }
  };

  return (
    <Card>
      <h2 className={styles.title}>Create your account</h2>

      <p className={styles.subtitle}>
        Build and execute projects with confidence.
      </p>

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div style={{ display: "flex", gap: "1rem" }}>
          <Input
            label="First Name"
            placeholder="John"
            error={errors.firstName?.message}
            {...register("firstName")}
          />

          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="user@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className={styles.divider}>or</div>

      <GoogleSignInButton />

      <div className={styles.footer}>
        Already have an account?
        <Link to="/login" className={styles.link}>
          Sign in
        </Link>
      </div>
    </Card>
  );
};
