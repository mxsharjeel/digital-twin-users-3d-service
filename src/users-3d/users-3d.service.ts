import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUser3Dto } from './dto/create-user-3d.dto';
import * as bcrypt from 'bcrypt';
import { ValidationService } from '../microservices/validation.service';
import { UpdateUser3dDto } from './dto/update-user-3d.dto';

@Injectable()
export class Users3dService {
constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
) {}
async create(dto: CreateUser3Dto){

    await this.validationService.validateAllReferences(
        {
            company_id: dto.company_id,
            created_by: dto.created_by,
            user_id: dto.user_id,
            email: dto.email,
        });

    const hashed = dto.password ? await bcrypt.hash(dto.password, 10) : null;
    const data: any = {
        name: dto.name,
        email: dto.email,
        company_id: dto.company_id,
        password: hashed ?? '',
        created_by: dto.created_by,
        user_id: dto.user_id ?? null,
    };
    try{
       return await this.prisma.users_3d.create({ data })
    }catch(e: any){
        if(e.code === 'P2002'){
            throw new ConflictException('User with this email already exists');
    }
    throw e;
        }
    }

async update(id: number, dto: UpdateUser3dDto){
    const existingUser = await this.prisma.users_3d.findUnique({ where: { id } });
    if(!existingUser){
        throw new NotFoundException('User not found');
    };
    if(dto.updated_by){
        const valid = await this.validationService.validateUserId(dto.updated_by);
        if(!valid)
        {
            throw new ConflictException( `Updated_by user ID ${dto.updated_by} does not exist`);
        }
    }
    await this.validationService.validateAllReferences({
            company_id: dto.company_id ?? undefined,
            user_id: dto.user_id ?? undefined,
            email: dto.email ?? undefined,
        });
        const hashed = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;
        const data: any = {
            ...(dto.name && { name: dto.name }),
            ...(dto.email && { email: dto.email }),
            ...(dto.company_id && { company_id: dto.company_id }),
             ...(dto.user_id !== undefined && { user_id: dto.user_id }),
            ...(dto.updated_by && { updated_by: dto.updated_by }),
            ...(hashed && { password: hashed }),
        }
        try{
            return await this.prisma.users_3d.update({
                where: { id },
                data,
            });
   }catch(e: any){

      if (e.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }

      if (e.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      throw new BadRequestException({
        message: 'Update failed',
        prismaCode: e.code,
        meta: e.meta,
      });
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.users_3d.findMany();
      if (!users || users.length === 0) {
        return [];
      }

      const userIds: number[] = [];
      const companyIds: number[] = [];

      users.forEach(user => {
        if (user.created_by) userIds.push(user.created_by);
        if (user.updated_by) userIds.push(user.updated_by);
        if (user.user_id) userIds.push(user.user_id);
        if (user.company_id) companyIds.push(user.company_id);
      });

      const [usersMap, companiesMap] = await Promise.all([
        this.validationService.getUsersByIds(userIds),
        this.validationService.getCompaniesByIds(companyIds),
      ]);

      const enrichedUsers = users.map(user => {
        const creatorData = user.created_by ? usersMap.get(user.created_by) : null;
        const updaterData = user.updated_by ? usersMap.get(user.updated_by) : null;
        const linkedUserData = user.user_id ? usersMap.get(user.user_id) : null;
        const companyData = user.company_id ? companiesMap.get(user.company_id) : null;

        return {
          ...user,
          company: companyData ?? null,
          creator: creatorData ? {
            user_id: creatorData.user_id,
            name: creatorData.name,
            email: creatorData.email,
          } : null,
          updater: updaterData ? {
            user_id: updaterData.user_id,
            name: updaterData.name,
            email: updaterData.email,
          } : null,
          linkedUser: linkedUserData ? {
            user_id: linkedUserData.user_id,
            name: linkedUserData.name,
            email: linkedUserData.email,
            role: linkedUserData.role?.name ?? null,
            company_id: linkedUserData.company_id,
          } : null,
        };
      });

      return enrichedUsers;
    } catch (e: any) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new BadRequestException({
        message: 'Failed to retrieve users',
        prismaCode: e.code,
        meta: e.meta,
      });
    }
  }

 async findOne(id: number) {
  try {
    const user = await this.prisma.users_3d.findUnique({
      where: { id },
    });

    // If user doesn't exist, throw 404 error
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    
    const userIds: number[] = [];
    
    if (user.created_by) userIds.push(user.created_by);
    
    if (user.updated_by) userIds.push(user.updated_by);
    
    if (user.user_id) userIds.push(user.user_id);

    const [usersMap, companyData] = await Promise.all([
      this.validationService.getUsersByIds(userIds),
      user.company_id 
        ? this.validationService.getCompanyById(user.company_id) 
        : Promise.resolve(null),
    ]);


    const creatorData = user.created_by ? usersMap.get(user.created_by) : null;
    const updaterData = user.updated_by ? usersMap.get(user.updated_by) : null;
    const linkedUserData = user.user_id ? usersMap.get(user.user_id) : null;

    return {
      ...user,
      
      company: companyData ?? null,
      
      creator: creatorData ? {
        user_id: creatorData.user_id,
        name: creatorData.name,
        email: creatorData.email,
      } : null,
      updater: updaterData ? {
        user_id: updaterData.user_id,
        name: updaterData.name,
        email: updaterData.email,
      } : null,

      linkedUser: linkedUserData ? {
        user_id: linkedUserData.user_id,
        name: linkedUserData.name,
        email: linkedUserData.email,
        role: linkedUserData.role?.name ?? null,  // Optional chaining for nested role.name
        company_id: linkedUserData.company_id,
      } : null,
    };

  } catch (e: any) {
    if (e instanceof NotFoundException) {
      throw e;
    }

    throw new BadRequestException({
      message: 'Failed to retrieve user',
      prismaCode: e.code,
      meta: e.meta,
    });
  }
}

async findByCompany(company_id: number) {
    try {
      const users = await this.prisma.users_3d.findMany( {
        where : { company_id},
    }
      );
      if (!users || users.length === 0) {
        return [];
      }

      const userIds: number[] = [];
      const companyIds: number[] = [];

      users.forEach(user => {
        if (user.created_by) userIds.push(user.created_by);
        if (user.updated_by) userIds.push(user.updated_by);
        if (user.user_id) userIds.push(user.user_id);
        if (user.company_id) companyIds.push(user.company_id);
      });

      const [usersMap, companiesMap] = await Promise.all([
        this.validationService.getUsersByIds(userIds),
        this.validationService.getCompaniesByIds(companyIds),
      ]);

      const enrichedUsers = users.map(user => {
        const creatorData = user.created_by ? usersMap.get(user.created_by) : null;
        const updaterData = user.updated_by ? usersMap.get(user.updated_by) : null;
        const linkedUserData = user.user_id ? usersMap.get(user.user_id) : null;
        const companyData = user.company_id ? companiesMap.get(user.company_id) : null;

        return {
          ...user,
          company: companyData ?? null,
          creator: creatorData ? {
            user_id: creatorData.user_id,
            name: creatorData.name,
            email: creatorData.email,
          } : null,
          updater: updaterData ? {
            user_id: updaterData.user_id,
            name: updaterData.name,
            email: updaterData.email,
          } : null,
          linkedUser: linkedUserData ? {
            user_id: linkedUserData.user_id,
            name: linkedUserData.name,
            email: linkedUserData.email,
            role: linkedUserData.role?.name ?? null,
            company_id: linkedUserData.company_id,
          } : null,
        };
      });

      return enrichedUsers;
    } catch (e: any) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new BadRequestException({
        message: 'Failed to retrieve users',
        prismaCode: e.code,
        meta: e.meta,
      });
    }
  }

async findByLinkedUserId(userId: number) {
  try {
    const user = await this.prisma.users_3d.findUnique({
      where: {user_id: userId},
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    
    const userIds: number[] = [];
    
    if (user.created_by) userIds.push(user.created_by);
    
    if (user.updated_by) userIds.push(user.updated_by);
    
    if (user.user_id) userIds.push(user.user_id);

    const [usersMap, companyData] = await Promise.all([
      this.validationService.getUsersByIds(userIds),
      user.company_id 
        ? this.validationService.getCompanyById(user.company_id) 
        : Promise.resolve(null),
    ]);


    const creatorData = user.created_by ? usersMap.get(user.created_by) : null;
    const updaterData = user.updated_by ? usersMap.get(user.updated_by) : null;
    const linkedUserData = user.user_id ? usersMap.get(user.user_id) : null;

    return {
      ...user,
      
      company: companyData ?? null,
      
      creator: creatorData ? {
        user_id: creatorData.user_id,
        name: creatorData.name,
        email: creatorData.email,
      } : null,
      updater: updaterData ? {
        user_id: updaterData.user_id,
        name: updaterData.name,
        email: updaterData.email,
      } : null,

      linkedUser: linkedUserData ? {
        user_id: linkedUserData.user_id,
        name: linkedUserData.name,
        email: linkedUserData.email,
        role: linkedUserData.role?.name ?? null,
        company_id: linkedUserData.company_id,
      } : null,
    };

  } catch (e: any) {
    if (e instanceof NotFoundException) {
      throw e;
    }

    throw new BadRequestException({
      message: 'Failed to retrieve user',
      prismaCode: e.code,
      meta: e.meta,
    });
  }
}

 async remove(id: number) {
    try {
      return await this.prisma.users_3d.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException(`3D User ${id} not found`);
      throw e;
    }
  }

  //need to put this in the auth microservice and also need to add a created_by column in there
//   private async getAllChildUsers(userId: number): Promise<{ user_id: number; company_id: number | null }[]> {
//     const children = await this.prisma.user.findMany({
//       where: { created_by: userId },
//       select: { user_id: true, company_id: true },
//     });

//     // Recursively get grandchildren
//     const grandchildren = await Promise.all(
//       children.map(child => this.getAllChildUsers(child.user_id))
//     );

//     return [...children, ...grandchildren.flat()];
//   }

}