import React, { memo, useMemo } from 'react';
import { VirtualList } from './virtual-list';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Badge } from './badge';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../lib/utils';

interface VirtualSocialFeedProps {
  posts: any[];
  onLikePost: (postId: string, isLiked: boolean) => void;
  onToggleComments: (postId: string) => void;
  height?: number;
  itemHeight?: number;
}

export const VirtualSocialFeed = memo(({
  posts,
  onLikePost,
  onToggleComments,
  height = 600,
  itemHeight = 200
}: VirtualSocialFeedProps) => {
  const renderPost = useMemo(() => (post: any) => (
    <Card className="hover:shadow-md transition-shadow mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles?.user_avatars?.[0]?.avatars?.image_url || post.profiles?.profile_image_url} />
            <AvatarFallback>
              {post.profiles?.nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{post.profiles?.nickname}</h4>
              <Badge variant="secondary" className="text-xs">
                Nível {post.profiles?.level || 1}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 hover:text-red-600",
              post.user_liked && "text-red-600"
            )}
            onClick={() => onLikePost(post.id, post.user_liked || false)}
          >
            <Heart className={cn("h-4 w-4", post.user_liked && "fill-current")} />
            {post.likes_count}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:text-blue-600"
            onClick={() => onToggleComments(post.id)}
          >
            <MessageCircle className="h-4 w-4" />
            {post.comments_count}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hover:text-green-600">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </CardContent>
    </Card>
  ), [onLikePost, onToggleComments]);

  return (
    <VirtualList
      items={posts}
      itemHeight={itemHeight}
      height={height}
      renderItem={renderPost}
      className="space-y-4"
    />
  );
});

VirtualSocialFeed.displayName = 'VirtualSocialFeed';
