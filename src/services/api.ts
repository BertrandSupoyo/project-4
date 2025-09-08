import { SubstationData } from '../types';

// Konfigurasi API base URL - sesuaikan dengan endpoint database Anda
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

console.log('API_BASE_URL:', API_BASE_URL);

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('🔗 Making API request to:', url);
      console.log('🔗 Request options:', { method: options.method, body: options.body });
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('🔗 Response status:', response.status);
      console.log('🔗 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json().catch(() => ({}));
      console.log('🔗 Response data:', data);
      
      if (!response.ok) {
        // Lempar error detail dari backend
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).detail = data;
        console.error('❌ API request failed with status:', response.status, 'data:', data);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Mengambil semua data gardu distribusi
  static async getSubstations(): Promise<SubstationData[]> {
    const response = await this.request<SubstationData[]>('/substations?limit=10000');
    return response.data;
  }

  // Mengambil data gardu berdasarkan ID
  static async getSubstationById(id: string): Promise<SubstationData> {
    const response = await this.request<SubstationData>(`/substations/${id}`);
    return response.data;
  }

  // Menambah gardu baru
  static async createSubstation(substation: Omit<SubstationData, 'id'>): Promise<SubstationData> {
    const response = await this.request<SubstationData>('/substations', {
      method: 'POST',
      body: JSON.stringify(substation),
    });
    return response.data;
  }

  // Mengupdate data gardu
  static async updateSubstation(id: string, updates: Partial<SubstationData>): Promise<SubstationData> {
    console.log('🔗 ApiService.updateSubstation called with:', { id, updates });
    console.log('🔗 API_BASE_URL:', API_BASE_URL);
    console.log('🔗 Full URL:', `${API_BASE_URL}/substations/${id}`);
    
    const response = await this.request<SubstationData>(`/substations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    
    console.log('✅ ApiService.updateSubstation response:', response);
    return response.data;
  }

  // Menghapus gardu
  static async deleteSubstation(id: string): Promise<ApiResponse<{
    substationId: string;
    substationName: string;
    siangMeasurementsDeleted: number;
    malamMeasurementsDeleted: number;
  }>> {
    return await this.request<{
      substationId: string;
      substationName: string;
      siangMeasurementsDeleted: number;
      malamMeasurementsDeleted: number;
    }>(`/substations/${id}`, {
      method: 'DELETE',
    });
  }

  // Mengambil statistik dashboard
  static async getDashboardStats(): Promise<{
    totalSubstations: number;
    activeSubstations: number;
    criticalIssues: number;
    monthlyMeasurements: number;
    ugbActive: number;
  }> {
    const response = await this.request<{
      totalSubstations: number;
      activeSubstations: number;
      criticalIssues: number;
      monthlyMeasurements: number;
      ugbActive: number;
    }>('/dashboard/stats');
    return response.data;
  }

  // Mengambil data gardu berdasarkan filter
  static async getSubstationsByFilter(filters: {
    status?: string;
    ulp?: string;
    jenis?: string;
    search?: string;
  }): Promise<SubstationData[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await this.request<SubstationData[]>(`/substations/filter?${queryParams}`);
    return response.data;
  }

  // Mengupdate status gardu
  static async updateSubstationStatus(id: string, status: SubstationData['status']): Promise<SubstationData> {
    const response = await this.request<SubstationData>(`/substations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  }

  // Mengupdate daya gardu
  static async updateSubstationPower(id: string, daya: string): Promise<SubstationData> {
    const response = await this.request<SubstationData>(`/substations/${id}/power`, {
      method: 'PATCH',
      body: JSON.stringify({ daya }),
    });
    return response.data;
  }

  // Mengupdate koordinat gardu
  static async updateSubstationCoordinates(id: string, latitude: number, longitude: number): Promise<SubstationData> {
    console.log('🌍 ApiService.updateSubstationCoordinates called with:', { id, latitude, longitude });
    
    const response = await this.request<SubstationData>(`/substations/${id}/coordinates`, {
      method: 'PATCH',
      body: JSON.stringify({ latitude, longitude }),
    });
    
    console.log('✅ ApiService.updateSubstationCoordinates response:', response);
    return response.data;
  }

  // Mengambil koordinat gardu
  static async getSubstationCoordinates(id: string): Promise<{
    id: string;
    noGardu: string;
    namaLokasiGardu: string;
    latitude: number | null;
    longitude: number | null;
  }> {
    const response = await this.request<{
      id: string;
      noGardu: string;
      namaLokasiGardu: string;
      latitude: number | null;
      longitude: number | null;
    }>(`/substations/${id}/coordinates`);
    return response.data;
  }

  // Update measurement per baris
  static async updateMeasurement(id: number, updates: any): Promise<void> {
    await this.request(`/measurements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // PATCH bulk measurement siang
  static async patchMeasurementsSiangBulk(measurements: any[]): Promise<any[]> {
    const response = await ApiService.request('/measurements_siang/bulk', {
      method: 'PATCH',
      body: JSON.stringify(measurements),
    });
    return (response.data ?? []) as any[];
  }

  // PATCH bulk measurement malam
  static async patchMeasurementsMalamBulk(measurements: any[]): Promise<any[]> {
    const response = await ApiService.request('/measurements_malam/bulk', {
      method: 'PATCH',
      body: JSON.stringify(measurements),
    });
    return (response.data ?? []) as any[];
  }

  // Bulk import substations from Excel
  static async importSubstations(data: SubstationData[]): Promise<ApiResponse<{ count: number }>> {
    return await this.request<{ count: number }>('/substations/import', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer admin_token`, // Static token for now
      },
    });
  }

  // Upload/replace substation photo via base64 string
  static async uploadSubstationPhoto(id: string, imageBase64: string, filename?: string): Promise<SubstationData> {
    const response = await this.request<SubstationData>(`/substations/${id}/photo`, {
      method: 'PATCH',
      body: JSON.stringify({ imageBase64, filename }),
      headers: {
        Authorization: `Bearer admin_token`,
      },
    });
    return response.data;
  }
}

export async function createMeasurementSiang(substationId: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/measurements_siang/${substationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Gagal membuat measurement siang');
  return await res.json();
}

export async function createMeasurementMalam(data: any) {
  const res = await fetch('/api/measurements_malam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Gagal membuat measurement malam');
  return await res.json();
}

export async function patchMeasurementsMalamBulk(measurements: any) {
  const res = await fetch('/api/measurements_malam/bulk', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(measurements)
  });
  if (!res.ok) throw new Error('Gagal update bulk measurement malam');
  return await res.json();
} 