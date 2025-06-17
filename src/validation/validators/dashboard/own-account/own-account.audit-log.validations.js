import { query } from "express-validator";

export default [
    query("weeks").isNumeric().default(1).toInt().optional(),
]
