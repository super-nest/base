import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PermissionsService } from './modules/permissions/permissions.service';
import { PermissionStorage } from './storages/permission.storage';
import { SuperAuthorizeOptions } from './super-authorize.module';
import _ from 'lodash';

@Injectable()
export class SuperAuthorizeService implements OnModuleInit {
    constructor(
        @Inject('SUPER_AUTHORIZE_OPTIONS')
        private readonly superAuthorizeOptions: SuperAuthorizeOptions,
        private readonly permissionsService: PermissionsService,
    ) {
        PermissionStorage.addPaths(this.superAuthorizeOptions.paths);
    }

    async onModuleInit() {
        const permissionMetadata = PermissionStorage.getPermissionMetadata();
        const permissions = await this.permissionsService.model.find({});

        const newPermissions = _.differenceWith(
            permissionMetadata,
            permissions,
            (item, p) =>
                item.path === p.path &&
                item.prefix === p.prefix &&
                item.requestMethod === p.requestMethod,
        );

        if (!_.isEmpty(newPermissions)) {
            await this.permissionsService.model.insertMany(newPermissions);
        }

        const permissionsToDelete = _.differenceWith(
            permissions,
            permissionMetadata,
            (p, item) =>
                p.path === item.path &&
                p.prefix === item.prefix &&
                p.requestMethod === item.requestMethod,
        );

        if (!_.isEmpty(permissionsToDelete)) {
            const deletePromises = _.map(permissionsToDelete, (item) =>
                this.permissionsService.model.deleteOne({ _id: item._id }),
            );
            await Promise.all(deletePromises);
        }
    }
}
