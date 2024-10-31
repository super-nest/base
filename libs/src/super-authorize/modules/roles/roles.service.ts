import { BadRequestException, Injectable } from '@nestjs/common';
import { RoleDocument } from './entities/roles.entity';
import { Types } from 'mongoose';
import { COLLECTION_NAMES } from 'src/constants';
import { SuperCacheService } from '@libs/super-cache/super-cache.service';
import { RoleType } from './constants';
import { BaseService } from 'src/base/service/base.service';
import { ExtendedInjectModel } from '@libs/super-core';
import { ExtendedModel } from '@libs/super-core/interfaces/extended-model.interface';
import { UserPayload } from 'src/base/models/user-payload.model';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService extends BaseService<RoleDocument> {
    constructor(
        @ExtendedInjectModel(COLLECTION_NAMES.ROLE)
        private readonly roleModel: ExtendedModel<RoleDocument>,
        private readonly superCacheService: SuperCacheService,
    ) {
        super(roleModel);
    }

    async updateOneById(
        _id: Types.ObjectId,
        updateRoleDto: UpdateRoleDto,
        user: UserPayload,
        options?: Record<string, any>,
    ) {
        const { _id: userId } = user;
        const result = await this.model.findOneAndUpdate(
            { _id },
            { ...updateRoleDto, ...options, updatedBy: userId },
        );

        if (!result) {
            throw new BadRequestException(`Not found ${_id}`);
        }

        await this.superCacheService.delete(`role:${_id}`);

        return result;
    }

    async getRoleByType(type: RoleType) {
        return await this.roleModel.findOne({ type });
    }

    async getOne(_id: Types.ObjectId, options?: Record<string, any>) {
        const result = await this.roleModel
            .findOne({
                _id,
                ...options,
            })
            .autoPopulate();

        if (!result) {
            throw new BadRequestException(`Not found ${_id}`);
        }

        return result;
    }

    async findPermissionsByRole(roleId: Types.ObjectId) {
        const cachePermissions = await this.superCacheService.get(
            `role:${roleId}`,
        );

        if (cachePermissions) {
            return cachePermissions;
        }

        const role = await this.roleModel.findById(roleId).autoPopulate();

        await this.superCacheService.set(`role:${roleId}`, role?.permissions);

        return role?.permissions;
    }
}
