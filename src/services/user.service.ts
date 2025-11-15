import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.util';

export interface CreateUserInput {
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async createUser(userData: CreateUserInput): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = this.userRepository.create({
      email: userData.email,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async signIn(credentials: SignInInput): Promise<AuthResponse> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async signUp(userData: CreateUserInput): Promise<AuthResponse> {
    const user = await this.createUser(userData);
    const token = generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }
}

