import api, { extractApiError } from "../lib/api";

export async function fetchAnalytics() {
  const res = await api.get("/admin/analytics");
  return res.data;
}

export async function fetchUsers(params = {}) {
  const res = await api.get("/admin/users", { params });
  return res.data.users || [];
}

export async function toggleUserStatus(userId, isActive) {
  const res = await api.patch(`/admin/users/${userId}/status`, { is_active: isActive });
  return res.data;
}

export async function fetchMechanics() {
  const res = await api.get("/admin/mechanics");
  return res.data.mechanics || [];
}

export async function fetchGarages() {
  const res = await api.get("/admin/garages");
  return res.data.garages || [];
}

export async function fetchPayments(params = {}) {
  const res = await api.get("/admin/payments", { params });
  return res.data.payments || [];
}

export async function fetchJobs(params = {}) {
  const res = await api.get("/admin/jobs", { params });
  return res.data.jobs || [];
}

export async function forceAssignJob(jobId, providerType, providerId) {
  const res = await api.post(`/admin/jobs/${jobId}/force-assign`, {
    provider_type: providerType,
    provider_id: providerId,
  });
  return res.data;
}

export async function trackJob(jobId) {
  const res = await api.get(`/admin/jobs/${jobId}/track`);
  return res.data;
}

export async function fetchDisputes(params = {}) {
  const res = await api.get("/admin/disputes", { params });
  return res.data.disputes || [];
}

export async function updateDispute(disputeId, data) {
  const res = await api.patch(`/admin/disputes/${disputeId}`, data);
  return res.data;
}

export async function refundDispute(disputeId, amount, notes = "") {
  const res = await api.post(`/admin/disputes/${disputeId}/refund`, { amount, notes });
  return res.data;
}

export async function penalizeProvider(disputeId, amount, notes = "") {
  const res = await api.post(`/admin/disputes/${disputeId}/penalize`, { amount, notes });
  return res.data;
}

export async function messageDisputeParties(disputeId, message) {
  const res = await api.post(`/admin/disputes/${disputeId}/message`, { message });
  return res.data;
}

export async function fetchPendingKyc() {
  const res = await api.get("/admin/kyc/pending");
  return res.data.applications || [];
}

export async function verifyMechanic(mechanicId, verified) {
  const res = await api.patch(`/admin/mechanic/${mechanicId}/verify`, { verified });
  return res.data;
}

export async function verifyGarage(garageId, verified) {
  const res = await api.patch(`/admin/garage/${garageId}/verify`, { verified });
  return res.data;
}

export async function resolveDisputeWithStatus(disputeId, status, resolution = null) {
  return updateDispute(disputeId, { status, resolution });
}
