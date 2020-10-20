import { Router } from 'express';
import { getRepository } from 'typeorm';
import multer from 'multer';

import User from '../models/User';
import { Auth } from '../middlewares';
import uploadConfig from '../config/upload';

import CreateUserService from '../services/CreateUserService';
import UploadUserAvatarService from '../services/UploadUserAvatarService';
import { classToClass } from 'class-transformer';

const router = Router();
const upload = multer(uploadConfig);

router.post('/', async (req, res) => {
  const { name, email, username, password } = req.body;

  const user = await CreateUserService.execute({
    name,
    email,
    username,
    password,
  });

  return res.status(201).send(classToClass(user));
});

router.use(Auth);

router.get('/', async (req, res) => {
  const userRepository = getRepository(User);
  const usersModels = await userRepository.find();

  const users = usersModels.map(user => {
    return classToClass(user);
  });

  return res.send(users);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { id } });

  return res.send(classToClass(user));
});

router.patch('/:id', upload.single('avatar'), async (req, res) => {
  const user = await UploadUserAvatarService.execute({
    userId: req.user.id,
    fileName: req.file.filename,
  });

  res.send(classToClass(user));
});

export default router;
