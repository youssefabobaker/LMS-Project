import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { Role, PermissionResponse } from '../../models/role';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private baseUrl = `${environment.apiUrl}/api/Roles`; // الـ Base URL حسب الـ PDF [cite: 3, 34]
  private rolesCache$: Observable<Role[]> | null = null;
  private allRolesCache$: Observable<Role[]> | null = null;
  private permissionsCache$: Observable<PermissionResponse> | null = null;

  constructor(private http: HttpClient) { }

  private normalizeRole(r: any): Role {
    return {
      id: r.id ?? r.Id,
      name: r.name ?? r.Name,
      isDeleted: r.isDeleted ?? r.IsDeleted ?? false,
      isEnrollable: r.isEnrollable ?? r.IsEnrollable ?? false,
      permissions: r.permissions ?? r.Permissions ?? []
    };
  }

  clearCache(): void {
    this.rolesCache$ = null;
    this.allRolesCache$ = null;
  }

  // 1. جلب كل الأدوار [cite: 35]
  getRoles(includeDisabled: boolean = false): Observable<Role[]> {
    if (includeDisabled) {
      if (!this.allRolesCache$) {
        const params = new HttpParams().set('includeDisabled', 'true');
        this.allRolesCache$ = this.http.get<any[]>(this.baseUrl, { params }).pipe(
          map(roles => roles.map(r => this.normalizeRole(r))),
          shareReplay(1)
        );
      }
      return this.allRolesCache$;
    }

    if (!this.rolesCache$) {
      const params = new HttpParams().set('includeDisabled', 'false');
      this.rolesCache$ = this.http.get<any[]>(this.baseUrl, { params }).pipe(
        map(roles => roles.map(r => this.normalizeRole(r))),
        shareReplay(1)
      );
    }
    return this.rolesCache$;
  }

  // 2. جلب دور محدد ببياناته وصلاحياته [cite: 66, 67]
  getRoleById(id: string): Observable<Role> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(r => this.normalizeRole(r))
    );
  }

  // 3. إنشاء دور جديد [cite: 106]
  createRole(roleData: { name: string, isEnrollable: boolean, permissions: string[] }): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, roleData).pipe(tap(() => this.clearCache())); // [cite: 110]
  }

  // 4. تحديث دور موجود [cite: 123]
  updateRole(id: string, roleData: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, roleData).pipe(tap(() => this.clearCache())); // [cite: 122]
  }

  // 5. تبديل حالة الدور (تفعيل/تعطيل) [cite: 144]
  toggleRoleStatus(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/toggle-status`, {}).pipe(tap(() => this.clearCache())); // [cite: 143]
  }

  // 6. جلب كل الـ Permissions المتاحة في السيستم [cite: 160]
  getAllPermissions(): Observable<PermissionResponse> {
    if (!this.permissionsCache$) {
      this.permissionsCache$ = this.http.get<PermissionResponse>(`${this.baseUrl}/permissions/all`).pipe(
        shareReplay(1)
      );
    }
    return this.permissionsCache$;
  }
}
