import React from "react";
import styles from "./Card.module.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${styles.card} ${className || ""}`} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
