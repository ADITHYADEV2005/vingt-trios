const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vt_token') : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API error ${res.status}`);
  }
  return res.json();
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const registerUser      = (d: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(d) });
export const loginUser         = (d: any) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(d) });
export const getProfile        = ()       => apiFetch('/auth/profile');
export const saveMeasurements  = (d: any) => apiFetch('/auth/measurements', { method: 'POST', body: JSON.stringify(d) });
export const getSavedDesigns   = ()       => apiFetch('/auth/saved-designs');
export const saveDesign        = (d: any) => apiFetch('/auth/saved-designs', { method: 'POST', body: JSON.stringify(d) });
export const request2FA        = ()       => apiFetch('/auth/2fa/request', { method: 'POST' });
export const verify2FA         = (d: { otp: string }) => apiFetch('/auth/2fa/verify', { method: 'POST', body: JSON.stringify(d) });

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const getFabrics  = (cat?: string) => apiFetch(`/products/fabrics${cat ? `?category=${cat}` : ''}`);
export const getGarments = (cat?: string) => apiFetch(`/products/garments${cat ? `?category=${cat}` : ''}`);
export const getTailors  = ()             => apiFetch('/products/tailors');

// ─── ORDERS (CUSTOMER / TAILOR / DESIGNER) ──────────────────────────────────
export const createPayment      = (d: any) => apiFetch('/orders/create-payment',  { method: 'POST', body: JSON.stringify(d) });
export const verifyPayment      = (d: any) => apiFetch('/orders/verify-payment',  { method: 'POST', body: JSON.stringify(d) });
export const getCustomerOrders  = ()       => apiFetch('/orders/customer');
export const getOrderById       = (id: string) => apiFetch(`/orders/detail/${id}`);
export const getTailorQueue     = ()       => apiFetch('/orders/tailor/queue');
export const updateOrderStatus  = (d: any) => apiFetch('/orders/tailor/status',   { method: 'POST', body: JSON.stringify(d) });
export const getDesignerQueue   = ()       => apiFetch('/orders/designer/queue');
export const submitProposal     = (d: any) => apiFetch('/orders/designer/proposal', { method: 'POST', body: JSON.stringify(d) });
export const respondToProposal  = (id: string, d: any) => apiFetch(`/orders/proposal/${id}/respond`, { method: 'POST', body: JSON.stringify(d) });
export const getAdminOrders     = ()       => apiFetch('/orders/admin/list');
export const adminUpdateOrder   = (d: any) => apiFetch('/orders/admin/update', { method: 'POST', body: JSON.stringify(d) });

// ─── ADMIN KPI & DASHBOARD ───────────────────────────────────────────────────
export const getAdminKpi        = () => apiFetch('/admin/kpi');
export const getAdminActivity   = (take = 20) => apiFetch(`/admin/activity?take=${take}`);
export const getAdminAccounts   = () => apiFetch('/admin/accounts');
export const updateAdminRole    = (id: string, adminRole: string) => apiFetch(`/admin/accounts/${id}/admin-role`, { method: 'PATCH', body: JSON.stringify({ adminRole }) });
export const getNotifications   = () => apiFetch('/admin/notifications');
export const markNotificationRead = (id: string) => apiFetch(`/admin/notifications/${id}/read`, { method: 'PATCH' });

// ─── ADMIN USER MANAGEMENT ───────────────────────────────────────────────────
export const getAdminUsers      = (params?: { skip?: number; take?: number; search?: string; role?: string }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/admin/users${q ? `?${q}` : ''}`);
};
export const getAdminUserDetail = (id: string) => apiFetch(`/admin/users/${id}`);
export const suspendUser        = (id: string, suspended: boolean) => apiFetch(`/admin/users/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ suspended }) });
export const banUser            = (id: string, banned: boolean) => apiFetch(`/admin/users/${id}/ban`, { method: 'PATCH', body: JSON.stringify({ banned }) });
export const adminUpdateUserRole= (d: { userId: string; role: string }) => apiFetch(`/admin/users/${d.userId}/role`, { method: 'PATCH', body: JSON.stringify({ role: d.role }) });

// ─── ADMIN TAILORS ───────────────────────────────────────────────────────────
export const getTailorQueueAdminp = (params?: { status?: string; skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/tailors-admin/queue${q ? `?${q}` : ''}`);
};
export const getTailorsAdmin     = (params?: { search?: string; skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/tailors-admin${q ? `?${q}` : ''}`);
};
export const getTailorProfileAdmin = (id: string) => apiFetch(`/tailors-admin/${id}`);
export const approveTailor       = (id: string, approved: boolean, reason?: string) => apiFetch(`/tailors-admin/${id}/approve`, { method: 'POST', body: JSON.stringify({ approved, reason }) });
export const updateCommission    = (id: string, rate: number) => apiFetch(`/tailors-admin/${id}/commission`, { method: 'PATCH', body: JSON.stringify({ rate }) });
export const suspendTailorAdmin  = (id: string, suspended: boolean) => apiFetch(`/tailors-admin/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ suspended }) });
export const triggerTailorPayout = (id: string, amount: number, notes?: string) => apiFetch(`/tailors-admin/${id}/payout`, { method: 'POST', body: JSON.stringify({ amount, notes }) });
export const getTailorPayouts    = (id: string) => apiFetch(`/tailors-admin/${id}/payouts`);

// ─── ADMIN DESIGNERS ─────────────────────────────────────────────────────────
export const getDesignerQueueAdmin = (params?: { status?: string; skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/designers-admin/queue${q ? `?${q}` : ''}`);
};
export const getDesignersAdmin   = (params?: { search?: string; skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/designers-admin${q ? `?${q}` : ''}`);
};
export const getDesignerProfileAdmin = (id: string) => apiFetch(`/designers-admin/${id}`);
export const approveDesigner     = (id: string, approved: boolean) => apiFetch(`/designers-admin/${id}/approve`, { method: 'POST', body: JSON.stringify({ approved }) });
export const updateDesignerRoyalty = (id: string, rate: number) => apiFetch(`/designers-admin/${id}/royalty`, { method: 'PATCH', body: JSON.stringify({ rate }) });
export const suspendDesignerAdmin = (id: string, suspended: boolean) => apiFetch(`/designers-admin/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ suspended }) });
export const getDesignUsageStats = () => apiFetch('/designers-admin/usage-stats');

// ─── ADMIN CATALOG ───────────────────────────────────────────────────────────
export const getFabricsAdmin    = (params?: { search?: string; category?: string; skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/catalog/fabrics${q ? `?${q}` : ''}`);
};
export const createFabric       = (d: any) => apiFetch('/catalog/fabrics', { method: 'POST', body: JSON.stringify(d) });
export const updateFabric       = (id: string, d: any) => apiFetch(`/catalog/fabrics/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteFabric       = (id: string) => apiFetch(`/catalog/fabrics/${id}`, { method: 'DELETE' });
export const getLowStockFabrics = () => apiFetch('/catalog/fabrics/low-stock');

export const getStylesAdmin     = (params?: { type?: string; category?: string; skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/catalog/styles${q ? `?${q}` : ''}`);
};
export const createStyle        = (d: any) => apiFetch('/catalog/styles', { method: 'POST', body: JSON.stringify(d) });
export const updateStyle        = (id: string, d: any) => apiFetch(`/catalog/styles/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteStyle        = (id: string) => apiFetch(`/catalog/styles/${id}`, { method: 'DELETE' });

export const getPricingRulesAdmin = () => apiFetch('/catalog/pricing');
export const createPricingRule  = (d: any) => apiFetch('/catalog/pricing', { method: 'POST', body: JSON.stringify(d) });
export const updatePricingRule  = (id: string, d: any) => apiFetch(`/catalog/pricing/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deletePricingRule  = (id: string) => apiFetch(`/catalog/pricing/${id}`, { method: 'DELETE' });

export const getGarmentsAdmin   = (params?: { category?: string; skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/catalog/garments${q ? `?${q}` : ''}`);
};
export const createGarment      = (d: any) => apiFetch('/catalog/garments', { method: 'POST', body: JSON.stringify(d) });
export const updateGarment      = (id: string, d: any) => apiFetch(`/catalog/garments/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteGarment      = (id: string) => apiFetch(`/catalog/garments/${id}`, { method: 'DELETE' });

// ─── ADMIN FINANCE ───────────────────────────────────────────────────────────
export const getRevenueDashboard = (params?: { period?: string; category?: string; region?: string }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/finance/revenue${q ? `?${q}` : ''}`);
};
export const getPayoutHistory   = (params?: { skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/finance/payouts${q ? `?${q}` : ''}`);
};
export const getDisputedOrders  = () => apiFetch('/finance/disputes');
export const processRefund      = (orderId: string, d: { reason: string; amount: number }) => apiFetch(`/finance/refund/${orderId}`, { method: 'POST', body: JSON.stringify(d) });
export const exportOrdersCsvUrl = (period = 'month') => `${API_BASE}/finance/export/orders?period=${period}`;

// ─── ADMIN SUPPORT ───────────────────────────────────────────────────────────
export const getSupportTickets  = (params?: { status?: string; priority?: string; search?: string; skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/support/tickets${q ? `?${q}` : ''}`);
};
export const getSupportTicket   = (id: string) => apiFetch(`/support/tickets/${id}`);
export const updateSupportTicket = (id: string, d: { status?: string; priority?: string; assigneeId?: string }) => apiFetch(`/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const addTicketNote      = (id: string, note: string) => apiFetch(`/support/tickets/${id}/note`, { method: 'POST', body: JSON.stringify({ note }) });
export const escalateTicket     = (id: string) => apiFetch(`/support/tickets/${id}/escalate`, { method: 'POST' });
export const getCannedResponses  = () => apiFetch('/support/canned');
export const createCannedResponse= (d: any) => apiFetch('/support/canned', { method: 'POST', body: JSON.stringify(d) });
export const deleteCannedResponse= (id: string) => apiFetch(`/support/canned/${id}`, { method: 'DELETE' });

// ─── ADMIN MARKETING ─────────────────────────────────────────────────────────
export const getBannersAdmin    = () => apiFetch('/marketing/banners');
export const createBanner       = (d: any) => apiFetch('/marketing/banners', { method: 'POST', body: JSON.stringify(d) });
export const toggleBanner       = (id: string, isActive: boolean) => apiFetch(`/marketing/banners/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ isActive }) });
export const deleteBanner       = (id: string) => apiFetch(`/marketing/banners/${id}`, { method: 'DELETE' });

export const getCouponsAdmin    = () => apiFetch('/marketing/coupons');
export const createCoupon       = (d: any) => apiFetch('/marketing/coupons', { method: 'POST', body: JSON.stringify(d) });
export const updateCoupon       = (id: string, d: any) => apiFetch(`/marketing/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const deleteCoupon       = (id: string) => apiFetch(`/marketing/coupons/${id}`, { method: 'DELETE' });

export const triggerEmailCampaign = (d: any) => apiFetch('/marketing/campaigns/email', { method: 'POST', body: JSON.stringify(d) });
export const triggerPushNotification = (d: any) => apiFetch('/marketing/campaigns/push', { method: 'POST', body: JSON.stringify(d) });

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────
export const getAuditLogs       = () => apiFetch('/auth/admin/audit');

// ─── TAILOR PORTAL ───────────────────────────────────────────────────────────
export const getTailorPortalDashboard = () => apiFetch('/tailor-portal/dashboard');
export const getTailorPortalOrders    = (params?: { status?: string; search?: string; skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/tailor-portal/orders${q ? `?${q}` : ''}`);
};
export const getTailorPortalOrderDetail= (id: string) => apiFetch(`/tailor-portal/orders/${id}`);
export const respondToTailorOrder     = (id: string, d: { accept: boolean; rejectReason?: string }) => apiFetch(`/tailor-portal/orders/${id}/respond`, { method: 'POST', body: JSON.stringify(d) });
export const updateTailorOrderStage   = (id: string, d: { stage: string; photoUrl?: string; note?: string }) => apiFetch(`/tailor-portal/orders/${id}/stage`, { method: 'POST', body: JSON.stringify(d) });
export const flagTailorMeasurement    = (id: string, d: { issueDescription: string }) => apiFetch(`/tailor-portal/orders/${id}/flag-measurement`, { method: 'POST', body: JSON.stringify(d) });
export const updateTailorShipping     = (id: string, d: { trackingNumber: string; courierName: string }) => apiFetch(`/tailor-portal/orders/${id}/shipping`, { method: 'POST', body: JSON.stringify(d) });

export const getTailorOrderChat       = (id: string) => apiFetch(`/tailor-portal/orders/${id}/chat`);
export const sendTailorChatMessage    = (id: string, d: { message: string; attachmentUrl?: string }) => apiFetch(`/tailor-portal/orders/${id}/chat`, { method: 'POST', body: JSON.stringify(d) });

export const getTailorPortalEarnings  = () => apiFetch('/tailor-portal/earnings');
export const getTailorPortalProfile   = () => apiFetch('/tailor-portal/profile');
export const updateTailorPortalProfile= (d: any) => apiFetch('/tailor-portal/profile', { method: 'PATCH', body: JSON.stringify(d) });
export const getTailorPortalReviews   = () => apiFetch('/tailor-portal/reviews');
export const replyToTailorReview      = (id: string, d: { reply: string }) => apiFetch(`/tailor-portal/reviews/${id}/reply`, { method: 'POST', body: JSON.stringify(d) });

// ─── DESIGNER PORTAL ─────────────────────────────────────────────────────────
export const getDesignerPortalDashboard = () => apiFetch('/designer-portal/dashboard');
export const getDesignerPortalDesigns   = (params?: { status?: string; search?: string; skip?: number; take?: number }) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/designer-portal/designs${q ? `?${q}` : ''}`);
};
export const createDesignerDesign       = (d: any) => apiFetch('/designer-portal/designs', { method: 'POST', body: JSON.stringify(d) });
export const getDesignerDesignDetail    = (id: string) => apiFetch(`/designer-portal/designs/${id}`);
export const updateDesignerDesign       = (id: string, d: any) => apiFetch(`/designer-portal/designs/${id}`, { method: 'PATCH', body: JSON.stringify(d) });
export const addDesignComment           = (id: string, comment: string) => apiFetch(`/designer-portal/designs/${id}/comment`, { method: 'POST', body: JSON.stringify({ comment }) });

export const getDesignerMonetization    = () => apiFetch('/designer-portal/monetization');
export const getDesignerAnalytics       = () => apiFetch('/designer-portal/analytics');
export const getDesignerPortalProfile   = () => apiFetch('/designer-portal/profile');
export const updateDesignerPortalProfile= (d: any) => apiFetch('/designer-portal/profile', { method: 'PATCH', body: JSON.stringify(d) });

export const getPublicDesignerStorefront= (id: string) => apiFetch(`/designer-portal/public/${id}`);
export const toggleFollowDesigner       = (id: string) => apiFetch(`/designer-portal/public/${id}/follow`, { method: 'POST' });


