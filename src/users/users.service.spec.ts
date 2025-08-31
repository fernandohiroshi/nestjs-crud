import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

// Tests for the UsersService
describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let hashingService: HashingService;

  // Initialize the testing module and mocks before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hashingService = module.get<HashingService>(HashingService);
  });

  // Checks if the service was properly instantiated
  it('should have UsersService defined', () => {
    expect(usersService).toBeDefined();
  });

  // Tests user creation
  describe('create', () => {
    // Should create a new user with valid data
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'alice@example.com',
        password: 'SuperSecret123',
        name: 'Alice Example',
      };
      const passwordHash = 'hashedSuperSecret123';
      const newUser = {
        name: createUserDto.name,
        passwordHash,
        email: createUserDto.email,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      // Mock user creation in the repository
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as any);

      // Act
      const result = await usersService.create(createUserDto);

      // Check if hash was called
      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);

      // Check if create was called with correct data
      expect(userRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        passwordHash,
        email: createUserDto.email,
      });

      // Check if save was called
      expect(userRepository.save).toHaveBeenCalledWith(newUser);

      // Check if the return matches the new user
      expect(result).toEqual(newUser);
    });

    // Should throw ConflictException if the email already exists
    it('should throw a ConflictException if email already exists', async () => {
      // Test setup: user creation with existing email
      jest.spyOn(userRepository, 'save').mockRejectedValue({
        code: '23505',
      });

      // Act and Assert
      await expect(usersService.create({} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw a generic error if save fails for other reasons', async () => {
      // Test setup: user creation with generic error
      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new Error('Generic error'));

      // Act and Assert
      await expect(usersService.create({} as any)).rejects.toThrow(
        new Error('Generic error'),
      );
    });
  });

  // Tests finding a user by ID
  describe('findOne', () => {
    // Should return the user when found
    it('should return a user when found', async () => {
      // Test setup: find user by ID
      const userID = 1;
      const userExists = {
        id: userID,
        name: 'Alice Example',
        passwordHash: 'hashedSuperSecret123',
        email: 'alice@example.com',
      };

      // Mock user search in the repository
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(userExists as any);

      const result = await usersService.findOne(userID);

      expect(result).toEqual(userExists);
    });

    // Should throw ConflictException if user is not found
    it('should throw a ConflictException if user is not found', async () => {
      // Test setup: user not found
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(usersService.findOne(1)).rejects.toThrow(ConflictException);
    });
  });

  // Tests listing all users
  describe('findAll', () => {
    // Should return all registered users
    it('should return all users', async () => {
      // Test setup: user listing
      const users: User[] = [
        {
          id: 1,
          name: 'Alice Example',
          passwordHash: 'hashedSuperSecret123',
          email: 'alice@example.com',
        } as User,
      ];

      // Mock user listing in the repository
      jest.spyOn(userRepository, 'find').mockResolvedValue(users);

      const result = await usersService.findAll();

      expect(result).toEqual(users);

      expect(userRepository.find).toHaveBeenCalledWith({
        order: {
          id: 'desc',
        },
      });
    });
  });

  // Tests updating user data
  describe('update', () => {
    // Should update name and password of a valid user
    it('should update a user with new name and password', async () => {
      // Test setup: updating user with valid data
      const userId = 1;
      const updateUserDto = { name: 'Alice Updated', password: 'NewPass123' };
      const tokenPayload = { sub: userId } as any;
      const passwordHash = 'hashedNewPass123';
      const updatedUser = {
        id: userId,
        name: 'Alice Updated',
        passwordHash,
      };

      // Mock password hashing
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      // Mock preload to simulate existing user
      jest
        .spyOn(userRepository, 'preload')
        .mockResolvedValue(updatedUser as any);
      // Mock save to simulate update
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as any);

      const result = await usersService.update(
        userId,
        updateUserDto,
        tokenPayload,
      );

      expect(result).toEqual(updatedUser);

      expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password);

      expect(userRepository.preload).toHaveBeenCalledWith({
        id: userId,
        name: updateUserDto.name,
        passwordHash,
      });

      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw a ForbiddenException', async () => {
      // Test setup: updating user without permission
      const userId = 1;
      const tokenPayload = { sub: 2 } as any;
      const updateUserDto = { name: 'John Smith' };
      const existingUser = {
        id: userId,
        name: 'John Smith',
        email: 'john.smith@email.com',
      };

      // Mock do preload para simular usuário existente
      jest
        .spyOn(userRepository, 'preload')
        .mockResolvedValue(existingUser as any);

      await expect(
        usersService.update(userId, updateUserDto, tokenPayload),
      ).rejects.toThrow(
        new ForbiddenException('You are not allowed to update this user'),
      );
    });

    // Should throw ConflictException if user to update does not exist
    it('should throw a ConflictException if user to update is not found', async () => {
      // Test setup: updating non-existent user
      const userId = 1;
      const tokenPayload = { sub: userId } as any;
      const updateUserDto = { name: 'Jane Roe Updated' };

      // Mock preload to simulate non-existent user
      jest.spyOn(userRepository, 'preload').mockResolvedValue(undefined);

      await expect(
        usersService.update(userId, updateUserDto, tokenPayload),
      ).rejects.toThrow(new ConflictException('User not found'));
    });
  });

  // Tests removing users
  describe('remove', () => {
    // Should remove the user if found and authorized
    it('should remove a user when found and authorized', async () => {
      // Test setup: removing user with permission
      const userId = 1;
      const tokenPayload = { sub: userId } as any;
      const existingUser = {
        id: userId,
        name: 'Jane Roe',
        email: 'jane.roe@email.com',
      };

      // Mock user lookup in the repository
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(existingUser as any);
      // Mock remove to simulate deletion
      jest
        .spyOn(userRepository, 'remove')
        .mockResolvedValue(existingUser as any);

      const result = await usersService.remove(userId, tokenPayload);

      expect(userRepository.remove).toHaveBeenCalledWith(existingUser);

      expect(result).toEqual(existingUser);
    });

    it('should throw a ForbiddenException', async () => {
      // Test setup: removing user without permission
      const userId = 1;
      const tokenPayload = { sub: 2 } as any;
      const existingUser = {
        id: userId,
        name: 'test',
      };

      // Mock da busca do usuário no repositório
      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(existingUser as any);

      await expect(usersService.remove(userId, tokenPayload)).rejects.toThrow(
        ForbiddenException,
      );
    });

    // Should throw ConflictException if user to remove does not exist
    it('should throw a ConflictException if user to remove is not found', async () => {
      // Test setup: removing non-existent user
      const userId = 1;
      const tokenPayload = { sub: userId } as any;

      // Mock da busca do usuário no repositório
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(usersService.remove(userId, tokenPayload)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  /**
   * Tests for the uploadPicture method:
   * - Should save the image and update the user when valid
   * - Should throw BadRequestException if file is too small
   * - Should throw ConflictException if user is not found
   */
  describe('uploadPicture', () => {
    it('should save the image and update the user when file is valid', async () => {
      // Setup a valid file and user
      const mockFile = {
        originalname: 'test.png',
        size: 2000,
        buffer: Buffer.from('file content'),
      } as Express.Multer.File;
      const mockUser = {
        id: 1,
        name: 'Joe Doe',
        email: 'joe.doe@email.com',
      } as User;
      const tokenPayload = { sub: 1 } as any;

      // Mock user lookup and repository save
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...mockUser,
        picture: '1.png',
      });
      // Mock fs.writeFile to prevent actual disk writes
      const writeFileMock = jest
        .spyOn(require('fs/promises'), 'writeFile')
        .mockResolvedValue(undefined);
      const filePath = require('path').resolve(
        process.cwd(),
        'pictures',
        '1.png',
      );

      // Act
      const result = await usersService.uploadPicture(mockFile, tokenPayload);

      // Assert that file is written and user is updated
      expect(writeFileMock).toHaveBeenCalledWith(filePath, mockFile.buffer);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        picture: '1.png',
      });
      expect(result).toEqual({
        ...mockUser,
        picture: '1.png',
      });
      writeFileMock.mockRestore();
    });

    it('should throw BadRequestException if the file is too small', async () => {
      // Setup a file smaller than 1KB
      const mockFile = {
        originalname: 'test.png',
        size: 500, // Less than 1024 bytes
        buffer: Buffer.from('small content'),
      } as Express.Multer.File;
      const tokenPayload = { sub: 1 } as any;

      // Should throw BadRequestException
      await expect(
        usersService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if the user is not found', async () => {
      // Setup a valid file but user lookup fails
      const mockFile = {
        originalname: 'test.png',
        size: 2000,
        buffer: Buffer.from('file content'),
      } as Express.Multer.File;
      const tokenPayload = { sub: 1 } as any;
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new ConflictException());

      // Should throw ConflictException
      await expect(
        usersService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(ConflictException);
    });
  });
});
