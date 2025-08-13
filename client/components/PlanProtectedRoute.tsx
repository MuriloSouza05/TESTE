import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Lock, ArrowRight } from 'lucide-react';

interface PlanProtectedRouteProps {
  children: React.ReactNode;
  requiredPlan: string[];
  fallbackPath?: string;
}

const planHierarchy = {
  'SIMPLE': 1,
  'COMPOSITE': 2,
  'MANAGERIAL': 3
};

const planNames = {
  'SIMPLE': 'Simples',
  'COMPOSITE': 'Composto',
  'MANAGERIAL': 'Gerencial'
};

const planFeatures = {
  'SIMPLE': ['CRM', 'Projetos', 'Tarefas', 'Cobrança', 'Configurações básicas'],
  'COMPOSITE': ['Tudo do Simples', 'Dashboard', 'Fluxo de Caixa', 'Relatórios'],
  'MANAGERIAL': ['Tudo do Composto', 'Gestão de Usuários', 'Configurações avançadas', 'Auditoria completa']
};

export function PlanProtectedRoute({ children, requiredPlan, fallbackPath = '/crm' }: PlanProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userPlanLevel = planHierarchy[user.tenant.planType as keyof typeof planHierarchy] || 0;
  const requiredLevel = Math.min(...requiredPlan.map(plan => planHierarchy[plan as keyof typeof planHierarchy] || 999));

  const hasAccess = userPlanLevel >= requiredLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Determinar qual plano seria necessário
  const suggestedPlan = requiredPlan.find(plan => planHierarchy[plan as keyof typeof planHierarchy] > userPlanLevel) || 'COMPOSITE';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acesso Restrito
          </CardTitle>
          <CardDescription className="text-lg">
            Esta funcionalidade não está disponível no seu plano atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Seu plano atual: {planNames[user.tenant.planType as keyof typeof planNames]}
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {planFeatures[user.tenant.planType as keyof typeof planFeatures]?.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              Upgrade para o plano {planNames[suggestedPlan as keyof typeof planNames]} e tenha acesso a:
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              {planFeatures[suggestedPlan as keyof typeof planFeatures]?.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => window.location.href = fallbackPath}
              variant="outline" 
              className="flex-1"
            >
              Voltar ao CRM
            </Button>
            <Button 
              onClick={() => {
                // Aqui você pode implementar a lógica de upgrade
                alert('Funcionalidade de upgrade será implementada em breve!');
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Fazer Upgrade
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Precisa de ajuda? Entre em contato com nosso suporte
            </p>
            <Button variant="link" className="text-sm">
              Falar com Suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlanProtectedRoute;