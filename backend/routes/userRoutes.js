import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.post('/login', userController.loginUser); // POST /api/user/login
router.post('/register', userController.registerUser); // POST /api/user/register
router.delete('/delete', userController.deleteUser); // DELETE /api/user/delete

export default router;
