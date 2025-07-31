import { SubstationData } from '../types';

// Konfigurasi API base URL - sesuaikan dengan endpoint database Anda
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://project-4-three-lime.vercel.app/api';

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
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        // Lempar error detail dari backend
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).detail = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
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
    const response = await this.request<SubstationData>(`/substations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  // Menghapus gardu
  static async deleteSubstation(id: string): Promise<void> {
    await this.request(`/substations/${id}`, {
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

  // Update measurement per baris
  static async updateMeasurement(id: number, updates: any): Promise<void> {
    await this.request(`/measurements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // PATCH measurement (partial update)
  // static async patchMeasurement(id: number, updates: any): Promise<void> {
  //   await ApiService.request(`/measurements/${id}`, {
  //     method: 'PATCH',
  //     body: JSON.stringify(updates),
  //   });
  // }

  // PATCH measurement siang (partial update)
  // static async patchMeasurementSiang(id: number, updates: any): Promise<void> {
  //   await ApiService.request(`/measurements_siang/${id}`, {
  //     method: 'PATCH',
  //     body: JSON.stringify(updates),
  //   });
  // }

  // PATCH measurement malam (partial update)
  // static async patchMeasurementMalam(id: number, updates: any): Promise<void> {
  //   await ApiService.request(`/measurements_malam/${id}`, {
  //     method: 'PATCH',
  //     body: JSON.stringify(updates),
  //   });
  // }

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