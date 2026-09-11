import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import CropPassportVerifyPage from './pages/passport/CropPassportVerifyPage';

// Farmer Pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { MyCropsPage } from './pages/farmer/MyCropsPage';
import { MarketIntelligencePage } from './pages/farmer/MarketIntelligencePage';
import { BestMarketPage } from './pages/farmer/BestMarketPage';
import { FindBuyersPage } from './pages/farmer/FindBuyersPage';
import { NegotiationPage } from './pages/farmer/NegotiationPage';
import { CropPlanningPage } from './pages/farmer/CropPlanningPage';
import { QualityAssessmentPage } from './pages/farmer/QualityAssessmentPage';
import { FarmerEarningsPage } from './pages/farmer/FarmerEarningsPage';

// Buyer Pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { PostRequirementPage } from './pages/buyer/PostRequirementPage';
import { FarmerMarketplacePage } from './pages/buyer/FarmerMarketplacePage';
import { BulkBuyerMarketplacePage } from './pages/buyer/BulkBuyerMarketplacePage';

// FPO Pages
import { FPODashboard } from './pages/fpo/FPODashboard';
import { FPOAggregationPage } from './pages/fpo/FPOAggregationPage';

// Logistics Pages
import { SmartLogisticsPage } from './pages/logistics/SmartLogisticsPage';

// Orders Pages
import { OrdersPage } from './pages/orders/OrdersPage';
import { OrderDetailPage } from './pages/orders/OrderDetailPage';

// Consumer Pages
import { ConsumerMarketplacePage } from './pages/consumer/ConsumerMarketplacePage';
import PriceTransparencyPage from './pages/consumer/PriceTransparencyPage';

// Admin / DoCA Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import RegionalIntelligencePage from './pages/admin/RegionalIntelligencePage';
import ImpactDashboardPage from './pages/admin/ImpactDashboardPage';

// Notifications & AI
import NotificationsPage from './pages/notifications/NotificationsPage';
import AiAdvisorPage from './pages/ai/AiAdvisorPage';
import { LanguageProvider } from './context/LanguageContext';

function RoleBasedHomeRedirect() {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (role === 'BUYER') return <Navigate to="/buyer" replace />;
  if (role === 'FPO') return <Navigate to="/fpo" replace />;
  if (role === 'CONSUMER') return <Navigate to="/consumer" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-passport/:code" element={<CropPassportVerifyPage />} />

          {/* Core Authenticated App with Persistent Shell */}
          <Route element={<AppLayout />}>
            <Route path="/home" element={<RoleBasedHomeRedirect />} />

            {/* Farmer Routes */}
            <Route path="/dashboard" element={<FarmerDashboard />} />
            <Route path="/my-crops" element={<MyCropsPage />} />
            <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
            <Route path="/best-market" element={<BestMarketPage />} />
            <Route path="/find-buyers" element={<FindBuyersPage />} />
            <Route path="/negotiations" element={<NegotiationPage />} />
            <Route path="/crop-planning" element={<CropPlanningPage />} />
            <Route path="/quality-assessment" element={<QualityAssessmentPage />} />
            <Route path="/earnings" element={<FarmerEarningsPage />} />

            {/* Buyer Routes */}
            <Route path="/buyer" element={<BuyerDashboard />} />
            <Route path="/post-requirement" element={<PostRequirementPage />} />
            <Route path="/farmer-marketplace" element={<FarmerMarketplacePage />} />
            <Route path="/bulk-marketplace" element={<BulkBuyerMarketplacePage />} />

            {/* FPO Routes */}
            <Route path="/fpo" element={<FPODashboard />} />
            <Route path="/fpo-aggregation" element={<FPOAggregationPage />} />

            {/* Logistics & Direct Transit Routes */}
            <Route path="/logistics" element={<SmartLogisticsPage />} />

            {/* Orders Lifecycle */}
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />

            {/* Consumer Marketplace & Radical Price Transparency */}
            <Route path="/consumer" element={<ConsumerMarketplacePage />} />
            <Route path="/consumer-market" element={<ConsumerMarketplacePage />} />
            <Route path="/transparency" element={<PriceTransparencyPage />} />
            <Route path="/price-transparency" element={<PriceTransparencyPage />} />

            {/* Admin & DoCA Governance */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/regional" element={<RegionalIntelligencePage />} />
            <Route path="/regional-intelligence" element={<RegionalIntelligencePage />} />
            <Route path="/admin/impact" element={<ImpactDashboardPage />} />
            <Route path="/impact-dashboard" element={<ImpactDashboardPage />} />

            {/* Common Crop Passport Verification inside shell */}
            <Route path="/passport/:code" element={<CropPassportVerifyPage />} />

            {/* Notifications Feed */}
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Multilingual Fair Price AI Advisor */}
            <Route path="/ai-assistant" element={<AiAdvisorPage />} />
            <Route path="/chatbot" element={<AiAdvisorPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
