import { useEffect, useState } from 'react';
import api from './api';
import { PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import type { Expense, SummaryCategory, SummaryMonth } from './types';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<Expense>({
    title: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().slice(0, 10),
  });
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
      c.data.map(s => ({ category: s.category, total: Number(s.total) })),
    );
    setMonthSummary(
      m.data.map(s => ({ month: s.month, total: Number(s.total) })),
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/expenses', form);
    setForm({ ...form, title: '', amount: 0, category: '' });
    await loadData();
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h1>Personal Expense Tracker</h1>

      {/* Form */}
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={onChange}
        />
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={onChange}
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={onChange}
        />
        <button type="submit">Add</button>
      </form>

      {/* Table */}
      <h2>Recent Expenses</h2>
      <table width="100%" border={1} cellPadding={4} style={{ marginBottom: 20 }}>
        <thead>
          <tr>
            <th>Date</th><th>Title</th><th>Category</th><th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(e => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.title}</td>
              <td>{e.category}</td>
              <td>{e.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Charts */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h3>By Category</h3>
          <PieChart width={300} height={250}>
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

        <div>
          <h3>By Month</h3>
          <BarChart width={400} height={250} data={monthSummary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

export default App;
