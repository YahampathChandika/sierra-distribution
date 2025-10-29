"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessSettings } from "./business-settings";
import { UserManagement } from "./user-management";
import { InvoiceSettings } from "./invoice-settings";
import { ProfileSettings } from "./profile-settings";

export function SettingsContent({ user, profile, users, settings }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "profile"
  );

  const isAdmin = profile?.role === "admin";

  const handleTabChange = (value) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`/dashboard/settings?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and system preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList
          className={`grid w-full ${isAdmin ? "grid-cols-4" : "grid-cols-1"}`}
        >
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSettings user={user} profile={profile} />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="business" className="space-y-4">
              <BusinessSettings initialSettings={settings} />
            </TabsContent>

            <TabsContent value="invoicing" className="space-y-4">
              <InvoiceSettings initialSettings={settings} />
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <UserManagement users={users} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
