import { useEffect, useState } from 'react';
import api from './api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import type { Expense, SummaryCategory, SummaryMonth } from './types';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<Expense>({
    title: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [catSummary, setCatSummary] = useState<SummaryCategory[]>([]);
  const [monthSummary, setMonthSummary] = useState<SummaryMonth[]>([]);

  const loadData = async () => {
    const [e, c, m] = await Promise.all([
      api.get<Expense[]>('/expenses'),
      api.get<SummaryCategory[]>('/expenses/summary/category'),
      api.get<SummaryMonth[]>('/expenses/summary/month'),
    ]);

    setExpenses(e.data);
    setCatSummary(
      c.data.map(s => ({ category: s.category, total: Number((s as any).total) })),
    );
    setMonthSummary(
      m.data.map(s => ({ month: s.month, total: Number((s as any).total) })),
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const validate = () => {
    const errs: string[] = [];
    if (!form.title.trim()) errs.push('Title is required.');
    if (!form.category.trim()) errs.push('Category is required.');
    if (!form.date) errs.push('Date is required.');
    if (!form.amount || form.amount <= 0) errs.push('Amount must be greater than 0.');
    setErrors(errs);
    return errs.length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      await api.put(`/expenses/${editingId}`, form);
    } else {
      await api.post('/expenses', form);
    }

    setForm({
      title: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().slice(0, 10),
    });
    setEditingId(null);
    await loadData();
  };

  const onEdit = (expense: Expense) => {
    setForm({
      title: expense.title,
      amount: Number(expense.amount),
      category: expense.category,
      date: expense.date,
    });
    setEditingId(expense.id!);
    setErrors([]);
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setForm({
      title: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().slice(0, 10),
    });
    setErrors([]);
  };

  const onDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    await loadData();
  };

  return (
    <div className="container py-4">
      <div className="mb-4 text-center">
        <h1 className="fw-bold">Personal Expense Tracker</h1>
        <p className="text-muted mb-0">
          Track your spending and visualize your expenses in real time.
        </p>
      </div>

      {/* Card: Form */}
      <div className="row mb-4">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                {editingId ? 'Edit Expense' : 'Add New Expense'}
              </h5>
            </div>
            <div className="card-body">
              {errors.length > 0 && (
                <div className="alert alert-danger">
                  <ul className="mb-0">
                    {errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form
                onSubmit={onSubmit}
                className="row g-3 align-items-end"
              >
                <div className="col-md-4">
                  <label className="form-label">Title</label>
                  <input
                    name="title"
                    className="form-control"
                    placeholder="e.g. Groceries"
                    value={form.title}
                    onChange={onChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Amount</label>
                  <input
                    name="amount"
                    type="number"
                    className="form-control"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={onChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Category</label>
                  <input
                    name="category"
                    className="form-control"
                    placeholder="e.g. Food"
                    value={form.category}
                    onChange={onChange}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Date</label>
                  <input
                    name="date"
                    type="date"
                    className="form-control"
                    value={form.date}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Expense' : 'Add Expense'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={onCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Table + Charts */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Recent Expenses</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th className="text-end">Amount</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-3">
                          No expenses yet. Add your first one above.
                        </td>
                      </tr>
                    )}
                    {expenses.map(e => (
                      <tr key={e.id}>
                        <td>{e.date}</td>
                        <td>{e.title}</td>
                        <td>{e.category}</td>
                        <td className="text-end">
                          ${Number(e.amount).toFixed(2)}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => onEdit(e)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => onDelete(e.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="col-lg-5 d-flex flex-column gap-3">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light">
              <h6 className="mb-0">Expenses by Category</h6>
            </div>
            <div className="card-body d-flex justify-content-center">
              <PieChart width={260} height={220}>
                <Pie
                  data={catSummary}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {catSummary.map((_e, i) => (
                    <Cell key={i} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>

            <div className="card shadow-sm border-0">
              <div className="card-header bg-light">
                <h6 className="mb-0">Expenses by Month</h6>
              </div>
              <div className="card-body">
                <BarChart width={320} height={220} data={monthSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" />
                </BarChart>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
