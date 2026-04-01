import { Role } from '@prisma/client';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: Role;
    indexNumber?: string;
    course?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
