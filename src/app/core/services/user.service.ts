import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user'; // تأكد من مسار الموديل عندك

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // استبدل <host> بالدومين الفعلي الخاص بك كما هو موضح في صفحة 1 من الـ PDF
  private baseUrl = 'https://localhost:7289/api/Users';

  constructor(private http: HttpClient) {}

  /**
   * 1. جلب كل المستخدمين (صفحة 8 في الـ PDF)
   * @param includeNotConfirmed تضمين الحسابات التي لم يتم تأكيد إيميلها
   */
  // في ملف user.service.ts
  getUsers(
    includeNotConfirmed: boolean = true,
    includeDisabled: boolean = true,
  ): Observable<User[]> {
    // بنجهز الـ Parameters اللي هتتبعت في الـ Query String
    const params = new HttpParams()
      .set('IncludeNotConfirmed', includeNotConfirmed.toString())
      .set('includeDisabled', includeDisabled.toString()); // السطر الجديد

    return this.http.get<User[]>(this.baseUrl, { params });
  }

  /**
   * 2. جلب بيانات مستخدم محدد (صفحة 9 في الـ PDF)##########################################################################
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  /**
   * 3. جلب المدرسين التابعين لقسم معين (صفحة 9 في الـ PDF)##########################################################################
   */
  getInstructorsByDepartment(departmentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${departmentId}/Instructors`);
  }

  /**
   * 4. إنشاء مستخدم جديد (صفحة 10 في الـ PDF)
   * البيانات المطلوبة: firstName, lastName, email, password, roles[], إلخ.
   */
  createUser(userData: any): Observable<User> {
    return this.http.post<User>(this.baseUrl, userData);
  }

  /**
   * 5. تحديث بيانات مستخدم موجود (صفحة 11 في الـ PDF)
   */
  updateUser(id: string, userData: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, userData);
  }

  /**
   * 6. تفعيل أو تعطيل حساب مستخدم (صفحة 11 في الـ PDF)
   * هذا الـ Endpoint يقوم بعمل soft-delete أو إعادة تفعيل
   */
  toggleUserStatus(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/toggle-status`, {});
  }

  /**
   * 7. فك قفل الحساب (صفحة 12 في الـ PDF)#############################################################################
   * يُستخدم عندما يتم قفل الحساب بسبب محاولات دخول خاطئة كثيرة
   */
  unlockUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/unlock`, {});
  }
}
