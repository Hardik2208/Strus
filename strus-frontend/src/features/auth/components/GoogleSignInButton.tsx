
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { env } from "../../../lib/config/env";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import { mapAuthError } from "../../../lib/api/api-error";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdAPI {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;

  renderButton: (
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline";
      size: "large";
      text: "continue_with";
      shape: "rectangular";
      width: number;
    }
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdAPI;
      };
    };
  }
}

export const GoogleSignInButton: React.FC = () => {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!env.GOOGLE_CLIENT_ID) {
      toast.error("Google Client ID is not configured.");
      return;
    }

    const initializeGoogle = () => {
      const google = window.google;

      if (!google || !buttonRef.current) {
        toast.error("Google Sign-In could not be initialized.");
        return;
      }

      buttonRef.current.replaceChildren();

      google.accounts.id.initialize({
        client_id: env.GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (processingRef.current) return;

          if (!response.credential) {
            toast.error("Google did not return a valid credential.");
            return;
          }

          processingRef.current = true;
          setIsLoading(true);

          try {
            await authService.googleLogin(response.credential);

            toast.success("Google sign-in successful!");

            const profileCompleted =
              useAuthStore.getState().profileCompleted;

            if (profileCompleted === false) {
              navigate("/profile/setup");
            } else {
              navigate("/dashboard");
            }
          } catch (error: unknown) {
            const code =
              typeof error === "object" &&
              error !== null &&
              "code" in error
                ? String(error.code)
                : undefined;

            toast.error(mapAuthError(code));
          } finally {
            processingRef.current = false;
            setIsLoading(false);
          }
        },
      });

      google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 320,
      });
    };

    const script = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!script) {
      toast.error("Google Identity Services script is missing.");
      return;
    }

    script.addEventListener("load", initializeGoogle);

    if (window.google) {
      initializeGoogle();
    }

    return () => {
      script.removeEventListener("load", initializeGoogle);
    };
  }, [navigate]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: isLoading ? 0.6 : 1,
        pointerEvents: isLoading ? "none" : "auto",
      }}
      aria-busy={isLoading}
    >
      <div ref={buttonRef} />
    </div>
  );
};
