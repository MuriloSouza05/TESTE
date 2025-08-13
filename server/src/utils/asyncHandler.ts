import { Request, Response, NextFunction } from 'express';

// Wrapper para funções assíncronas que automaticamente captura erros
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};