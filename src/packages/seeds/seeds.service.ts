import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import fs from 'fs';
import { Types } from 'mongoose';
import { UserService } from 'src/apis/users/user.service';
import { appSettings } from 'src/configs/app-settings';
import { MetadataService } from 'src/apis/metadata/metadata.service';
import { RolesService } from '@libs/super-authorize/modules/roles/roles.service';
import { PermissionsService } from '@libs/super-authorize/modules/permissions/permissions.service';
import { RoleType } from '@libs/super-authorize/modules/roles/constants';

@Injectable()
export class SeedsService implements OnModuleInit {
    public readonly logger = new Logger(SeedsService.name);
    constructor(
        private readonly roleService: RolesService,
        private readonly userService: UserService,
        private readonly permissionService: PermissionsService,
        private readonly metadataService: MetadataService,
    ) {}

    async onModuleInit() {
        if (!appSettings.development) {
            return;
        }

        await this.seedRoles();
        await this.seedMetadata();
        await this.seedUsers();
        this.logger.debug('Seeding completed');
    }

    async seedRoles() {
        const roles = JSON.parse(
            fs.readFileSync(process.cwd() + '/public/data/roles.json', 'utf8'),
        );

        this.logger.debug('Seeding roles');

        for (const role of roles) {
            delete role.createdAt;
            delete role.updatedAt;
            const { type } = role;
            if (type === RoleType.SUPER_ADMIN) {
                const permissions = await this.permissionService.model
                    .find({
                        path: 'admin',
                    })
                    .exec();

                const superAdmin = await this.roleService.model
                    .findOne({
                        type: RoleType.SUPER_ADMIN,
                    })
                    .exec();

                if (!superAdmin) {
                    await this.roleService.model.create({
                        ...role,
                        _id: new Types.ObjectId(role._id.$oid),
                        permissions: permissions.map((p) => p._id),
                    });
                } else {
                    await this.roleService.model.updateMany(
                        { type: RoleType.SUPER_ADMIN },
                        {
                            permissions: permissions.map((p) => p._id),
                        },
                    );
                }
            }

            if (type === RoleType.USER) {
                const permissions = await this.permissionService.model
                    .find({ path: 'front' })
                    .exec();

                const userRole = await this.roleService.model
                    .findOne({
                        type: RoleType.USER,
                    })
                    .exec();

                if (!userRole) {
                    await this.roleService.model.create({
                        ...role,
                        _id: new Types.ObjectId(role._id.$oid),
                        permissions: permissions.map((p) => p._id),
                    });
                } else {
                    await this.roleService.model.updateMany(
                        { type: RoleType.USER },
                        {
                            permissions: permissions.map((p) => p._id),
                        },
                    );
                }
            }
        }
    }

    async seedUsers() {
        const users = JSON.parse(
            fs.readFileSync(process.cwd() + '/public/data/users.json', 'utf8'),
        );

        this.logger.debug('Seeding users');

        if (appSettings.development) {
            await this.userService.model.updateMany({}, { deletedAt: null });
        }

        for (const user of users) {
            const { _id } = user;
            delete user.createdAt;
            delete user.updatedAt;
            const exit = await this.userService.model.findById(_id.$oid).exec();

            if (!exit) {
                await this.userService.model.create({
                    ...user,
                    _id: new Types.ObjectId(_id.$oid),
                    role: new Types.ObjectId(user.role.$oid),
                });
            }
        }
    }

    async seedMetadata() {
        const metadata = JSON.parse(
            fs.readFileSync(
                process.cwd() + '/public/data/metadata.json',
                'utf8',
            ),
        );

        this.logger.debug('Seeding metadata');
        await this.metadataService.model.deleteMany({});

        const result = metadata.map((item) => {
            delete item.createdAt;
            delete item.updatedAt;
            return {
                ...item,
                _id: new Types.ObjectId(item._id.$oid),
            };
        });

        await this.metadataService.model.insertMany(result);
    }
}
