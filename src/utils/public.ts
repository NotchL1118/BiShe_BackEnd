// 跳过token验证，公共接口
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const SHOULD_ADD_USER_KEY = 'shouldAddUser';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const PublicShouldAddUser = () => SetMetadata(SHOULD_ADD_USER_KEY, true);
