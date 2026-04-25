const AppError = require("../utils/AppError");
const taskService = require("../services/taskService");

function parseTaskInput(body, options = {}) {
  const errors = [];
  const updates = {};
  const isPartial = options.partial === true;

  if (!isPartial || Object.prototype.hasOwnProperty.call(body, "title")) {
    if (typeof body.title !== "string" || body.title.trim().length < 3) {
      errors.push("title must be at least 3 characters long");
    } else {
      updates.title = body.title.trim();
    }
  }

  if (!isPartial || Object.prototype.hasOwnProperty.call(body, "dueDate")) {
    if (!isValidDate(body.dueDate)) {
      errors.push("dueDate must be a valid date in YYYY-MM-DD format");
    } else {
      updates.dueDate = body.dueDate;
    }
  }

  if (!isPartial || Object.prototype.hasOwnProperty.call(body, "dueTime")) {
    if (!isValidTime(body.dueTime)) {
      errors.push("dueTime must be a valid time in HH:MM format");
    } else {
      updates.dueTime = normalizeTime(body.dueTime);
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "completed")) {
    if (typeof body.completed !== "boolean") {
      errors.push("completed must be a boolean");
    } else {
      updates.completed = body.completed;
    }
  }

  if (isPartial && Object.keys(updates).length === 0) {
    errors.push("provide at least one field to update");
  }

  if (errors.length > 0) {
    throw new AppError(400, "Validation failed", "VALIDATION_ERROR", errors);
  }

  return updates;
}

function parseTaskQuery(query) {
  const status = query.status || "all";
  const sortBy = query.sortBy || "dueDate";
  const order = query.order || "asc";

  const allowedStatuses = new Set(["all", "open", "completed"]);
  const allowedSortBy = new Set(["createdAt", "dueDate", "title"]);
  const allowedOrders = new Set(["asc", "desc"]);

  const errors = [];

  if (!allowedStatuses.has(status)) {
    errors.push("status must be one of all, open, completed");
  }

  if (!allowedSortBy.has(sortBy)) {
    errors.push("sortBy must be one of createdAt, dueDate, title");
  }

  if (!allowedOrders.has(order)) {
    errors.push("order must be asc or desc");
  }

  if (errors.length > 0) {
    throw new AppError(400, "Invalid query parameters", "VALIDATION_ERROR", errors);
  }

  return { status, sortBy, order };
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isValidTime(value) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

function normalizeTime(value) {
  return `${value}:00`;
}

async function getTasks(request, response, next) {
  try {
    const filters = parseTaskQuery(request.query);
    const tasks = await taskService.getTasks(filters);

    response.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
}

async function createTask(request, response, next) {
  try {
    const taskInput = parseTaskInput(request.body);
    const task = await taskService.createTask(taskInput);

    response.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
}

async function updateTask(request, response, next) {
  try {
    const taskInput = parseTaskInput(request.body, { partial: true });
    const task = await taskService.updateTask(request.params.id, taskInput);

    response.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
}

async function completeTask(request, response, next) {
  try {
    if (
      Object.prototype.hasOwnProperty.call(request.body, "completed") &&
      typeof request.body.completed !== "boolean"
    ) {
      throw new AppError(
        400,
        "Validation failed",
        "VALIDATION_ERROR",
        ["completed must be a boolean"]
      );
    }

    const completed =
      typeof request.body.completed === "boolean" ? request.body.completed : true;
    const task = await taskService.completeTask(request.params.id, completed);

    response.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(request, response, next) {
  try {
    await taskService.deleteTask(request.params.id);

    response.status(200).json({
      success: true,
      data: {
        message: "Task deleted successfully"
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask
};
