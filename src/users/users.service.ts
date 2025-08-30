import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createUserDto.password,
      );

      const userData = {
        name: createUserDto.name,
        passwordHash,
        email: createUserDto.email,
        // routePolicies: createUserDto.routePolicies,
      };

      const newUser = this.userRepository.create(userData);
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('E-mail already exists');
      }

      throw error;
    }
  }

  async findAll() {
    const users = await this.userRepository.find({
      order: {
        id: 'desc',
      },
    });

    return users;
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new ConflictException('User not found');
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const usersData = {
      name: updateUserDto?.name,
    };

    if (updateUserDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updateUserDto.password,
      );

      usersData['passwordHash'] = passwordHash;
    }

    const user = await this.userRepository.preload({
      id,
      ...usersData,
    });

    if (!user) {
      throw new ConflictException('User not found');
    }

    if (user.id !== tokenPayload.sub) {
      throw new ForbiddenException('You are not allowed to update this user');
    }

    return this.userRepository.save(user);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new ConflictException('User not found');
    }

    if (user.id !== tokenPayload.sub) {
      throw new ForbiddenException('You are not allowed to update this user');
    }

    return this.userRepository.remove(user);
  }

  async uploadPicture(
    file: Express.Multer.File,
    tokenPayload: TokenPayloadDto,
  ) {
    if (file.size < 1024) {
      throw new BadRequestException('File size must be at least 1KB');
    }

    const user = await this.findOne(tokenPayload.sub);

    if (!user) {
      throw new ConflictException('User not found');
    }

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);
    const fileName = `${tokenPayload.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);

    await fs.writeFile(fileFullPath, file.buffer);

    user.picture = fileName;
    await this.userRepository.save(user);

    return user;
  }
}
