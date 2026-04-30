import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '../../models/department';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private baseUrl = 'https://localhost:7289/api/Department';

  constructor(private http: HttpClient) {}

  /**
   * 1. Get all departments
   * GET /api/Department
   */
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.baseUrl);
  }

  /**
   * 2. Create a new department
   * POST /api/Department
   */
  createDepartment(data: { title: string }): Observable<Department> {
    return this.http.post<Department>(this.baseUrl, data);
  }

  /**
   * 3. Update an existing department
   * PUT /api/Department/{id}
   */
  updateDepartment(id: number, data: { title: string }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * 4. Soft-delete a department (removes from list)
   * DELETE /api/Department/{id}
   */
  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
