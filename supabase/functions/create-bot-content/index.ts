import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BOT_POSTS = [
  'Acabei de descobrir uma nova estratégia de investimento! 🚀 Alguém quer discutir sobre diversificação?',
  'Meu portfólio está mais diversificado agora. Renda fixa + variável = equilíbrio! ⚖️',
  'Descobri o poder do dollar-cost averaging. Investir todo mês é a chave! 📅',
  'Análise técnica vs fundamentalista: qual vocês preferem? Eu uso as duas! 📊📈',
  'Rebalanceamento de carteira: fiz o meu hoje e já vejo a diferença! ⚖️',
  'Buy and hold ou trading? Cada estratégia tem seu momento! 🎯',
  'Aprendi sobre value investing. Warren Buffett estava certo o tempo todo! 💎',
  'Diversificação geográfica: investir só no Brasil limita muito! 🌍',
  'Descobri os ETFs internacionais. Mundo de possibilidades! 🌐',
  'Análise setorial me ajudou a escolher melhores ações hoje! 🏭',
  
  'Dica do dia: nunca invista mais do que pode perder! 💰 Sempre tenha uma reserva de emergência.',
  'Descobri que educação financeira deveria ser matéria obrigatória nas escolas! 🎓',
  'Planejamento financeiro é como um GPS para seus sonhos! 🗺️',
  'Dica: sempre leia o prospecto antes de investir. Conhecimento é poder! 📚',
  'Aprendi sobre análise fundamentalista hoje. É incrível como os números contam histórias! 📊',
  'Livro "Pai Rico, Pai Pobre" mudou minha mentalidade financeira! 📖',
  'Curso de finanças pessoais foi o melhor investimento que fiz! 🎓',
  'Planilha de controle financeiro: organização é fundamental! 📊',
  'Aprendi sobre fluxo de caixa pessoal. Game changer! 💰',
  'Educação financeira é investimento que ninguém pode tirar de você! 🧠',
  
  'Quem mais está acompanhando o mercado hoje? Os índices estão interessantes! 📈',
  'Inflação, juros, câmbio... como tudo está interligado na economia! 🌐',
  'Mercado volátil hoje! Ótima oportunidade para quem tem estratégia! 📉📈',
  'IPCA saiu hoje: como isso afeta nossos investimentos? 📊',
  'Taxa Selic mudou: hora de revisar a estratégia! 📈',
  'Dólar oscilando muito. Oportunidade para quem entende! 💵',
  'Bolsa americana influencia muito a nossa. Globalização! 🌍',
  'Commodities em alta: agronegócio brasileiro se beneficia! 🌾',
  'Mercado emergente tem suas peculiaridades. Estudando! 📚',
  'Análise macroeconômica ajuda a entender tendências! 🌐',
  
  'Acabei de ler sobre crypto e blockchain. Tecnologia fascinante! ₿',
  'Bitcoin como reserva de valor: será o ouro digital? 🪙',
  'DeFi está revolucionando o sistema financeiro! 🔗',
  'Smart contracts: contratos que se executam sozinhos! 🤖',
  'Ethereum e suas aplicações descentralizadas impressionam! ⚡',
  'NFTs além da arte: utilidade real em diversos setores! 🎨',
  'Staking de criptomoedas: renda passiva interessante! 💰',
  'Web3 vai mudar como interagimos com dinheiro! 🌐',
  'Carteiras digitais: segurança é prioridade número 1! 🔐',
  'Regulamentação crypto: mercado amadurecendo! ⚖️',
  
  'Alguém tem experiência com fundos imobiliários? Estou estudando essa modalidade. 🏢',
  'CDBs com liquidez diária: segurança e flexibilidade! 🏦',
  'Tesouro Direto: porta de entrada para renda fixa! 🏛️',
  'Ações de dividendos: renda passiva todo mês! 💰',
  'Fundos multimercado: diversificação em um só produto! 📊',
  'LCIs e LCAs: isenção de IR é atrativa! 🏠',
  'Debêntures incentivadas: conhecem essa modalidade? 🏭',
  'Previdência privada: planejando a aposentadoria! 👴',
  'COE: produto estruturado interessante para diversificar! 📈',
  'Fundos de investimento: gestão profissional vale a pena! 👔',
  
  'Beetz acumulando! Próxima meta: 15.000! Quem vem comigo nessa jornada? 💎',
  'Minha sequência de estudos chegou a 15 dias! Consistência é tudo! 🔥',
  'Quem quer um duelo rápido sobre finanças? Estou confiante hoje! ⚔️',
  'Level up! Conhecimento financeiro é o melhor power-up! ⬆️',
  'Streak de 30 dias estudando! Hábito formado! 🎯',
  'Conquistei mais um badge hoje! Motivação total! 🏆',
  'Ranking subindo: estudo + prática = resultados! 📈',
  'Desafio aceito! Vamos ver quem sabe mais sobre FIIs! 🏢',
  'XP acumulando: cada quiz me deixa mais esperto! 🧠',
  'Meta batida: 1000 pontos esta semana! 🎉',
  
  'Lembro quando comecei: não sabia nem o que era CDB. Como evoluímos! 📈',
  'Trading emocional é o maior inimigo do investidor. Frieza é fundamental! 🧊',
  'Primeiro investimento: R$ 100 no Tesouro. Hoje tenho carteira diversificada! 💪',
  'Erro do passado: seguir dicas de WhatsApp. Hoje faço minha análise! 🤦‍♂️',
  'Aprendi na prática: timing do mercado é quase impossível! ⏰',
  'Paciência é virtude do investidor. Resultados vêm com tempo! ⏳',
  'Primeira perda me ensinou mais que qualquer livro! 📚',
  'Disciplina financeira mudou minha vida completamente! 💪',
  'Investir jovem: juros compostos são mágicos! ✨',
  'Reserva de emergência me salvou na pandemia! 🛡️',
  
  'Weekend chegando! Hora de estudar mais sobre investimentos! 📖',
  'Quem mais ama estudar sobre o mercado financeiro? É viciante! 🧠',
  'Alguém sabe explicar sobre juros compostos? Quero testar meu conhecimento! 🤔',
  'Tempo é o melhor amigo do investidor de longo prazo! ⏰',
  'Diversificação: não colocar todos os ovos na mesma cesta! 🥚',
  'Risco e retorno sempre andam juntos. Equilíbrio é chave! ⚖️',
  'Investir é maratona, não sprint. Foco no longo prazo! 🏃‍♂️',
  'Conhecimento é o único investimento que sempre dá retorno! 🎓',
  'Mercado premia quem se prepara e estuda! 🏆',
  'Paciência + disciplina + conhecimento = sucesso financeiro! 🎯'
];

const BOT_COMMENTS = [
  'Concordo totalmente! Excelente perspectiva! 👍',
  'Muito boa essa dica, obrigado por compartilhar! 🙏',
  'Parabéns pelo resultado! Inspirador! 🎉',
  'Esse é o tipo de mentalidade que gera resultados! 🎯',
  'Perfeita análise! Pensamento alinhado! 💯',
  'Exato! Você captou a essência do investimento! ✨',
  'Concordo 100%! Estratégia sólida! 🎯',
  'Falou tudo! Não poderia concordar mais! 👏',
  'Pensamento certeiro! Parabéns pela clareza! 💡',
  'Isso aí! Mentalidade de investidor de sucesso! 🏆',
  
  'Perspectiva interessante, não tinha pensado nisso! 💭',
  'Alguém tem mais informações sobre esse assunto? 🤓',
  'Post muito útil! Salvando para consultar depois! 📌',
  'Adoro esse tipo de conteúdo educativo! ❤️',
  'Aprendi algo novo hoje! Obrigado! 🎓',
  'Que insight valioso! Me fez refletir! 🤔',
  'Nunca havia visto por esse ângulo! Interessante! 👀',
  'Conteúdo de qualidade! Sempre aprendendo! 📚',
  'Explicação clara e didática! Parabéns! 👨‍🏫',
  'Informação valiosa! Compartilhando com amigos! 📤',
  
  'Isso me lembra quando comecei a investir... nostalgia! 😊',
  'Passei pela mesma situação! Experiência similar! 🤝',
  'Vivi isso também! Aprendizado constante! 📈',
  'Minha jornada foi parecida! Evolução contínua! 🚀',
  'Já cometi esse erro antes! Lição aprendida! 🎯',
  'Experiência parecida aqui! Mercado ensina muito! 📊',
  'Também pensei assim no início! Como mudamos! 🔄',
  'Lembro da minha primeira vez... que nervoso! 😅',
  'Já estive nessa situação! Tempo cura tudo! ⏰',
  'História similar à minha! Identificação total! 🎭',
  
  'Vou tentar implementar essa estratégia também! 💪',
  'Ótima ideia! Vou pesquisar mais sobre isso! 🔍',
  'Inspirou-me a revisar minha carteira! 📊',
  'Vou aplicar essa dica imediatamente! ⚡',
  'Motivou-me a estudar mais esse tema! 📖',
  'Vou testar essa abordagem! Obrigado! 🧪',
  'Ideia genial! Já estou planejando! 📝',
  'Vou incorporar isso na minha estratégia! 🎯',
  'Inspiração para meu próximo movimento! 🚀',
  'Dica anotada! Vou colocar em prática! ✍️',
  
  'Compartilhando conhecimento = compartilhando riqueza! 💰',
  'Estudo + prática = sucesso nos investimentos! 📚💼',
  'Mercado recompensa quem se prepara! 🏆',
  'Diversificação é realmente a chave! 🔑',
  'Conhecimento financeiro transforma vidas! ✨',
  'Paciência é virtude do investidor! ⏳',
  'Disciplina sempre vence emoção! 🧘‍♂️',
  'Tempo é nosso maior aliado! ⏰',
  'Educação financeira é libertação! 🗽',
  'Investir é plantar para colher depois! 🌱',
  
  'E sobre os riscos? Como você mitiga? 🛡️',
  'Qual sua opinião sobre timing de mercado? ⏰',
  'Como você escolhe seus investimentos? 🤔',
  'Já considerou diversificação internacional? 🌍',
  'Qual percentual você destina para renda variável? 📊',
  'Como equilibra risco e retorno? ⚖️',
  'Qual sua estratégia para bear market? 🐻',
  'Você rebalanceia com que frequência? 🔄',
  'Como analisa a qualidade de uma empresa? 🏢',
  'Qual indicador você considera mais importante? 📈',
  
  'Continue assim! Caminho certo! 🛤️',
  'Persistência é fundamental! Não desista! 💪',
  'Você está no caminho certo! Parabéns! 🎉',
  'Mentalidade de vencedor! Continue! 🏆',
  'Evolução constante! Inspirador! 📈',
  'Foco e determinação! Admiro! 🎯',
  'Jornada de crescimento! Parabéns! 🌱',
  'Disciplina exemplar! Continue assim! 👏',
  'Mindset de investidor! Perfeito! 🧠',
  'Trajetória de sucesso! Inspiração! ⭐'
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
    const usedPosts = new Set();

    const getUniquePost = () => {
      let attempts = 0;
      let selectedPost;
      
      do {
        selectedPost = BOT_POSTS[Math.floor(Math.random() * BOT_POSTS.length)];
        attempts++;
      } while (usedPosts.has(selectedPost) && attempts < 10);
      
      usedPosts.add(selectedPost);
      return selectedPost;
    };
    
    for (const bot of botsToPost) {
      const randomPost = getUniquePost();
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
      const usedComments = new Set();

      const getUniqueComment = () => {
        let attempts = 0;
        let selectedComment;
        
        do {
          selectedComment = BOT_COMMENTS[Math.floor(Math.random() * BOT_COMMENTS.length)];
          attempts++;
        } while (usedComments.has(selectedComment) && attempts < 10);
        
        usedComments.add(selectedComment);
        return selectedComment;
      };

      for (const post of recentPosts) {
        const botsToComment = bots.filter(() => Math.random() < 0.15); // 15% chance
        
        for (const bot of botsToComment) {
          // Não comentar no próprio post
          if (bot.id === post.user_id) continue;
          
          const randomComment = getUniqueComment();
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
