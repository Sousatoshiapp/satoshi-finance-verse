import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X } from "lucide-react";

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  userAvatarUrl?: string;
  onImageUpdated: (newImageUrl: string) => void;
  userNickname: string;
}

export function ProfileImageUpload({ 
  currentImageUrl, 
  userAvatarUrl,
  onImageUpdated, 
  userNickname 
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione apenas arquivos de imagem');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('A imagem deve ter menos de 5MB');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: imageUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onImageUpdated(imageUrl);
      
      toast({
        title: "✅ Imagem atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso"
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload da imagem",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadImage(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImage(file);
  };

  const removeImage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ profile_image_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      onImageUpdated('');
      
      toast({
        title: "Imagem removida",
        description: "Sua foto de perfil foi removida"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a imagem",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarImage 
              src={userAvatarUrl || currentImageUrl} 
              alt={userNickname} 
            />
            <AvatarFallback className="text-2xl">
              {userNickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {currentImageUrl && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
              onClick={removeImage}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          
          <p className="text-sm text-muted-foreground mb-4">
            Arraste uma imagem aqui ou clique para selecionar
          </p>
          
          <div className="flex gap-2 justify-center">
            <label htmlFor="image-upload">
              <Button variant="outline" disabled={uploading} className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Enviando..." : "Selecionar Arquivo"}
              </Button>
            </label>
          </div>
          
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <p className="text-xs text-muted-foreground mt-4">
            PNG, JPG, GIF até 5MB
          </p>
        </div>
      </div>
    </Card>
  );
}