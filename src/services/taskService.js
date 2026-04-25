const pool = require("../db/pool");
const AppError = require("../utils/AppError");

function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    dueTime: row.due_time.slice(0, 5),
    completed: row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getTasks({ status, sortBy, order }) {
  const values = [];
  const conditions = [];

  if (status === "open") {
    values.push(false);
    conditions.push(`completed = $${values.length}`);
  }

  if (status === "completed") {
    values.push(true);
    conditions.push(`completed = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sortOrder = order.toUpperCase();
  let orderByClause = "due_date ASC, due_time ASC, created_at DESC";

  if (sortBy === "createdAt") {
    orderByClause = `created_at ${sortOrder}`;
  }

  if (sortBy === "title") {
    orderByClause = `title ${sortOrder}, created_at DESC`;
  }

  if (sortBy === "dueDate") {
    orderByClause = `due_date ${sortOrder}, due_time ${sortOrder}, created_at DESC`;
  }

  const query = `
    SELECT id, title, due_date, due_time, completed, created_at, updated_at
    FROM tasks
    ${whereClause}
    ORDER BY ${orderByClause}
  `;

  const result = await pool.query(query, values);
  return result.rows.map(mapTask);
}

async function createTask({ title, dueDate, dueTime }) {
  const query = `
    INSERT INTO tasks (title, due_date, due_time)
    VALUES ($1, $2, $3)
    RETURNING id, title, due_date, due_time, completed, created_at, updated_at
  `;

  const result = await pool.query(query, [title, dueDate, dueTime]);
  return mapTask(result.rows[0]);
}

async function updateTask(id, updates) {
  const fields = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(updates, "title")) {
    values.push(updates.title);
    fields.push(`title = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "dueDate")) {
    values.push(updates.dueDate);
    fields.push(`due_date = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "dueTime")) {
    values.push(updates.dueTime);
    fields.push(`due_time = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "completed")) {
    values.push(updates.completed);
    fields.push(`completed = $${values.length}`);
  }

  values.push(id);

  const query = `
    UPDATE tasks
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING id, title, due_date, due_time, completed, created_at, updated_at
  `;

  const result = await pool.query(query, values);

  if (result.rowCount === 0) {
    throw new AppError(404, "Task not found", "TASK_NOT_FOUND");
  }

  return mapTask(result.rows[0]);
}

async function completeTask(id, completed) {
  const query = `
    UPDATE tasks
    SET completed = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, title, due_date, due_time, completed, created_at, updated_at
  `;

  const result = await pool.query(query, [completed, id]);

  if (result.rowCount === 0) {
    throw new AppError(404, "Task not found", "TASK_NOT_FOUND");
  }

  return mapTask(result.rows[0]);
}

async function deleteTask(id) {
  const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    throw new AppError(404, "Task not found", "TASK_NOT_FOUND");
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask
};
