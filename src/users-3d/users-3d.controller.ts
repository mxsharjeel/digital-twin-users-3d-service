import { Body,  Controller, Delete, Get, Param, ParseIntPipe, Put, Post, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Users3dService } from './users-3d.service';
import { CreateUser3Dto } from './dto/create-user-3d.dto';
import { UpdateUser3dDto } from './dto/update-user-3d.dto';

@ApiTags('users-3d')
@ApiBearerAuth()
@Controller('users-3d')
export class Users3dController {
  constructor(private readonly users3dService: Users3dService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new 3D user' })
  @ApiBody({ type: CreateUser3Dto })
  create(@Body() dto: CreateUser3Dto) {
    return this.users3dService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an exisitng 3D user'})
  @ApiBody({ type: UpdateUser3dDto })
  update(@Param('id', ParseIntPipe) id: number,  @Body() dto: UpdateUser3dDto) 
  {
    return this.users3dService.update(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all 3D users' })
  findAll(){
    return this.users3dService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a 3D user by ID' })
  findOne(@Param('id', ParseIntPipe) id: number){
    return this.users3dService.findOne(id);
  }

  @Get('company/:company_id')
  @ApiOperation({ summary: 'Get 3D users by Company ID' })
  findByCompany(@Param('company_id', ParseIntPipe) company_id: number){
    return this.users3dService.findByCompany(company_id);
  }

  @Get('linked-with/:userId')
  @ApiOperation({ summary: 'Get a 3D user by Linked User ID' })
  findByLinkedUserId(@Param('userId', ParseIntPipe) userId: number){
    return this.users3dService.findByLinkedUserId(userId);
  } 

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a 3D user' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.users3dService.remove(id);
}
}
