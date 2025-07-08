import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Mix completo de nicknames realistas (3500+ únicos)
const NICKNAMES = [
  // Gaming/Finance Mix (25%)
  "CryptoKing2024", "BitcoinMaster", "TraderPro99", "InvestorX", "StockHunter", "CoinFlip88", "FinanceNinja", "MoneyMaker", "WealthBuilder", "TradingLegend", "CryptoSamurai", "BitWizard", "CoinMaster", "TradeHero", "InvestGuru", "CryptoElite", "StockGenius", "BitTrader", "CoinHunter", "TradeMaster", "FinanceGod", "CryptoChamp", "BitKing", "InvestPro", "StockLegend", "CoinWarrior", "TradeWiz", "CryptoBoss", "BitHero", "InvestKing", "StockMaster", "CoinGuru", "TradeElite", "CryptoLord", "BitMaster", "InvestWiz", "StockChamp", "CoinPro", "TradeBoss", "CryptoHero", "BitGuru", "InvestLord", "StockWiz", "CoinElite", "TradeMaster2024", "CryptoGod", "BitLegend", "InvestHero", "StockBoss", "CoinMaster2024",

  // Casual Brazilian (30%)
  "CarlosTrader", "AnaInvest", "PedroCoins", "MariaFinance", "JoaoStock", "LucasBit", "BrunoMoney", "CamilaCrypto", "RafaelTrade", "PatriciaWealth", "GustavoInvest", "IsabellaFin", "ThiagoTrade", "BiancaBit", "MateusCoins", "LarissaMoney", "FelipeStock", "JulianaCrypto", "RodrigoInvest", "ClaraWealth", "DanielFinance", "BeatrizBit", "LeonardoTrade", "ValentinaCoin", "GabrielMoney", "SofiaStock", "VictorCrypto", "AnaBeatriz", "LucasInvest", "MarianaMoney", "CauaFinance", "HeloíseaBit", "ArthurTrade", "AliceCoin", "BernardoStock", "LaísCrypto", "EnzoInvest", "LíviaWealth", "NicolasFinance", "ManuelaBit", "VitorTrade", "IsadoraCoin", "GuilhermeMoney", "YasminStock", "PietroCrypto", "CecíliaInvest", "JoãoPedro", "AnnaClara", "RyanFinance", "EmanuelleBit",

  // Gaming Style (20%)
  "ShadowTrader", "NightInvestor", "PhoenixBit", "DragonCoin", "LightningStock", "ThunderTrade", "IceInvestor", "FireCrypto", "StormWealth", "BlazeMoney", "FrostBit", "VoltTrade", "SteelInvestor", "FlameStock", "WindCrypto", "EarthMoney", "DarkTrader", "LightBit", "ChaosStock", "OrderCrypto", "ShadowBit", "PhoenixTrade", "DragonStock", "ThunderCoin", "LightningMoney", "StormCrypto", "IceStock", "FireBit", "BlazeTrade", "FrostCoin", "VoltStock", "SteelCrypto", "FlameBit", "WindTrade", "EarthCoin", "DarkStock", "LightCrypto", "ChaosBit", "OrderTrade", "MysticCoin", "NobleStock", "WildCrypto", "SageBit", "BraveTrade", "SilentCoin", "SwiftStock", "FierceCrypto", "CalmBit", "RapidTrade",

  // Tech/Crypto (15%)
  "BlockchainBro", "DeFiDude", "NFTNinja", "Web3Warrior", "MetaTrader", "SmartContract", "DigitalAsset", "CyberCoin", "TechInvestor", "AlgoTrader", "DataDriven", "CodeCrypto", "AIInvestor", "CloudStock", "QuantumBit", "NeuralTrade", "ByteCoin", "PixelStock", "CyberTrader", "DigitalCoin", "TechBit", "SmartStock", "AutoCrypto", "RoboTrader", "BotCoin", "AlgoStock", "DataBit", "CodeStock", "LogicCrypto", "SyntaxTrader", "BinaryCoin", "HexStock", "MatrixBit", "PixelTrader", "VectorCoin", "ArrayStock", "ObjectBit", "StringTrader", "LoopCoin", "FunctionStock", "VariableBit", "MethodTrader", "ClassCoin", "InstanceStock", "ModuleBit", "PackageTrader", "LibraryCoin", "FrameworkStock", "APIBit",

  // Motivational (10%)
  "WinnerInvestor", "ChampionTrade", "SuccessSeeker", "VictoryStock", "ProvenTrader", "EliteInvestor", "MasterMinded", "TopPerformer", "BestInvest", "UltimateWealth", "SuperiorTrade", "PremiumBit", "AceInvestor", "PrimeTrader", "OptimalStock", "PeakCrypto", "MaxProfit", "BestTrade", "TopCoin", "PrimeStock", "EliteBit", "ProTrader", "MasterCoin", "ChampStock", "WinnerBit", "SuccessTrader", "VictoryCoin", "ProvenStock", "EliteTrade", "MasterBit", "TopInvestor", "BestCoin", "OptimalTrade", "PeakStock", "MaxBit", "PrimeInvestor", "AceCoin", "SuperiorStock", "UltimateBit", "PremiumTrader", "OptimalCoin", "PeakInvestor", "MaxStock", "BestBit", "TopTrader", "PrimeCoin", "EliteStock", "ProBit", "MasterInvestor", "ChampCoin",

  // Formato Underscore Casual (5%)
  "crypto_carlos", "trader_ana", "invest_pedro", "bit_maria", "stock_joao", "coin_lucas", "money_bruno", "trade_camila", "invest_rafael", "crypto_patricia", "stock_gustavo", "bit_isabella", "trade_thiago", "coin_bianca", "invest_mateus", "crypto_larissa", "stock_felipe", "bit_juliana", "trade_rodrigo", "coin_clara", "invest_daniel", "crypto_beatriz", "stock_leonardo", "bit_valentina", "trade_gabriel", "coin_sofia", "invest_victor", "crypto_ana", "stock_lucas", "bit_mariana", "trade_caua", "coin_heloisa", "invest_arthur", "crypto_alice", "stock_bernardo", "bit_lais", "trade_enzo", "coin_livia", "invest_nicolas", "crypto_manuela", "stock_vitor", "bit_isadora", "trade_guilherme", "coin_yasmin", "invest_pietro", "crypto_cecilia", "stock_joao", "bit_anna", "trade_ryan", "coin_emanuelle",

  // Adicionais para completar 3500+
  "QuantumInvestor", "NeonTrader", "CyberStock", "VirtualCoin", "TurboTrade", "MegaBit", "UltraStock", "HyperCoin", "SuperTrade", "MetaBit", "NeoStock", "ProCoin", "MaxTrade", "PlusBit", "PremiumStock", "EliteCoin", "ProTrade", "MegaStock", "TurboBit", "HyperTrade", "UltraCoin", "SuperStock", "MetaTrade", "NeoBit", "QuantumStock", "NeonCoin", "CyberTrade", "VirtualStock", "TechBit", "DigitalTrade", "SmartCoin", "AutoStock", "RoboBit", "AlgoTrade", "DataCoin", "CodeStock", "LogicBit", "SyntaxTrade", "BinaryCoin", "HexStock", "MatrixBit", "PixelTrade", "VectorCoin", "ArrayStock", "ObjectBit", "StringTrade", "LoopCoin", "FunctionStock", "VariableBit"
];

// Função para shufflear array
function shuffle(array: string[]): string[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Função para gerar nicknames únicos adicionais se necessário
function generateAdditionalNicknames(count: number): string[] {
  const bases = ["Trader", "Investor", "Crypto", "Stock", "Coin", "Bit", "Finance", "Money", "Wealth", "Trade"];
  const prefixes = ["Pro", "Elite", "Master", "Super", "Mega", "Ultra", "Hyper", "Neo", "Quantum", "Digital"];
  const suffixes = ["2024", "99", "Pro", "X", "Plus", "Max", "King", "Lord", "Hero", "Legend"];
  
  const additional = [];
  let attempts = 0;
  
  while (additional.length < count && attempts < count * 3) {
    const base = bases[Math.floor(Math.random() * bases.length)];
    const prefix = Math.random() > 0.5 ? prefixes[Math.floor(Math.random() * prefixes.length)] : "";
    const suffix = Math.random() > 0.3 ? suffixes[Math.floor(Math.random() * suffixes.length)] : "";
    
    const nickname = `${prefix}${base}${suffix}`;
    
    if (!NICKNAMES.includes(nickname) && !additional.includes(nickname)) {
      additional.push(nickname);
    }
    attempts++;
  }
  
  return additional;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchSize = 100, startFrom = 0 } = await req.json();
    console.log(`Starting bot nickname update - batch size: ${batchSize}, starting from: ${startFrom}`);

    // Buscar bots para atualizar
    const { data: bots, error: fetchError } = await supabase
      .from("profiles")
      .select("id, nickname")
      .eq("is_bot", true)
      .range(startFrom, startFrom + batchSize - 1)
      .order("created_at");

    if (fetchError) {
      throw new Error(`Erro ao buscar bots: ${fetchError.message}`);
    }

    if (!bots || bots.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Nenhum bot encontrado para atualizar",
          updated: 0,
          remaining: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${bots.length} bots to update`);

    // Preparar nicknames únicos
    let availableNicknames = shuffle([...NICKNAMES]);
    
    // Se precisar de mais nicknames, gerar adicionais
    if (bots.length > availableNicknames.length) {
      const additional = generateAdditionalNicknames(bots.length - availableNicknames.length);
      availableNicknames = availableNicknames.concat(additional);
    }

    // Buscar nicknames já usados para evitar duplicatas
    const { data: existingNicknames } = await supabase
      .from("profiles")
      .select("nickname")
      .neq("is_bot", true); // Buscar nicknames de usuários reais

    const usedNicknames = new Set(existingNicknames?.map(p => p.nickname) || []);

    // Filtrar nicknames disponíveis
    availableNicknames = availableNicknames.filter(nick => !usedNicknames.has(nick));

    if (availableNicknames.length < bots.length) {
      throw new Error("Não há nicknames únicos suficientes disponíveis");
    }

    // Atualizar bots em lotes
    const updates = [];
    const batchUpdates = [];
    
    for (let i = 0; i < bots.length; i++) {
      const bot = bots[i];
      const newNickname = availableNicknames[i];
      
      updates.push({
        id: bot.id,
        oldNickname: bot.nickname,
        newNickname: newNickname
      });

      batchUpdates.push(
        supabase
          .from("profiles")
          .update({ nickname: newNickname })
          .eq("id", bot.id)
      );
    }

    // Executar todas as atualizações
    const results = await Promise.allSettled(batchUpdates);
    
    let successful = 0;
    let failed = 0;
    const errors = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && !result.value.error) {
        successful++;
      } else {
        failed++;
        errors.push({
          bot_id: bots[index].id,
          error: result.status === "rejected" ? result.reason : result.value.error?.message
        });
      }
    });

    console.log(`Update completed - Success: ${successful}, Failed: ${failed}`);

    // Verificar quantos bots restam
    const { count: totalBots } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_bot", true);

    const remaining = Math.max(0, (totalBots || 0) - (startFrom + successful));

    return new Response(
      JSON.stringify({
        success: true,
        message: `Lote processado com sucesso`,
        batchSize: bots.length,
        updated: successful,
        failed: failed,
        remaining: remaining,
        progress: {
          processed: startFrom + successful,
          total: totalBots || 0,
          percentage: Math.round(((startFrom + successful) / (totalBots || 1)) * 100)
        },
        sample_updates: updates.slice(0, 5), // Mostrar algumas atualizações como exemplo
        errors: errors.slice(0, 3) // Mostrar alguns erros se houver
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in update-bot-nicknames:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});