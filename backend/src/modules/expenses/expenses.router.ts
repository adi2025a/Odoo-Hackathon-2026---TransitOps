import { Router } from 'express';
import {
  listExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  updateExpenseStatus,
  getExpenseSummary
} from './expenses.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createExpenseSchema, updateExpenseSchema, approveExpenseSchema } from './expenses.schema';

export const expensesRouter = Router();

expensesRouter.get('/', authenticate, listExpenses);
expensesRouter.get('/summary', authenticate, getExpenseSummary);
expensesRouter.get('/:id', authenticate, getExpenseById);

expensesRouter.post('/', authenticate, authorize('Super Admin', 'Fleet Manager'), validate(createExpenseSchema), createExpense);
expensesRouter.put('/:id', authenticate, authorize('Super Admin', 'Fleet Manager'), validate(updateExpenseSchema), updateExpense);
expensesRouter.patch('/:id/status', authenticate, authorize('Super Admin', 'Financial Analyst'), validate(approveExpenseSchema), updateExpenseStatus);
expensesRouter.delete('/:id', authenticate, authorize('Super Admin'), deleteExpense);

export default expensesRouter;
