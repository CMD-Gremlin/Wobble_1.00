import { NextApiRequest } from 'next';

export interface NextApiRequestWithUser extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    // Add other user properties as needed
  };
}

export const withAuth = (handler: any) => {
  return async (req: NextApiRequestWithUser, res: any) => {
    // In test environment, we'll skip actual auth
    // For tests that need an authenticated user, they can set req.user manually
    return handler(req, res);
  };
};
