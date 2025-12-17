import { IsEmail, IsInt, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Match } from '../../common/validators/match.decorator';

export class CreateUser3Dto{
    @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
    @IsString()
    name!: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 1, description: 'Company ID the user belongs to' })
    @IsInt()
    company_id!: number;

    @ApiProperty({ example: 'password123', description: 'Password (min 6 characters)', minLength: 6 })
    @IsString()
    @MinLength(6)
    password!: string;

    @ApiProperty({ example: 'password123', description: 'Confirm password (must match password)', minLength: 6 })
    @IsString()
    @MinLength(6)
    @Match('password', { message: 'confirmPassword must match password' })
    confirmPassword!: string;

    @ApiProperty({ example: 1, description: 'User ID of the creator' })
    @IsInt()
    created_by!: number;

    @ApiPropertyOptional({ example: 100, description: 'Optional linked user ID from auth system', nullable: true })
    @IsOptional()
    @IsInt()
    user_id?: number | null;
}