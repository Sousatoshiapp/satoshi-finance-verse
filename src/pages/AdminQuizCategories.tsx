import { useState, useEffect } from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Badge } from "@/components/shared/ui/badge";
import { Textarea } from "@/components/shared/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shared/ui/dialog";
import { FolderOpen, Plus, Edit, Trash2, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

interface Category {
  id: string;
  name: string;
  description: string;
  questionsCount: number;
  color: string;
  isActive: boolean;
}

export default function AdminQuizCategories() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    isActive: true
  });
  const { toast } = useToast();

  // Mock data para demonstração
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Simulando dados de categorias
      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'Economia',
          description: 'Conceitos fundamentais de economia e macroeconomia',
          questionsCount: 45,
          color: '#10B981',
          isActive: true
        },
        {
          id: '2',
          name: 'Investimentos',
          description: 'Tipos de investimentos, renda fixa e variável',
          questionsCount: 38,
          color: '#3B82F6',
          isActive: true
        },
        {
          id: '3',
          name: 'Criptomoedas',
          description: 'Blockchain, Bitcoin, altcoins e DeFi',
          questionsCount: 29,
          color: '#F59E0B',
          isActive: true
        },
        {
          id: '4',
          name: 'Finanças Pessoais',
          description: 'Planejamento financeiro e educação financeira',
          questionsCount: 52,
          color: '#8B5CF6',
          isActive: true
        },
        {
          id: '5',
          name: 'Mercado de Ações',
          description: 'Bolsa de valores, análises técnica e fundamentalista',
          questionsCount: 33,
          color: '#EF4444',
          isActive: true
        },
        {
          id: '6',
          name: 'Bancos e Cartões',
          description: 'Sistema bancário, cartões de crédito e débito',
          questionsCount: 21,
          color: '#06B6D4',
          isActive: false
        }
      ];
      
      setCategories(mockCategories);
    } catch (error: any) {
      toast({
        title: t('errors.error') + " ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const categoryData = {
        ...newCategory,
        id: editingCategory?.id || Date.now().toString(),
        questionsCount: editingCategory?.questionsCount || 0
      };

      if (editingCategory) {
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? categoryData as Category : c));
        toast({
          title: "Categoria atualizada!",
          description: "A categoria foi atualizada com sucesso",
        });
      } else {
        setCategories(prev => [...prev, categoryData as Category]);
        toast({
          title: "Categoria criada!",
          description: "Nova categoria foi adicionada",
        });
      }

      resetForm();
    } catch (error: any) {
      toast({
        title: t('errors.error') + " ao salvar categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Categoria removida!",
        description: "A categoria foi removida com sucesso",
      });
    } catch (error: any) {
      toast({
        title: t('errors.error') + " ao remover categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleCategoryStatus = async (id: string) => {
    try {
      setCategories(prev => prev.map(c => 
        c.id === id ? { ...c, isActive: !c.isActive } : c
      ));
      toast({
        title: "Status atualizado!",
        description: "O status da categoria foi alterado",
      });
    } catch (error: any) {
      toast({
        title: t('errors.error') + " ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewCategory({
      name: "",
      description: "",
      color: "#3B82F6",
      isActive: true
    });
    setEditingCategory(null);
  };

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    inactive: categories.filter(c => !c.isActive).length,
    totalQuestions: categories.reduce((sum, c) => sum + c.questionsCount, 0)
  };

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
  ];

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Categorias de Quiz</h1>
                  <p className="text-muted-foreground">Gerencie as categorias do sistema de quizzes</p>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input
                          value={newCategory.name}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Economia, Investimentos..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Descrição</label>
                        <Textarea
                          value={newCategory.description}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o conteúdo desta categoria..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cor</label>
                        <div className="flex gap-2">
                          {colors.map(color => (
                            <button
                              key={color}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 ${
                                newCategory.color === color ? 'border-gray-400' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={newCategory.isActive}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <label htmlFor="isActive" className="text-sm font-medium">
                          Categoria ativa
                        </label>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={resetForm}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveCategory}>
                          {editingCategory ? 'Atualizar' : 'Criar'} Categoria
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <FolderOpen className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-500 font-bold">✓</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ativas</p>
                        <p className="text-2xl font-bold">{stats.active}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-bold">—</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Inativas</p>
                        <p className="text-2xl font-bold">{stats.inactive}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <HelpCircle className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Questões</p>
                        <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-8">{t('common.loading')}...</div>
                ) : (
                  categories.map((category) => (
                    <Card key={category.id} className={`relative ${!category.isActive ? 'opacity-60' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {category.questionsCount} questões
                          </span>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCategory(category);
                                setNewCategory({
                                  name: category.name,
                                  description: category.description,
                                  color: category.color,
                                  isActive: category.isActive
                                });
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCategoryStatus(category.id)}
                            >
                              {category.isActive ? '◐' : '○'}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Category Usage Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories
                      .filter(c => c.isActive)
                      .sort((a, b) => b.questionsCount - a.questionsCount)
                      .map((category) => (
                        <div key={category.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(category.questionsCount / Math.max(...categories.map(c => c.questionsCount))) * 100}%`,
                                  backgroundColor: category.color
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium min-w-[60px] text-right">
                              {category.questionsCount} questões
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthProtection>
  );
}
