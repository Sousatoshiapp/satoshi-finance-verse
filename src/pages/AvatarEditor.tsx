// ============================================
// PERSONALIZAÇÃO EXTREMA - TEMPORARIAMENTE DESABILITADA
// ============================================
// Esta funcionalidade foi temporariamente removida para 
// revisão e melhorias futuras. Será reativada em breve.
// ============================================

/*
export { AvatarEditor as default } from '@/components/features/avatar-customization/avatar-editor';
*/

// Placeholder component to prevent build errors
export default function AvatarEditor() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-muted-foreground mb-2">
          Editor de Avatar
        </h1>
        <p className="text-muted-foreground">
          Esta funcionalidade está sendo desenvolvida...
        </p>
      </div>
    </div>
  );
}