import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Erros personalizados da aplicação
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }

  // Erros de validação do Prisma
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação nos dados',
      details: error.message
    });
  }

  // Erros únicos do Prisma (ex: violação de unique constraint)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        status: 'error',
        message: 'Registro duplicado encontrado',
        field: error.meta?.target
      });
    }
  }

  // Erros de validação do Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      details: error.errors
    });
  }

  // Log do erro no console em ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }

  // Erro genérico para produção
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor'
  });
};