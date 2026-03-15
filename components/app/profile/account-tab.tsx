"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Monitor, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { getSessions, revokeSession, Session, User } from "@/lib/users";

export default function AccountTab({ user }: { user: User }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const res = await getSessions();
        if (!cancelled) {
          setSessions(res.data.sessions);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load session.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSessions(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleConfirmRevoke = async () => {
    if (!sessionToRevoke) return;
    const sessionId = sessionToRevoke.id;
    setSessionToRevoke(null);

    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session revoked.");
    } catch {
      toast.error("Failed to revoke session.");
    }
  };

  return (
    <div className="md:px-4 space-y-8">
      {/* Account info */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Member since</p>
            <p className="font-medium">{format(new Date(user.createdAt), "PPP")}</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Sessions */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Active Sessions</h3>

        {isLoadingSessions ? (
          <div className="grid place-items-center py-8">
            <Spinner className="size-10" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-muted-foreground">No active sessions found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => {
              const isMobile = session.deviceInfo?.toLowerCase().includes("mobile");

              return (
                <Card key={session.id} className="p-0">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {isMobile ? (
                        <Smartphone className="size-7 shrink-0 text-muted-foreground" />
                      ) : (
                        <Monitor className="size-7 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-medium flex-wrap">
                          <span>{session.deviceInfo || "Unknown Device"}</span>
                          {session.isCurrent && (
                            <Badge
                              variant="outline"
                              className="text-xs text-green-500 border-green-500/30 bg-green-500/10"
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col text-sm text-muted-foreground break-all mt-0.5">
                          <span>{session.ipAddress || "Unknown IP"}</span>
                          <span>Last active {format(new Date(session.lastUsedAt), "PP p")}</span>
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Revoke Session"
                        onClick={() => setSessionToRevoke(session)}
                        className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Revoke Session</span>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Confirm revoke dialog */}
      <AlertDialog
        open={Boolean(sessionToRevoke)}
        onOpenChange={(open) => !open && setSessionToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke session?</AlertDialogTitle>
            <AlertDialogDescription>
              {sessionToRevoke
                ? `Are you sure you want to revoke ${sessionToRevoke.deviceInfo || "this session"}?`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setSessionToRevoke(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRevoke}>
              Revoke
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
