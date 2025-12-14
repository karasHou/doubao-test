import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository&lt;User&gt;,
    private jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto): Promise&lt;{ user: User; token: string }&gt; {
    const { username, email, password, displayName } = createUserDto;

    // Check if username already exists
    const existingUsername = await this.userRepository.findOneBy({ username });
    if (existingUsername) {
      throw new ConflictException("Username already exists");
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findOneBy({ email });
    if (existingEmail) {
      throw new ConflictException("Email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = this.userRepository.create({
      username,
      email,
      password_hash: hashedPassword,
      display_name: displayName || username,
      avatar_color: this.generateRandomColor(),
    });

    await this.userRepository.save(user);

    // Generate JWT token
    const token = this.jwtService.sign({ userId: user.id });

    return { user, token };
  }

  async login(loginDto: LoginDto): Promise&lt;{ user: User; token: string }&gt; {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOneBy({ email });
    if (\!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (\!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate JWT token
    const token = this.jwtService.sign({ userId: user.id });

    return { user, token };
  }

  async findOneById(id: string): Promise&lt;User&gt; {
    return this.userRepository.findOneBy({ id });
  }

  private generateRandomColor(): string {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
      "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
      "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}