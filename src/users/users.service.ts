import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { responseMessage } from 'src/common/constants/response-messages';
import { ValidationMessages } from 'src/common/constants/validation-messages';
import { hashPassword } from 'src/common/helpers/hash-password.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const { email, username, password } = createUserDto;

    //Kiểm tra trùng email
    const duplicateEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (duplicateEmail)
      throw new ConflictException(ValidationMessages.EMAIL_TAKEN);

    //Kiểm tra trùng username

    const duplicateUsername = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (duplicateUsername)
      throw new ConflictException(ValidationMessages.USERNAME_TAKEN);

    //hash password
    const hashedPassword = await hashPassword(password);

    //tạo user
    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    return {
      message: responseMessage.CREATE_SUCCESS,
      data: {
        user: {
          ...newUser,
          password: undefined,
        },
      },
    };
  }

  async findAll(
    query: {
      page?: number;
      pageSize?: number;
      search?: string;
      sortBy?: 'name' | 'email' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * pageSize;

    // Tìm tổng số user matching
    const total = await this.prisma.user.count({
      where: {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { username: { contains: search } },
        ],
      },
    });

    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { username: { contains: search } },
        ],
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        users,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException(`User ${responseMessage.NOT_FOUND}`);

    return {
      message: responseMessage.GET_SUCCESS,
      data: {
        ...user,
        password: undefined,
      },
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    // Kiểm tra user tồn tại chưa
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser)
      throw new NotFoundException(`User ${responseMessage.NOT_FOUND}`);

    // Nếu update password, hash trước
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    // Kiểm tra trùng email nếu FE gửi
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const duplicateEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (duplicateEmail && duplicateEmail.id !== id)
        throw new ConflictException(ValidationMessages.EMAIL_TAKEN);
    }

    // Kiểm tra trùng username nếu FE gửi
    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const duplicateUsername = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });
      if (duplicateUsername && duplicateUsername.id !== id)
        throw new ConflictException(ValidationMessages.USERNAME_TAKEN);
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      data: updatedUser,
    };
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException(`User ${responseMessage.NOT_FOUND}`);

    await this.prisma.user.delete({
      where: {
        id,
      },
    });
    return { message: responseMessage.DELETE_SUCCESS };
  }
}
