import React, { useState } from "react";
import styles from "./Input.module.css";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, fullWidth = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={`${styles.inputContainer} ${fullWidth ? styles.fullWidth : ""}`}>
        {label && (
          <label className={styles.label} htmlFor={props.id || props.name}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            type={inputType}
            className={`${styles.input} ${error ? styles.error : ""} ${className || ""}`}
            {...props}
          />
          {isPassword && (
            <div className={styles.trailingIcon}>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.iconButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}
        </div>
        {error && <p className={styles.errorText} role="alert">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
