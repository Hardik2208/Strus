import React from "react";
import { Button } from "../../../../components/ui/Button";
import type { QuickAction } from "../../types/dashboard.types";
import { useNavigate } from "react-router-dom";

interface QuickActionsWidgetProps {
  actions?: QuickAction[];
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  actions = [],
}) => {
  const navigate = useNavigate();

  if (actions.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-12)",
      }}
    >
      {actions.map((action) => (
        <Button
          key={action.key}
          variant="outline"
          onClick={() => navigate(action.route)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};