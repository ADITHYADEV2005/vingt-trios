import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const userRole = dto.role || 'CUSTOMER';

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        role: userRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (userRole === 'TAILOR') {
      await this.prisma.tailorProfile.create({
        data: {
          userId: user.id,
          name: user.name,
          shopName: `${user.name} Master Workshop`,
          applicationStatus: 'APPROVED',
        },
      }).catch(() => {});
    } else if (userRole === 'DESIGNER') {
      await this.prisma.designerProfile.create({
        data: {
          userId: user.id,
          name: user.name,
          brandName: `${user.name} Couture`,
          applicationStatus: 'APPROVED',
        },
      }).catch(() => {});
    }

    return {
      message: 'Registration successful',
      user,
      token: this.generateToken(user.id, user.email, user.role, null),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        adminRole: (user as any).adminRole || null,
      },
      token: this.generateToken(user.id, user.email, user.role, (user as any).adminRole),
    };
  }

  private generateToken(userId: string, email: string, role: string, adminRole?: string | null) {
    return this.jwtService.sign({ sub: userId, email, role, adminRole: adminRole || null });
  }

  // ─── 2FA (EMAIL OTP) ────────────────────────────────────────────────────────

  async requestOtp(userId: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpSecret: otp, otpExpiry: expiry },
    });
    // In production: send otp via email (SendGrid/Nodemailer)
    console.log(`[2FA OTP for ${userId}]: ${otp}`);
    return { message: 'OTP sent to registered email', expiresIn: 600 };
  }

  async verifyOtp(userId: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.otpSecret || !user.otpExpiry) {
      throw new BadRequestException('No OTP requested or already used');
    }
    if (new Date() > user.otpExpiry) {
      throw new BadRequestException('OTP has expired');
    }
    if (user.otpSecret !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpSecret: null, otpExpiry: null },
    });
    return { verified: true, message: '2FA verification successful' };
  }

  async getAuditLog() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { actor: { select: { name: true, email: true } } },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        measurements: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        designs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) return null;

    const parsedDesigns = user.designs.map((design) => {
      let selectionsObj = null;
      if (design.selections) {
        try {
          selectionsObj = typeof design.selections === 'string' ? JSON.parse(design.selections) : design.selections;
        } catch {
          selectionsObj = design.selections;
        }
      }
      return {
        ...design,
        selections: selectionsObj,
      };
    });

    return {
      ...user,
      designs: parsedDesigns,
    };
  }

  async getMeasurements(userId: string) {
    return this.prisma.measurement.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveMeasurements(userId: string, data: any) {
    return this.prisma.measurement.create({
      data: {
        userId,
        label: data.label || 'My Measurements',
        chest: parseFloat(data.chest) || null,
        waist: parseFloat(data.waist) || null,
        shoulder: parseFloat(data.shoulder) || null,
        sleeve: parseFloat(data.sleeve) || null,
        inseam: parseFloat(data.inseam) || null,
        neck: parseFloat(data.neck) || null,
        hip: parseFloat(data.hip) || null,
        fitPreference: data.fitPreference || 'Slim Fit',
      },
    });
  }

  async getSavedDesigns(userId: string) {
    const designs = await this.prisma.savedDesign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return designs.map((d) => {
      let selectionsObj = null;
      if (d.selections) {
        try {
          selectionsObj = typeof d.selections === 'string' ? JSON.parse(d.selections) : d.selections;
        } catch {
          selectionsObj = d.selections;
        }
      }
      return {
        ...d,
        selections: selectionsObj,
      };
    });
  }

  async saveDesign(userId: string, data: any) {
    return this.prisma.savedDesign.create({
      data: {
        userId,
        name: data.name || `My Custom ${data.category}`,
        category: data.category,
        selections: JSON.stringify(data.selections),
      },
    });
  }

  async getAllUsersForAdmin() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRoleForAdmin(userId: string, role: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }
}
