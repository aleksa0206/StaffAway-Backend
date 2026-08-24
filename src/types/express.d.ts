declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                role: 'Employee' | 'Manager' | 'Hr';
                companyId: number;
            };
        }
    }
}

export {};
