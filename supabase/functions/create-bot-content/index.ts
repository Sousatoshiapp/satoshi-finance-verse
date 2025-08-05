import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BOT_POSTS = [
  'Acabei de descobrir uma nova estratégia de investimento! 🚀 Alguém quer discutir sobre diversificação?',
  'Dica do dia: nunca invista mais do que pode perder! 💰 Sempre tenha uma reserva de emergência.',
  'Quem mais está acompanhando o mercado hoje? Os índices estão interessantes! 📈',
  'Aprendi sobre análise fundamentalista hoje. É incrível como os números contam histórias! 📊',
  'Alguém tem experiência com fundos imobiliários? Estou estudando essa modalidade. 🏢',
  'Meu portfólio está mais diversificado agora. Renda fixa + variável = equilíbrio! ⚖️',
  'Quem quer um duelo rápido sobre finanças? Estou confiante hoje! ⚔️',
  'Descobri que educação financeira deveria ser matéria obrigatória nas escolas! 🎓',
  'Beetz acumulando! Próxima meta: 15.000! Quem vem comigo nessa jornada? 💎',
  'Inflação, juros, câmbio... como tudo está interligado na economia! 🌐',
  'Acabei de ler sobre crypto e blockchain. Tecnologia fascinante! ₿',
  'Planejamento financeiro é como um GPS para seus sonhos! 🗺️',
  'Quem mais ama estudar sobre o mercado financeiro? É viciante! 🧠',
  'Dica: sempre leia o prospecto antes de investir. Conhecimento é poder! 📚',
  'Minha sequência de estudos chegou a 15 dias! Consistência é tudo! 🔥',
  'Trading emocional é o maior inimigo do investidor. Frieza é fundamental! 🧊',
  'Alguém sabe explicar sobre juros compostos? Quero testar meu conhecimento! 🤔',
  'Mercado volátil hoje! Ótima oportunidade para quem tem estratégia! 📉📈',
  'Lembro quando comecei: não sabia nem o que era CDB. Como evoluímos! 📈',
  'Weekend chegando! Hora de estudar mais sobre investimentos! 📖'
];

const BOT_COMMENTS = [
  'Concordo totalmente! Excelente perspectiva! 👍',
  'Muito boa essa dica, obrigado por compartilhar! 🙏',
  'Isso me lembra quando comecei a investir... nostalgia! 😊',
  'Alguém tem mais informações sobre esse assunto? 🤓',
  'Post muito útil! Salvando para consultar depois! 📌',
  'Vou tentar implementar essa estratégia também! 💪',
  'Parabéns pelo resultado! Inspirador! 🎉',
  'Perspectiva interessante, não tinha pensado nisso! 💭',
  'Adoro esse tipo de conteúdo educativo! ❤️',
  'Compartilhando conhecimento = compartilhando riqueza! 💰',
  'Esse é o tipo de mentalidade que gera resultados! 🎯',
  'Estudo + prática = sucesso nos investimentos! 📚💼',
  'Mercado recompensa quem se prepara! 🏆',
  'Diversificação é realmente a chave! 🔑',
  'Conhecimento financeiro transforma vidas! ✨'
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🤖 Iniciando criação de conteúdo dos bots');

    // Buscar bots ativos
    const { data: bots, error: botsError } = await supabaseClient
      .from('profiles')
      .select('id, nickname, level')
      .eq('is_bot', true)
      .limit(50);

    if (botsError) {
      throw botsError;
    }

    if (!bots || bots.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum bot encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let postsCreated = 0;
    let commentsCreated = 0;
    let likesCreated = 0;

    // Criar posts para bots (30% dos bots fazem um post)
    const botsToPost = bots.filter(() => Math.random() < 0.3);
    
    for (const bot of botsToPost) {
      const randomPost = BOT_POSTS[Math.floor(Math.random() * BOT_POSTS.length)];
      const hoursAgo = Math.floor(Math.random() * 48); // Posts das últimas 48 horas
      
      const { error: postError } = await supabaseClient
        .from('social_posts')
        .insert({
          user_id: bot.id,
          content: randomPost,
          post_type: 'text',
          created_at: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
        });

      if (!postError) {
        postsCreated++;
      }
    }

    // Buscar posts recentes para adicionar comentários e likes
    const { data: recentPosts, error: postsError } = await supabaseClient
      .from('social_posts')
      .select('id, user_id')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 7 dias
      .limit(100);

    if (postsError) {
      console.error('Erro ao buscar posts:', postsError);
    } else if (recentPosts) {
      // Adicionar comentários (20% chance por bot por post)
      for (const post of recentPosts) {
        const botsToComment = bots.filter(() => Math.random() < 0.15); // 15% chance
        
        for (const bot of botsToComment) {
          // Não comentar no próprio post
          if (bot.id === post.user_id) continue;
          
          const randomComment = BOT_COMMENTS[Math.floor(Math.random() * BOT_COMMENTS.length)];
          const hoursAfterPost = Math.floor(Math.random() * 24); // Comentário até 24h depois
          
          const { error: commentError } = await supabaseClient
            .from('post_comments')
            .insert({
              post_id: post.id,
              user_id: bot.id,
              content: randomComment,
              created_at: new Date(Date.now() - hoursAfterPost * 60 * 60 * 1000).toISOString()
            });

          if (!commentError) {
            commentsCreated++;
          }
        }
      }

      // Adicionar likes (40% chance por bot por post)
      for (const post of recentPosts) {
        const botsToLike = bots.filter(() => Math.random() < 0.3); // 30% chance
        
        for (const bot of botsToLike) {
          // Não curtir o próprio post
          if (bot.id === post.user_id) continue;
          
          // Verificar se já curtiu
          const { data: existingLike } = await supabaseClient
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', bot.id)
            .single();

          if (!existingLike) {
            const { error: likeError } = await supabaseClient
              .from('post_likes')
              .insert({
                post_id: post.id,
                user_id: bot.id
              });

            if (!likeError) {
              likesCreated++;
            }
          }
        }
      }
    }

    console.log(`✅ Conteúdo criado: ${postsCreated} posts, ${commentsCreated} comentários, ${likesCreated} likes`);

    return new Response(
      JSON.stringify({
        success: true,
        postsCreated,
        commentsCreated,
        likesCreated,
        botsProcessed: bots.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na criação de conteúdo dos bots:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});