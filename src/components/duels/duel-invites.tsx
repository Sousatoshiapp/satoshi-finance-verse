import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DuelInviteModal } from "./duel-invite-modal";

interface DuelInvitesProps {
  invites: any[];
  onInviteResponse: () => void;
}

export function DuelInvites({ invites, onInviteResponse }: DuelInvitesProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();


  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Convite</Badge>
                <span>{invite.challenger.nickname}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {new Date(invite.expires_at).toLocaleString()}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-2">
                  <strong>{invite.challenger.nickname}</strong> te desafiou para um duelo sobre{" "}
                  <strong>{invite.quiz_topic}</strong>
                </p>
                <Badge variant="secondary">{invite.quiz_topic}</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedInvite(invite);
                    setShowModal(true);
                  }}
                  disabled={loading === invite.id}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver Convite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <DuelInviteModal
        invite={selectedInvite}
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedInvite(null);
        }}
        onResponse={(accepted) => {
          onInviteResponse();
          setShowModal(false);
          setSelectedInvite(null);
        }}
      />
    </div>
  );
}
