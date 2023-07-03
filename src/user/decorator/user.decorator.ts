import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { whichUser } from 'src/Utils.interfaces';
export const User = createParamDecorator((data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user;
});
