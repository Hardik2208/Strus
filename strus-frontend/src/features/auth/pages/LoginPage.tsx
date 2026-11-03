
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
import { useAuthStore } from "../store/auth.store";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

import styles from "./RegisterPage.module.css";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schemas";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await authService.login(data);
      toast.success("Welcome back!");

      const profileCompleted =
        useAuthStore.getState().profileCompleted;

      if (profileCompleted === false) {
        navigate("/profile/setup");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (error.code === "PASSWORD_NOT_SET") {
        toast.error(
          "This account doesn't have a password. Continue with Google or create one using Forgot Password."
        );
      } else {
        toast.error(mapAuthError(error.code));
      }
    }
  };

  return (
    <Card>
      <h2 className={styles.title}>Welcome back</h2>
      <p className={styles.subtitle}>
        Sign in to continue to your workspace.
      </p>

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />

          <div style={{ textAlign: "right", marginTop: "4px" }}>
            <Link
              to="/forgot-password"
              className={styles.link}
              style={{ fontSize: "var(--text-sm)" }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className={styles.divider}>or</div>

      <GoogleSignInButton />

      <div className={styles.footer}>
        Don't have an account?
        <Link to="/register" className={styles.link}>
          Create account
        </Link>
      </div>
    </Card>
  );
};
