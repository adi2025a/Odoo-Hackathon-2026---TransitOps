import { Request, Response, NextFunction } from 'express';
import Expense from '../../models/Expense';
import { sendSuccess, sendError } from '../../utils/response';
import { getPaginationData } from '../../utils/pagination';

export const listExpenses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, status, vehicleId, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;

    const result = await getPaginationData<any>(Expense, filter, {
      page: Number(page),
      limit: Number(limit),
    });

    sendSuccess(res, result.data, 'Expenses retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      sendError(res, 'EXPENSE_NOT_FOUND', 'Expense not found', 404);
      return;
    }

    sendSuccess(res, expense, 'Expense retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, ...body } = req.body;

    const existing = await Expense.findById(id);
    if (existing) {
      sendError(res, 'EXPENSE_EXISTS', `Expense with ID ${id} already exists`, 400);
      return;
    }

    const expense = await Expense.create({
      _id: id,
      ...body,
    });

    sendSuccess(res, expense, 'Expense created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndUpdate(id, req.body, { new: true });

    if (!expense) {
      sendError(res, 'EXPENSE_NOT_FOUND', 'Expense not found', 404);
      return;
    }

    sendSuccess(res, expense, 'Expense updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      sendError(res, 'EXPENSE_NOT_FOUND', 'Expense not found', 404);
      return;
    }

    sendSuccess(res, null, 'Expense deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const updateExpenseStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const expense = await Expense.findByIdAndUpdate(id, { status }, { new: true });

    if (!expense) {
      sendError(res, 'EXPENSE_NOT_FOUND', 'Expense not found', 404);
      return;
    }

    sendSuccess(res, expense, `Expense status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const getExpenseSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Group expenses by category
    const categoryTotals = await Expense.aggregate([
      { $match: { status: 'Approved' } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Group expenses by month (assuming date string ISO format, e.g. YYYY-MM-DD)
    const monthlyTotals = await Expense.aggregate([
      { $match: { status: 'Approved' } },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    sendSuccess(res, { categoryTotals, monthlyTotals }, 'Expense summaries generated');
  } catch (error) {
    next(error);
  }
};
