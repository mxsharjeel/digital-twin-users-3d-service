import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

export interface UserInfo {
  user_id: number;
  name: string;
  email: string;
  role_id?: number;
  company_id?: number;
  role?: {
    role_id: number;
    name: string;
    description?: string;
  };
}

export interface CompanyInfo {
  company_id: number;
  companyCode: string;
  name: string;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
  org_type_id?: number;
}

@Injectable()
export class ValidationService{
    constructor(
        @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
        @Inject('STRUCTURE_SERVICE') private readonly structureClient: ClientProxy
    ) {}

    async validateUserId(userId: number): Promise<boolean> {
        try {
            const result = await firstValueFrom(
                this.authClient.send({ cmd: 'validate_user' }, { user_id: userId}).pipe(
                    timeout(5000),
                    catchError((err) => {
                        throw new BadRequestException(`Auth service error: ${err.message}`);
                    }),
                ),
            );
              return result?.exists === true;
        }catch (error) {
            throw new BadRequestException(`Failed to validate user ID: ${userId}`);
        }
    }

    async validateEmail(email: string): Promise<{ exists: boolean; userid?: number}>{
        try {
            const result = await firstValueFrom(
                this.authClient.send({ cmd: 'validate_email' }, { email}).pipe(
                    timeout(5000),
                    catchError((err)=> {
                        throw new BadRequestException(`Auth service error: ${err.message}`)
                    }),
                ),
            );
            return result;
        } catch (error) {
            throw new BadRequestException(`Failed to validate email: ${ email }`);
        }
    }

    async validateCompanyId(companyId: number): Promise<boolean> {
        try {
            const result = await firstValueFrom(
                this.structureClient.send('validate_company', companyId).pipe(
                    timeout(5000),
                    catchError((err) => {
                        throw new BadRequestException(`Structure service error: ${err.message}`);
                    }),
                ),
            );
            return result?.exists === true;
    } catch (error){
        throw new BadRequestException(`Failed to validate company_id: ${companyId}`);
    }
}
     async validateCreatedBy(createdBy: number): Promise<boolean> {
    return this.validateUserId(createdBy);
  }

  async validateAllReferences(data: {
    company_id?: number;
    created_by?: number;
    user_id?: number | null;
    email?: string;
  }): Promise<void> {
    const errors: string[] = [];

    if (data.company_id !== undefined) {
      const companyValid = await this.validateCompanyId(data.company_id);
      if (!companyValid) {
        errors.push(`Invalid company_id: ${data.company_id}`);
      }
    }

    if (data.created_by !== undefined) {
      const createdByValid = await this.validateCreatedBy(data.created_by);
      if (!createdByValid) {
        errors.push(`Invalid created_by user: ${data.created_by}`);
      }
    }

    if (data.user_id) {
      const userIdValid = await this.validateUserId(data.user_id);
      if (!userIdValid) {
        errors.push(`Invalid user_id: ${data.user_id}`);
      }
    }

    if (data.email !== undefined) {
      const emailResult = await this.validateEmail(data.email);
      if (!emailResult.exists) {
        errors.push(`Email not registered in auth system: ${data.email}`);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }
  }

  // ==================== DATA FETCHING METHODS ====================

  /**
   * Fetch single company by ID from Structure Service
   * Uses existing 'get_company' pattern in Structure Service
   */
  async getCompanyById(companyId: number): Promise<CompanyInfo | null> {
    try {
      const result = await firstValueFrom(
        this.structureClient.send('get_company', companyId).pipe(
          timeout(5000),
          catchError(() => of(null)),
        ),
      );
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Fetch multiple users by IDs from Auth Service
   * Returns user data with role information
   */
  async getUsersByIds(userIds: number[]): Promise<Map<number, UserInfo>> {
    const userMap = new Map<number, UserInfo>();
    if (!userIds.length) return userMap;

    // Remove duplicates and nulls
    const uniqueIds = [...new Set(userIds.filter(id => id != null))];
    
    try {
      const result = await firstValueFrom(
        this.authClient.send('get_users_by_ids', { user_ids: uniqueIds }).pipe(
          timeout(10000),
          catchError(() => of([])),
        ),
      );
      
      if (Array.isArray(result)) {
        result.forEach((user: UserInfo) => {
          if (user?.user_id) {
            userMap.set(user.user_id, user);
          }
        });
      }
    } catch {
      // Return empty map on error - graceful degradation
    }
    
    return userMap;
  }

  /**
   * Fetch multiple companies by IDs from Structure Service
   * Uses existing 'get_companies' pattern in Structure Service
   */
  async getCompaniesByIds(companyIds: number[]): Promise<Map<number, CompanyInfo>> {
    const companyMap = new Map<number, CompanyInfo>();
    if (!companyIds.length) return companyMap;

    // Remove duplicates and nulls
    const uniqueIds = [...new Set(companyIds.filter(id => id != null))];
    
    try {
      const result = await firstValueFrom(
        // Using 'get_companies' pattern that exists in Structure Service
        this.structureClient.send('get_companies', uniqueIds).pipe(
          timeout(10000),
          catchError(() => of([])),
        ),
      );
      
      if (Array.isArray(result)) {
        result.forEach((company: CompanyInfo) => {
          if (company?.company_id) {
            companyMap.set(company.company_id, company);
          }
        });
      }
    } catch {
      // Return empty map on error - graceful degradation
    }
    
    return companyMap;
  }
}