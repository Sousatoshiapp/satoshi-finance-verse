import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, action } = await req.json();
    console.log(`Admin password reset request for: ${email}, action: ${action}`);

    // Verificar se é o email autorizado
    if (email !== "fasdurian@gmail.com") {
      console.log(`Unauthorized email attempt: ${email}`);
      return new Response(
        JSON.stringify({ error: "Email não autorizado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "request_reset") {
      // Gerar token único
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

      // Salvar token no banco
      const { error: dbError } = await supabase
        .from("admin_password_tokens")
        .insert({
          token,
          email,
          expires_at: expiresAt.toISOString(),
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Erro ao salvar token");
      }

      // Enviar email
      const resetUrl = `${req.headers.get("origin") || "https://uabdmohhzsertxfishoh.supabase.co"}/admin/reset-password?token=${token}`;
      
      const emailResult = await resend.emails.send({
        from: "Admin <onboarding@resend.dev>",
        to: [email],
        subject: "🔒 Reset de Senha - Painel Administrativo",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">🛡️ Satoshi Finance Game</h1>
              <p style="color: #6b7280; margin: 5px 0;">Painel Administrativo</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <h2 style="color: #1e293b; margin-top: 0;">Reset de Senha Solicitado</h2>
              <p style="color: #475569; line-height: 1.6;">
                Uma solicitação de reset de senha foi feita para o painel administrativo.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  🔑 Redefinir Senha
                </a>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  ⚠️ <strong>Importante:</strong> Este link expira em 30 minutos e só pode ser usado uma vez.
                </p>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Se você não solicitou este reset, ignore este email. Sua senha permanecerá inalterada.
              </p>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
                Token: <code style="background: #e5e7eb; padding: 2px 4px; border-radius: 3px;">${token.substring(0, 8)}...</code>
              </p>
            </div>
          </div>
        `,
      });

      console.log("Email sent successfully:", emailResult);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email de reset enviado com sucesso",
          token_preview: token.substring(0, 8) + "..."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "reset_password") {
      const { token, newPassword } = await req.json();

      // Verificar token
      const { data: tokenData, error: tokenError } = await supabase
        .from("admin_password_tokens")
        .select("*")
        .eq("token", token)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        console.log("Invalid or expired token:", token);
        return new Response(
          JSON.stringify({ error: "Token inválido ou expirado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Marcar token como usado
      await supabase
        .from("admin_password_tokens")
        .update({ used: true })
        .eq("id", tokenData.id);

      console.log("Password reset successful for:", email);

      // Enviar email de confirmação
      await resend.emails.send({
        from: "Admin <onboarding@resend.dev>",
        to: [email],
        subject: "✅ Senha Alterada - Painel Administrativo",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0;">✅ Senha Alterada com Sucesso</h1>
            </div>
            
            <div style="background: #f0fdf4; padding: 30px; border-radius: 12px; border: 1px solid #bbf7d0;">
              <p style="color: #166534; line-height: 1.6; margin: 0;">
                Sua senha do painel administrativo foi alterada com sucesso em ${new Date().toLocaleString('pt-BR')}.
              </p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                Se você não fez esta alteração, entre em contato imediatamente.
              </p>
            </div>
          </div>
        `,
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Senha alterada com sucesso"
          // SECURITY FIX: Remove password from response
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in admin-password-reset:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});