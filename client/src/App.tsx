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
import type { Budget, Expense, SummaryCategory, SummaryMonth } from './types';

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Other'];

const CHART_COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1'];

function getCurrentMonth() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}`;
}

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
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [budgetInput, setBudgetInput] = useState<number>(0);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('pe_tracker_theme');
    return saved === 'dark';
  });

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

  const loadBudget = async (month: string) => {
    try {
      const res = await api.get<Budget>(`/budgets/${month}`);
      setCurrentBudget(res.data);
      setBudgetInput(Number(res.data.amount));
    } catch {
      setCurrentBudget(null);
      setBudgetInput(0);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadBudget(selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    document.body.className = darkMode ? 'bg-dark text-light' : '';
    localStorage.setItem('pe_tracker_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    try {
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
      setErrors([]);
      await loadData();
    } catch (err: any) {
      if (err.response?.data?.message) {
        const backendErrors = Array.isArray(err.response.data.message)
          ? err.response.data.message
          : [err.response.data.message];
        setErrors(backendErrors);
      } else {
        setErrors(['Something went wrong on server']);
      }
    }
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
    try {
      await api.delete(`/expenses/${id}`);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting expense');
    }
  };

  const onSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetInput || budgetInput <= 0) {
      alert('Budget must be greater than 0');
      return;
    }
    try {
      const res = await api.post<Budget>('/budgets', {
        month: selectedMonth,
        amount: budgetInput,
      });
      setCurrentBudget(res.data);
      alert('Budget saved');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving budget');
    }
  };

  const totalThisMonth =
    monthSummary.find(m => m.month === selectedMonth)?.total || 0;
  const budgetValue = currentBudget ? Number(currentBudget.amount) : 0;
  const usedPercent =
    budgetValue > 0 ? Math.min(100, (Number(totalThisMonth) / budgetValue) * 100) : 0;

  const containerClass = `min-vh-100 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`;

  return (
    <div className={containerClass}>
      <div className="container py-4">
        {/* Top bar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0">Expense Tracker Dashboard</h2>
            <small className="text-muted">
              NestJS + React • Real-time insights into your spending
            </small>
          </div>
          <button
            className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
            onClick={() => setDarkMode(d => !d)}
          >
            {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div className="row g-4">
          {/* Left column: form + table */}
          <div className="col-lg-7">
            {/* Form card */}
            <div className="card shadow-sm border-0 mb-4">
              <div className={`card-header ${darkMode ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
                <h5 className="mb-0">
                  {editingId ? 'Edit Expense' : 'Add New Expense'}
                </h5>
              </div>
              <div className={`card-body ${darkMode ? 'bg-dark text-light' : ''}`}>
                {errors.length > 0 && (
                  <div className="alert alert-danger">
                    <ul className="mb-0">
                      {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={onSubmit} className="row g-3 align-items-end">
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
                    <select
                      name="category"
                      className="form-select"
                      value={form.category}
                      onChange={onChange}
                    >
                      <option value="">Choose...</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
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

            {/* Table card */}
            <div className="card shadow-sm border-0">
              <div className={`card-header ${darkMode ? 'bg-secondary text-white' : 'bg-light'}`}>
                <h5 className="mb-0">Recent Expenses</h5>
              </div>
              <div className={`card-body p-0 ${darkMode ? 'bg-dark text-light' : ''}`}>
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className={darkMode ? '' : 'table-light'}>
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

          {/* Right column: budget + charts */}
          <div className="col-lg-5 d-flex flex-column gap-3">
            {/* Budget card */}
            <div className="card shadow-sm border-0">
              <div className={`card-header ${darkMode ? 'bg-secondary text-white' : 'bg-light'}`}>
                <h6 className="mb-0">Monthly Budget</h6>
              </div>
              <div className={`card-body ${darkMode ? 'bg-dark text-light' : ''}`}>
                <form className="row g-2 align-items-end" onSubmit={onSaveBudget}>
                  <div className="col-5">
                    <label className="form-label">Month</label>
                    <input
                      type="month"
                      className="form-control"
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label">Budget</label>
                    <input
                      type="number"
                      className="form-control"
                      value={budgetInput}
                      onChange={e => setBudgetInput(Number(e.target.value))}
                    />
                  </div>
                  <div className="col-3">
                    <button type="submit" className="btn btn-success w-100">
                      Save
                    </button>
                  </div>
                </form>

                <hr />

                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small">Spent this month</span>
                    <span className="small fw-bold">
                      ${Number(totalThisMonth).toFixed(2)}{' '}
                      {budgetValue > 0 && `of $${budgetValue.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="progress" style={{ height: 10 }}>
                    <div
                      className={`progress-bar ${usedPercent > 90 ? 'bg-danger' : usedPercent > 70 ? 'bg-warning' : 'bg-success'}`}
                      role="progressbar"
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category chart */}
            <div className="card shadow-sm border-0">
              <div className={`card-header ${darkMode ? 'bg-secondary text-white' : 'bg-light'}`}>
                <h6 className="mb-0">Expenses by Category</h6>
              </div>
              <div className={`card-body d-flex justify-content-center ${darkMode ? 'bg-dark text-light' : ''}`}>
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
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>

            {/* Month chart */}
            <div className="card shadow-sm border-0">
              <div className={`card-header ${darkMode ? 'bg-secondary text-white' : 'bg-light'}`}>
                <h6 className="mb-0">Expenses by Month</h6>
              </div>
              <div className={`card-body ${darkMode ? 'bg-dark text-light' : ''}`}>
                <BarChart width={340} height={220} data={monthSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#4e79a7" />
                </BarChart>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
