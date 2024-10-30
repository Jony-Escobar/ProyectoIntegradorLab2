import { createPool } from 'mysql2/promise';
import dbconfig from '../config/config-db.js';

const pool = createPool(dbconfig);

export {pool};