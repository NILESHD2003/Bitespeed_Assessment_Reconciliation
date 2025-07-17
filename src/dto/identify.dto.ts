import {IsEmail, IsNumber, IsOptional } from 'class-validator';

export class IdentifyDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsNumber()
    phoneNumber?: number;
}