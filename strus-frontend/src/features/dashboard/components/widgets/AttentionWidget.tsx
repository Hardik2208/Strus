import React from "react";
import { Card } from "../../../../components/ui/Card";
import { EmptyState } from "./EmptyStates";
import type { RequiresAttentionItem } from "../../types/dashboard.types";
import { formatDistanceToNow } from "date-fns";

interface AttentionWidgetProps {
  items: RequiresAttentionItem[];
}

export const AttentionWidget: React.FC<AttentionWidgetProps> = ({
  items,
}) => {
  if (items.length === 0) {
    return (
      <EmptyState
        title="You're all caught up."
        description="There are no items that require your attention right now."
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-12)",
      }}
    >
      {items.map((item) => (
        <Card
          key={item.id}
          style={{ padding: "var(--space-16)" }}
        >
          <h4
            style={{
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {item.title}
          </h4>

          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
              marginTop: "var(--space-4)",
            }}
          >
            {item.description}
          </p>

          <p
            style={{
              fontSize: "11px",
              color: "var(--color-text-muted)",
              marginTop: "var(--space-8)",
            }}
          >
            {formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
            })}
          </p>
        </Card>
      ))}
    </div>
  );
};