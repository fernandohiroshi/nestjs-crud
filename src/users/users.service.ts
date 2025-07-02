import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const userData = {
        name: createUserDto.name,
        passwordHash: createUserDto.password,
        email: createUserDto.email,
      };

      const newUser = this.userRepository.create(userData);
      await this.userRepository.save(newUser);
      return newUser;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('E-MAIL ALREADY EXISTS');
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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new ConflictException('User not found');
    }

    return this.userRepository.remove(user);
  }
}
