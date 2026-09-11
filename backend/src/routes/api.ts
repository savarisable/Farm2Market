import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';

// Controllers
import * as authCtrl from '../controllers/authController';
import * as cropCtrl from '../controllers/cropController';
import * as marketCtrl from '../controllers/marketController';
import * as intelCtrl from '../controllers/intelligenceController';
import * as buyerCtrl from '../controllers/buyerController';
import * as offerCtrl from '../controllers/offerController';
import * as orderCtrl from '../controllers/orderController';
import * as logisticsCtrl from '../controllers/logisticsController';
import * as fpoCtrl from '../controllers/fpoController';
import * as consumerCtrl from '../controllers/consumerController';
import * as adminCtrl from '../controllers/adminController';
import * as notifCtrl from '../controllers/notificationController';
import * as chatCtrl from '../controllers/chatController';
import * as cropRecCtrl from '../controllers/cropRecommendationController';

const router = Router();

// 1. Auth Routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.post('/auth/demo-login', authCtrl.quickDemoLogin);
router.get('/auth/profile', authMiddleware, authCtrl.getProfile);
router.put('/auth/profile', authMiddleware, authCtrl.updateProfile);


// 2. Crop Routes
router.get('/crops', authMiddleware, cropCtrl.getMyCrops);
router.get('/crops/my', authMiddleware, cropCtrl.getMyCrops);
router.get('/crops/plans', authMiddleware, cropRecCtrl.getMyCropPlans);
router.post('/crops/plan', authMiddleware, cropRecCtrl.saveCropPlan);
router.post('/crops/assess-quality', cropCtrl.assessCropQuality);
router.post('/crops/attach-inspection', authMiddleware, cropCtrl.attachQualityInspection);
router.get('/crops/:id', cropCtrl.getCropById);
router.post('/crops', authMiddleware, cropCtrl.addCrop);
router.put('/crops/:id', authMiddleware, cropCtrl.updateCrop);
router.delete('/crops/:id', authMiddleware, cropCtrl.deleteCrop);
router.get('/passport/:code', cropCtrl.getPassportByCode);

// 3. Markets & Spot Prices
router.get('/markets', marketCtrl.getMarkets);
router.get('/regions', marketCtrl.getRegions);
router.get('/markets/prices', marketCtrl.getMarketPrices);

// 4. Intelligence & Forecasting Engines
router.get('/forecast/price', intelCtrl.getPriceForecast);
router.get('/forecast/demand', intelCtrl.getDemandForecast);
router.get('/recommendations/best-market', intelCtrl.getBestMarket);
router.get('/recommendations/best-buyer', intelCtrl.getBestBuyers);
router.post('/recommendations/fair-price', intelCtrl.evaluateFairPriceEndpoint);
router.post('/recommendations/negotiation', intelCtrl.getNegotiationAdvice);
router.post('/recommendations/crop-planning', intelCtrl.planCropsEndpoint);
router.get('/locations/hierarchy', cropRecCtrl.getLocationsHierarchy);
router.get('/soil/profiles', cropRecCtrl.getSoilProfiles);
router.post('/crop-recommendations/analyze', cropRecCtrl.analyzeCropSuitability);
router.get('/agri-services/nearby', cropRecCtrl.getNearbyAgriPlaces);
router.post('/crop-recommendations/explain', cropRecCtrl.explainRecommendationWithSaarthi);
router.get('/intelligence/wow-moment', intelCtrl.getWowMomentCockpit);


// 5. Buyers & Reverse Marketplace
router.post('/buyers/requirements', authMiddleware, buyerCtrl.postRequirement);
router.get('/buyers/requirements', buyerCtrl.getRequirements);
router.get('/buyers/bulk-marketplace', buyerCtrl.getBulkMarketplace);

// 6. Offers & Negotiations
router.post('/offers', authMiddleware, offerCtrl.createOffer);
router.get('/offers', authMiddleware, offerCtrl.getOffers);
router.get('/offers/:id', authMiddleware, offerCtrl.getOfferById);
router.post('/offers/:id/counter', authMiddleware, offerCtrl.submitCounterOffer);
router.post('/offers/:id/accept', authMiddleware, offerCtrl.acceptOffer);

// 7. Orders & Lifecycle
router.get('/orders', authMiddleware, orderCtrl.getOrders);
router.get('/orders/:id', authMiddleware, orderCtrl.getOrderById);
router.put('/orders/:id/status', authMiddleware, orderCtrl.updateOrderStatus);

// 8. Logistics & Shipments
router.get('/logistics', logisticsCtrl.getLogisticsOverview);
router.put('/logistics/shipments/:id', logisticsCtrl.updateShipmentProgress);

// 9. FPO Aggregation
router.get('/fpo/dashboard', fpoCtrl.getFPODashboard);
router.post('/fpo/create-bulk-shipment', authMiddleware, fpoCtrl.createBulkShipment);

// 10. Consumer Marketplace & Price Transparency
router.get('/consumer/products', consumerCtrl.getConsumerProducts);
router.post('/consumer/checkout', authMiddleware, consumerCtrl.consumerCheckout);
router.get('/consumer/transparency', consumerCtrl.getPriceTransparency);

// 11. Admin & Government (DoCA) Intelligence
router.get('/admin/overview', adminCtrl.getAdminOverview);
router.get('/admin/export/transactions', adminCtrl.exportTransactionsCsv);
router.get('/admin/export/earnings', adminCtrl.exportFarmerEarningsCsv);

// 12. Notifications
router.get('/notifications', authMiddleware, notifCtrl.getNotifications);
router.put('/notifications/:id/read', authMiddleware, notifCtrl.markAsRead);
router.put('/notifications/mark-all-read', authMiddleware, notifCtrl.markAllAsRead);
router.delete('/notifications/:id', authMiddleware, notifCtrl.deleteNotification);

// 13. Multilingual Fair Price AI Chatbot & Directory
router.post('/chat/message', chatCtrl.handleChatMessage);
router.get('/directory', chatCtrl.getDirectoryData);

export default router;
