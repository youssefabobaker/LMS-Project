import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role, PermissionResponse } from '../../models/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private baseUrl = 'https://localhost:7289/api/Roles'; // الـ Base URL حسب الـ PDF [cite: 3, 34]

  constructor(private http: HttpClient) { }

  // 1. جلب كل الأدوار [cite: 35]
  getRoles(includeDisabled: boolean = false): Observable<Role[]> {
    const params = new HttpParams().set('includeDisabled', includeDisabled.toString()); // [cite: 40]
    return this.http.get<Role[]>(this.baseUrl, { params });
  }

  // 2. جلب دور محدد ببياناته وصلاحياته [cite: 66, 67]
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  // 3. إنشاء دور جديد [cite: 106]
  createRole(roleData: { name: string, isEnrollable: boolean, permissions: string[] }): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, roleData); // [cite: 110]
  }

  // 4. تحديث دور موجود [cite: 123]
  updateRole(id: string, roleData: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, roleData); // [cite: 122]
  }

  // 5. تبديل حالة الدور (تفعيل/تعطيل) [cite: 144]
  toggleRoleStatus(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/toggle-status`, {}); // [cite: 143]
  }

  // 6. جلب كل الـ Permissions المتاحة في السيستم [cite: 160]
  getAllPermissions(): Observable<PermissionResponse> {
    return this.http.get<PermissionResponse>(`${this.baseUrl}/permissions/all`); // [cite: 159]
  }
}
