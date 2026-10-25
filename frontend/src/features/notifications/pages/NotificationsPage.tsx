import React, { useEffect, useState } from "react";
import { notificationApi } from "../notificationApi";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/formatDate";
import { handleApiError } from "@/services/errorHandler";
import type { NotificationItem } from "@/types/transaction";
import { Bell, Mail, Smartphone, MessageSquare } from "lucide-react";

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; correlationId?: string } | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await notificationApi.getNotifications(0, 20);
      setNotifications(res.content || []);
    } catch (err) {
      const apiErr = handleApiError(err);
      setError({ message: apiErr.message, correlationId: apiErr.correlationId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getChannelIcon = (channel: string) => {
    switch (channel.toUpperCase()) {
      case "EMAIL":
        return <Mail className="size-4 text-indigo-500" />;
      case "SMS":
        return <Smartphone className="size-4 text-emerald-500" />;
      case "PUSH":
        return <Bell className="size-4 text-cyan-500" />;
      default:
        return <MessageSquare className="size-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="Notifications"
        description="Transaction receipts, security notifications, and ledger alerts."
      />

      {error && (
        <ErrorState
          title="Could not load notifications"
          message={error.message}
          correlationId={error.correlationId}
          onRetry={fetchNotifications}
        />
      )}

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card p-8">
          <LoadingSpinner text="Retrieving notifications..." size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-8 text-muted-foreground" />}
          title="No alerts right now"
          description="You are completely caught up! New deposit, transfer, and login notifications will show up here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card key={notif.id} className="transition-all hover:border-primary/40 shadow-2xs">
              <CardContent className="p-4 flex items-start gap-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/80">
                  {getChannelIcon(notif.channel)}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-foreground">
                      {notif.subject || "Transaction Alert"}
                    </p>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">{notif.content}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground/80 border-t border-border/40 pt-2 font-mono">
                    <span>Target: {notif.recipient}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                      {notif.channel}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
