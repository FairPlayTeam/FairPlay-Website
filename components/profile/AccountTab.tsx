"use client";

import Bowser from "bowser";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { FaDesktop, FaMobileAlt, FaTrash } from "react-icons/fa";
import { toast } from "@/components/ui/Toast/toast";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import { User } from "@/types/schema";
import { getSessions, revokeSession, Session } from "@/lib/users";
import Button from "@/components/ui/Button";

interface AccountTabProps {
  user: User;
}

export default function AccountTab({ user }: AccountTabProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const res = await getSessions();
      setSessions(res.data.sessions);
      console.log(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    if (!confirm("Are you sure you want to revoke this session?")) return;

    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session revoked");
    } catch (err) {
      console.error(err);
      toast.error("Failed to revoke session");
    }
  };

  return (
    <div className="px-4">
      <h3 className="text-xl font-semibold mb-4">Account Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="block text-sm text-text-amount mb-1">Email</div>
          <div className="font-medium">{user.email}</div>
        </div>
        <div>
          <div className="block text-sm text-text-amount mb-1">Joined At</div>
          <div className="font-medium">
            {format(new Date(user.createdAt), "PPP")}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4">Active Sessions</h3>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner className="size-8" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-muted-foreground">No active sessions found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => {
            const browser = Bowser.getParser(
              session.userAgent ??
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
            ).getBrowser();
            return (
              <Card
                key={session.id}
                className="max-w-xl p-4 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-4">
                  {session.deviceInfo?.toLowerCase().includes("mobile") ? (
                    <FaMobileAlt className="size-8" />
                  ) : (
                    <FaDesktop className="size-9 p-1" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      {session.deviceInfo || "Unknown Device"}
                      {session.isCurrent && (
                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col text-sm text-text-amount">
                      <span>{session.ipAddress || "Unknown IP"}</span>
                      <span>
                        {browser.name} {browser.version}
                      </span>
                      <span>
                        Last active{" "}
                        {format(new Date(session.lastUsedAt), "PP p")}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Revoke Session"
                    onClick={() => handleRevoke(session.id)}
                    className="text-red-500 hover:bg-red-500/10 rounded-full"
                  >
                    <FaTrash />
                    <span className="sr-only">Revoke Session</span>
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
