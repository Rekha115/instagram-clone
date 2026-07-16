import { validationResult } from 'express-validator';

/**
 * Runs after an express-validator chain. If validation errors exist,
 * responds with 422 and a clean list of field-level messages instead
 * of letting the request reach the controller.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formattedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: formattedErrors,
  });
};

export default validate;
