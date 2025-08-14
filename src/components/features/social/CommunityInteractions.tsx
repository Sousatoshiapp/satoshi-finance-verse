import React, { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CommunityInteractionsProps {
  contentId: string;
  contentType: 'story' | 'win' | 'tournament' | 'achievement';
  initialLikes?: number;
  initialComments?: number;
  userHasLiked?: boolean;
  className?: string;
}

export function CommunityInteractions({
  contentId,
  contentType,
  initialLikes = 0,
  initialComments = 0,
  userHasLiked = false,
  className = ''
}: CommunityInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [hasLiked, setHasLiked] = useState(userHasLiked);
  const { toast } = useToast();

  const handleLike = () => {
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
    
    // TODO: Send to backend
    // await likeContent(contentId, contentType);
  };

  const handleComment = () => {
    toast({
      title: "💬 Comentários",
      description: "Sistema de comentários em desenvolvimento!",
    });
  };

  const handleShare = async () => {
    const shareText = `Confira essa conquista incrível no BeeTZ! 🔥`;
    const shareUrl = `${window.location.origin}/share/${contentType}/${contentId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BeeTZ Community',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share canceled or failed');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "🔗 Link copiado!",
        description: "Link compartilhado copiado para a área de transferência",
      });
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={`flex items-center gap-1 text-xs h-auto p-1 ${
          hasLiked 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-muted-foreground hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
        {likes}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleComment}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary h-auto p-1"
      >
        <MessageCircle className="w-4 h-4" />
        {comments}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary h-auto p-1"
      >
        <Share2 className="w-4 h-4" />
        Compartilhar
      </Button>
    </div>
  );
}