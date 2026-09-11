import {
  User,
  CropBatch,
  WowMomentCockpit,
  BestMarketResult,
  PriceForecastResult,
  DemandForecastResult,
  BuyerMatchItem,
  Order,
  NotificationItem,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('farm2market_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// 1. Auth API
export async function loginApi(email: string, password: string):Promise<any> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function demoLoginApi(role: string): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  return res.json();
}

export async function registerApi(userData: any): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function getProfileApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateProfileApi(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Crop Recommendation & Suitability APIs
export async function getLocationsHierarchyApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/locations/hierarchy`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getSoilProfilesApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/soil/profiles`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function analyzeCropSuitabilityApi(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/crop-recommendations/analyze`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getNearbyAgriPlacesApi(district: string = 'Nashik', type: string = 'ALL'): Promise<any> {
  const res = await fetch(`${API_BASE}/agri-services/nearby?district=${encodeURIComponent(district)}&type=${type}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function explainRecommendationWithSaarthiApi(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/crop-recommendations/explain`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}


// 2. Intelligence & Section 70 WOW Cockpit API
export async function getWowCockpitApi(): Promise<{ success: boolean; wowCockpit: WowMomentCockpit }> {
  const res = await fetch(`${API_BASE}/intelligence/wow-moment`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getPriceForecastApi(crop: string, location: string, horizon: number = 3): Promise<PriceForecastResult> {
  const res = await fetch(`${API_BASE}/forecast/price?crop=${crop}&location=${location}&horizon=${horizon}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getDemandForecastApi(crop: string, region: string): Promise<DemandForecastResult> {
  const res = await fetch(`${API_BASE}/forecast/demand?crop=${crop}&region=${region}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getBestMarketApi(origin: string, crop: string, qty: number, grade: string = 'GRADE_A'): Promise<BestMarketResult> {
  const res = await fetch(`${API_BASE}/recommendations/best-market?origin=${origin}&crop=${crop}&quantity=${qty}&grade=${grade}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getBestBuyersApi(origin: string, crop: string, qty: number, grade: string, expectedPrice?: number): Promise<{ success: boolean; matches: BuyerMatchItem[] }> {
  const priceQuery = expectedPrice ? `&expectedPrice=${expectedPrice}` : '';
  const res = await fetch(`${API_BASE}/recommendations/best-buyer?origin=${origin}&crop=${crop}&quantity=${qty}&grade=${grade}${priceQuery}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function evaluateFairPriceApi(payload: { cropName: string; offeredPrice: number; quantityKg: number; grade: string; region: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/recommendations/fair-price`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getNegotiationAdviceApi(payload: { offerId: string; cropName: string; offeredPrice: number; quantityKg: number; grade: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/recommendations/negotiation`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function planCropsApi(payload: { region: string; farmSizeAcres: number; season: string; waterAvailability: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/recommendations/crop-planning`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

// 3. Crops API
export async function getMyCropsApi(): Promise<{ success: boolean; crops: CropBatch[] }> {
  const res = await fetch(`${API_BASE}/crops`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getCropByIdApi(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/crops/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function addCropApi(cropData: any): Promise<any> {
  const res = await fetch(`${API_BASE}/crops`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cropData),
  });
  return res.json();
}

export async function updateCropApi(id: string, cropData: any): Promise<any> {
  const res = await fetch(`${API_BASE}/crops/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(cropData),
  });
  return res.json();
}

export async function deleteCropApi(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/crops/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function assessQualityApi(payload: {
  cropName: string;
  location?: string;
  quantityKg?: number;
  gradeSelection?: string;
  base64Image?: string;
  images?: string[];
  imageUri?: string;
  language?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/crops/assess-quality`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function attachInspectionApi(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/crops/attach-inspection`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function saveCropPlanApi(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/crops/plan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getMyCropPlansApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/crops/plans`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getPassportApi(code: string): Promise<any> {
  const res = await fetch(`${API_BASE}/passport/${code}`);
  return res.json();
}

// 4. Buyers & Reverse Marketplace API
export async function postRequirementApi(reqData: any): Promise<any> {
  const res = await fetch(`${API_BASE}/buyers/requirements`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reqData),
  });
  return res.json();
}

export async function getRequirementsApi(params?: { crop?: string; isBulk?: boolean }): Promise<any> {
  const q = new URLSearchParams();
  if (params?.crop) q.append('crop', params.crop);
  if (params?.isBulk !== undefined) q.append('isBulk', String(params.isBulk));
  const res = await fetch(`${API_BASE}/buyers/requirements?${q.toString()}`);
  return res.json();
}

export async function getBulkMarketplaceApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/buyers/bulk-marketplace`);
  return res.json();
}

// 5. Offers & Negotiations API
export async function getOffersApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/offers`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getOfferByIdApi(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/offers/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createOfferApi(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/offers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function submitCounterOfferApi(id: string, counterPricePerKg: number, rationale?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/offers/${id}/counter`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ counterPricePerKg, rationale }),
  });
  return res.json();
}

export async function acceptOfferApi(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/offers/${id}/accept`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json();
}

// 6. Orders & Lifecycle API
export async function getOrdersApi(): Promise<{ success: boolean; orders: Order[] }> {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getOrderByIdApi(id: string): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateOrderStatusApi(id: string, status: string, shipmentStage?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, shipmentStage }),
  });
  return res.json();
}

// 7. Logistics API
export async function getLogisticsOverviewApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/logistics`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateShipmentProgressApi(id: string, stage: string, progressPercent?: number): Promise<any> {
  const res = await fetch(`${API_BASE}/logistics/shipments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ stage, progressPercent }),
  });
  return res.json();
}

// 8. FPO Aggregation API
export async function getFPODashboardApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/fpo/dashboard`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createBulkShipmentApi(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/fpo/create-bulk-shipment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

// 9. Consumer Marketplace API
export async function getConsumerProductsApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/consumer/products`);
  return res.json();
}

export async function consumerCheckoutApi(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/consumer/checkout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getPriceTransparencyApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/consumer/transparency`);
  return res.json();
}

// 10. Admin Intelligence API
export async function getAdminOverviewApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/overview`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export function downloadTransactionsCsvUrl(): string {
  return `${API_BASE}/admin/export/transactions`;
}

export function downloadFarmerEarningsCsvUrl(): string {
  return `${API_BASE}/admin/export/earnings`;
}

// 11. Notifications API
export async function getNotificationsApi(): Promise<{ success: boolean; notifications: NotificationItem[]; unreadCount: number }> {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function markNotificationReadApi(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function markAllNotificationsReadApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  return res.json();
}

// 12. Multilingual Chatbot & Maharashtra Directory API
export async function sendChatMessageApi(message: string, language: 'en' | 'hi' | 'mr'): Promise<any> {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, language }),
  });
  return res.json();
}

export async function getDirectoryApi(): Promise<any> {
  const res = await fetch(`${API_BASE}/directory`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}
