import { Button } from "@/components/shared/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";

interface OtherUser {
  id: string;
  nickname: string;
  profile_image_url?: string;
}

interface DirectChatHeaderProps {
  otherUser: OtherUser;
  onBack: () => void;
}

export function DirectChatHeader({ otherUser, onBack }: DirectChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={otherUser.profile_image_url} 
            alt={otherUser.nickname}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {otherUser.nickname.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <h2 className="font-semibold text-foreground">
            {otherUser.nickname}
          </h2>
          <p className="text-xs text-muted-foreground">
            Online agora
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}