import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { ProfileCard } from "../components/ProfileCard";
import { SecurityCard } from "../components/SecurityCard";

export const SettingsPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in-50 duration-200">
      <PageHeader
        title="Account Settings"
        description="View your authenticated identity, security credentials, and interface preferences."
      />

      <div className="space-y-6">
        <ProfileCard />
        <SecurityCard />
      </div>
    </div>
  );
};

export default SettingsPage;
