import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    user_id: number;
    name: string;
    email: string;
  };
}