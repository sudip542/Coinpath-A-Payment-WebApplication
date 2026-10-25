import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/formatDate";
import { User, Mail, Shield, Calendar, Key } from "lucide-react";

export const ProfileCard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="size-4 text-primary" />
            <CardTitle className="text-sm font-bold">Account Profile</CardTitle>
          </div>
          <StatusBadge status={user?.status || "ACTIVE"} />
        </div>
      </CardHeader>

      <CardContent className="pt-4 text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-border/40">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <User className="size-3.5" /> Full Name:
          </span>
          <span className="font-semibold text-foreground">{user?.fullName || "—"}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-border/40">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Mail className="size-3.5" /> Email Address:
          </span>
          <span className="font-mono text-foreground font-medium">{user?.email || "—"}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-border/40">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Shield className="size-3.5" /> Role Assigned:
          </span>
          <span className="font-semibold text-primary">{user?.role || "ROLE_USER"}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-border/40">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Key className="size-3.5" /> User UUID:
          </span>
          <span className="font-mono text-muted-foreground truncate max-w-[220px]">{user?.id || "—"}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5" /> Member Since:
          </span>
          <span className="text-foreground">{formatDateTime(user?.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
