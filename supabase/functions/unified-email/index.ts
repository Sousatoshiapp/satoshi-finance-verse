import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'password_reset' | 'admin_password_reset' | 'email_verification' | 'magic_link';
  email: string;
  redirectTo?: string;
  token?: string;
  newPassword?: string;
}

interface PasswordResetEmailData {
  email: string;
  resetLink: string;
  type: 'admin' | 'user';
}

const generatePasswordResetTemplate = (data: PasswordResetEmailData) => {
  const { email, resetLink, type } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinição de Senha - BTZ</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">BTZ</h1>
          <p style="color: #64748b; margin: 10px 0 0 0;">Plataforma de Educação</p>
        </div>
        
        <h2 style="color: #1e293b; margin-bottom: 20px;">
          ${type === 'admin' ? 'Reset de Senha - Administrador' : 'Redefinição de Senha'}
        </h2>
        
        <p style="color: #334155; line-height: 1.6; margin-bottom: 20px;">
          Olá,
        </p>
        
        <p style="color: #334155; line-height: 1.6; margin-bottom: 25px;">
          Você solicitou uma redefinição de senha para sua conta <strong>${email}</strong>. 
          Clique no botão abaixo para criar uma nova senha:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
          Se você não conseguir clicar no botão, copie e cole este link no seu navegador:
        </p>
        
        <p style="background-color: #f8fafc; padding: 15px; border-radius: 4px; word-break: break-all; font-size: 13px; margin-bottom: 25px;">
          ${resetLink}
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 10px;">
            <strong>Importantes informações de segurança:</strong>
          </p>
          <ul style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
            <li>Este link expira em 24 horas por segurança</li>
            <li>Se você não solicitou esta redefinição, ignore este email</li>
            <li>Nunca compartilhe este link com outras pessoas</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2025 BTZ - Plataforma de Educação. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, redirectTo, token, newPassword }: EmailRequest = await req.json();

    console.log(`Processing ${type} email request for ${email}`);

    if (!email) {
      throw new Error('Email é obrigatório');
    }

    switch (type) {
      case 'password_reset': {
        // Reset de senha para usuários normais
        const { data, error } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: redirectTo || `${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/reset-password`
          }
        });

        if (error) {
          console.error('Erro ao gerar link de recuperação:', error);
          throw new Error(`Erro ao gerar link de recuperação: ${error.message}`);
        }

        const resetLink = data.properties?.action_link;
        if (!resetLink) {
          throw new Error('Não foi possível gerar link de redefinição');
        }

        const emailResponse = await resend.emails.send({
          from: "BTZ Plataforma <no-reply@btzplatform.com>",
          to: [email],
          subject: "Redefinição de Senha - BTZ",
          html: generatePasswordResetTemplate({
            email,
            resetLink,
            type: 'user'
          }),
        });

        console.log("Email de reset enviado:", emailResponse);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Email de redefinição enviado com sucesso' 
          }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      case 'admin_password_reset': {
        // Reset de senha para administradores usando token
        if (token && newPassword) {
          // Verificar e usar token para redefinir senha
          const { data: tokenData, error: tokenError } = await supabase
            .from('admin_password_tokens')
            .select('*')
            .eq('token', token)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .single();

          if (tokenError || !tokenData) {
            throw new Error('Token inválido ou expirado');
          }

          // Buscar usuário admin
          const { data: adminUser, error: adminError } = await supabase
            .from('admin_users')
            .select('user_id, email')
            .eq('email', tokenData.email)
            .single();

          if (adminError || !adminUser) {
            throw new Error('Usuário administrador não encontrado');
          }

          // Redefinir senha
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            adminUser.user_id,
            { password: newPassword }
          );

          if (updateError) {
            throw new Error(`Erro ao atualizar senha: ${updateError.message}`);
          }

          // Marcar token como usado
          await supabase
            .from('admin_password_tokens')
            .update({ used: true })
            .eq('token', token);

          // Enviar email de confirmação
          const confirmationEmail = await resend.emails.send({
            from: "BTZ Plataforma <no-reply@btzplatform.com>",
            to: [tokenData.email],
            subject: "Senha Redefinida com Sucesso - BTZ Admin",
            html: `
              <h2>Senha Redefinida</h2>
              <p>Sua senha de administrador foi redefinida com sucesso.</p>
              <p>Se você não fez essa alteração, entre em contato conosco imediatamente.</p>
            `,
          });

          console.log("Email de confirmação enviado:", confirmationEmail);

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Senha redefinida com sucesso' 
            }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        } else {
          // Solicitar reset de senha para admin
          if (email !== 'fasdurian@gmail.com') {
            throw new Error('Email não autorizado para reset administrativo');
          }

          const resetToken = crypto.randomUUID();
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

          // Salvar token no banco
          const { error: insertError } = await supabase
            .from('admin_password_tokens')
            .insert({
              email: email,
              token: resetToken,
              expires_at: expiresAt.toISOString()
            });

          if (insertError) {
            console.error('Erro ao salvar token:', insertError);
            throw new Error('Erro interno do servidor');
          }

          const resetLink = `${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/admin/reset-password?token=${resetToken}`;

          const emailResponse = await resend.emails.send({
            from: "BTZ Plataforma <no-reply@btzplatform.com>",
            to: [email],
            subject: "Reset de Senha - Administrador BTZ",
            html: generatePasswordResetTemplate({
              email,
              resetLink,
              type: 'admin'
            }),
          });

          console.log("Email de reset admin enviado:", emailResponse);

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Email de redefinição administrativa enviado' 
            }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
      }

      default:
        throw new Error(`Tipo de email não suportado: ${type}`);
    }

  } catch (error: any) {
    console.error("Erro na função de email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor',
        details: error.toString()
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);