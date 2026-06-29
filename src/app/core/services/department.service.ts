import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Department } from '../../models/department';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private baseUrl = `${environment.apiUrl}/api/Department`;

  constructor(private http: HttpClient) {}

  private normalizeDept(d: any): Department {
    return {
      id: d.id ?? d.Id,
      title: d.title ?? d.Title
    };
  }

  private cachedDepartments: Department[] | null = null;

  clearCache(): void {
    this.cachedDepartments = null;
  }

  /**
   * 1. Get all departments
   * GET /api/Department
   */
  getDepartments(): Observable<Department[]> {
    if (this.cachedDepartments) {
      return of(this.cachedDepartments);
    }
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(deps => deps.map(d => this.normalizeDept(d))),
      tap(deps => this.cachedDepartments = deps)
    );
  }

  /**
   * 2. Create a new department
   * POST /api/Department
   */
  createDepartment(data: { title: string }): Observable<Department> {
    this.clearCache();
    return this.http.post<Department>(this.baseUrl, data);
  }

  /**
   * 3. Update an existing department
   * PUT /api/Department/{id}
   */
  updateDepartment(id: number, data: { title: string }): Observable<void> {
    this.clearCache();
    return this.http.put<void>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * 4. Soft-delete a department (removes from list)
   * DELETE /api/Department/{id}
   */
  deleteDepartment(id: number): Observable<void> {
    this.clearCache();
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
