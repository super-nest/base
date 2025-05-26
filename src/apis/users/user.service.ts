import {
    BadRequestException,
    Injectable,
    OnModuleInit,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from 'src/base/service/base.service';
import { User, UserDocument } from './entities/user.entity';
import { COLLECTION_NAMES } from 'src/constants';
import { UserPayload } from 'src/base/models/user-payload.model';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import { UserCacheKey, UserStatus } from './constants';
import { SuperCacheService } from '@libs/super-cache/super-cache.service';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';
import { UpdateUserDto } from './dto/inputs/update-user.dto';
import { CreateUserDto } from './dto/inputs/create-user.dto';
import { UpdateMeDto } from './dto/inputs/update-me.dto';

@Injectable()
export class UserService
    extends BaseService<UserDocument>
    implements OnModuleInit
{
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.USER)
        private readonly userModel: ExtendedModel<UserDocument>,
        private readonly superCacheService: SuperCacheService,
    ) {
        super(userModel);
    }

    async onModuleInit() {
        const usersBanned = await this.userModel.find({
            status: UserStatus.INACTIVE,
        });

        const usersDeleted = await this.userModel.find({
            deletedAt: { $ne: null },
        });

        if (usersBanned.length) {
            const ids = usersBanned.map((user) => user._id);

            await this.addCacheBannedUser(ids);
        }

        if (usersDeleted.length) {
            const ids = usersDeleted.map((user) => user._id);

            await this.addCacheBannedUser(ids);
        }
    }

    async createOne(
        createUserDto: CreateUserDto,
        user: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = user;
        const { password } = createUserDto;

        const result = await this.userModel.create({
            ...createUserDto,
            ...options,
            createdBy: userId,
            password: await this.hashPassword(password),
        });

        return result;
    }

    async updateOneById(
        _id: Types.ObjectId,
        updateUserDto: UpdateUserDto,
        userPayload: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = userPayload;
        const { password } = updateUserDto;

        const update = {
            ...updateUserDto,
            ...options,
            updatedBy: userId,
            password: await this.hashPassword(password),
        };

        const user = await this.userModel.findOne({ _id });

        if (!user) {
            throw new BadRequestException(`Not found ${_id}`);
        }

        if (user.auth.password === update.password) {
            delete update.password;
        }

        const result = await this.userModel.updateOne(
            { _id },
            {
                ...update,
            },
        );

        return result;
    }

    async validateUserLocal(email: string, password: string) {
        if (!email || !password) {
            throw new UnprocessableEntityException(
                'email_password_incorrectly',
                'Email or password incorrectly',
            );
        }

        const user = await this.userModel.findOne({ email });

        const isMatch =
            user &&
            user.auth.password &&
            (await bcrypt.compare(password, user.auth.password));

        if (isMatch) {
            return user;
        }

        throw new UnprocessableEntityException(
            'email_password_incorrectly',
            'Email or password incorrectly',
        );
    }

    async updateMe(user: UserPayload, updateMeDto: UpdateMeDto) {
        await this.userModel.updateOne(
            { _id: user._id },
            {
                ...updateMeDto,
            },
        );

        const result = await this.getMe(user);
        return result;
    }

    async getMe(user: UserPayload) {
        const me = await this.userModel
            .findOne({
                _id: user._id,
            })
            .select({ password: 0 })
            .autoPopulate();

        if (!me) {
            throw new UnauthorizedException('user_not_found', 'User not found');
        }

        return me;
    }

    async deletes(_ids: Types.ObjectId[], user: UserPayload) {
        const { _id: userId } = user;
        const data = await this.userModel.find({ _id: { $in: _ids } });
        await this.userModel.updateMany(
            { _id: { $in: _ids } },
            { deletedAt: new Date(), deletedBy: userId },
        );

        await this.addCacheBannedUser(_ids);

        return data;
    }

    async ban(_ids: Types.ObjectId[], user: UserPayload) {
        await this.userModel.updateMany(
            { _id: { $in: _ids } },
            { status: UserStatus.INACTIVE, updatedBy: user._id },
        );

        await this.addCacheBannedUser(_ids);

        return _ids;
    }

    async unBan(_ids: Types.ObjectId[], user: UserPayload) {
        await this.userModel.updateMany(
            { _id: { $in: _ids } },
            { status: UserStatus.ACTIVE, updatedBy: user._id },
        );

        await this.removeCacheBannedUser(_ids);

        return _ids;
    }

    private async hashPassword(password: string) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    private async addCacheBannedUser(_ids: Types.ObjectId[]) {
        const id = _ids.map((id) => id.toString());
        const usersBannedInCache = await this.superCacheService.get<{
            items: any[];
        }>(UserCacheKey.USER_BANNED);

        if (usersBannedInCache) {
            usersBannedInCache.items.push(
                ..._.difference(id, usersBannedInCache.items),
            );

            await this.superCacheService.set(
                UserCacheKey.USER_BANNED,
                usersBannedInCache,
            );
        }

        if (!usersBannedInCache) {
            await this.superCacheService.set(UserCacheKey.USER_BANNED, {
                items: id,
            });
        }
    }

    private async removeCacheBannedUser(_ids: Types.ObjectId[]) {
        const id = _ids.map((id) => id.toString());
        const usersBannedInCache = await this.superCacheService.get<{
            items: any[];
        }>(UserCacheKey.USER_BANNED);

        if (usersBannedInCache) {
            usersBannedInCache.items = _.difference(
                usersBannedInCache.items,
                id,
            );

            await this.superCacheService.set(UserCacheKey.USER_BANNED, {
                items: usersBannedInCache.items,
            });
        }
    }

    //
    async findByGoogleId(googleId: string): Promise<User | null> {
        return this.userModel.findOne({ 'auth.googleId': googleId });
      }
    
      async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email });
      }
    
      async findByRefreshToken(refreshToken: string): Promise<User | null> {
        return this.userModel.findOne({ refreshToken });
      }
    
      async findByToken(token: string): Promise<User | null> {
        return this.userModel.findOne({ token });
      }
    
      async create(userData: Partial<User>): Promise<User> {
        const user = this.userModel.create(userData);
        return (await user).save();
      }
    
      async update(id: string, userData: Partial<User>): Promise<User | null> {
        return this.userModel
          .findByIdAndUpdate(id, userData);
      }
    
      async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id);
      }
}
