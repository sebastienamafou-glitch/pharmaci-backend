import { SetMetadata } from '@nestjs/common';

// Permet d'utiliser @Roles('ADMIN', 'PHARMACIEN') au dessus d'une route
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
