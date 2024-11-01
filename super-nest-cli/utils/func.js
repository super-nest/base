import fs from 'fs';
import path from 'path';
import { indexConstants } from './constants.form.js';
import { Controller, controllerAdmin } from './controller.form.js';
import { Service } from './service.form.js';
import { createDto, updateDto } from './dto.form.js';
import { Entities } from './entity.form.js';
import { Module } from './module.form.js';
import treeify from 'treeify';
import chalk from 'chalk';

export function isValidString(input) {
    const regex = /^[a-zA-Z-]+$/;
    return regex.test(input);
}
export function generateStringVariations(input) {
    let parts = input.split('-');

    let lowerCase = parts.map((part) => part.toLowerCase()).join('-');
    let capitalized = parts.map((part) => capitalizeFirstLetter(part)).join('');
    let upperCase = parts.map((part) => part.toUpperCase()).join('');
    let camelCase = parts
        .map((part, index) =>
            index === 0 ? part.toLowerCase() : capitalizeFirstLetter(part),
        )
        .join('');
    let upperCaseWithUnderscore = parts
        .map((part) => part.toUpperCase())
        .join('_');

    let singularCapitalized = capitalized;
    if (singularCapitalized.endsWith('s')) {
        singularCapitalized = singularCapitalized.slice(0, -1);
    }

    if (parts.length === 1) {
        upperCaseWithUnderscore = upperCase;
    }

    return [
        lowerCase,
        camelCase,
        capitalized,
        upperCase,
        upperCaseWithUnderscore,
        singularCapitalized,
    ];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export const logDirectoryStructure = (name) => {
    const baseDir = `./src/apis/${name}`;
    const tree = {};
    const addNode = (dirPath, node) => {
        const segments = dirPath.split(path.sep);
        let current = node;

        segments.forEach((segment) => {
            if (!current[segment]) {
                current[segment] = {};
            }
            current = current[segment];
        });
    };

    const buildTree = (dirPath, node) => {
        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                addNode(filePath.replace(baseDir + path.sep, ''), node);
                buildTree(filePath, node);
            } else {
                addNode(filePath.replace(baseDir + path.sep, ''), node);
            }
        });
    };

    buildTree(baseDir, tree);
    const coloredText = chalk.rgb(123, 150, 200)(treeify.asTree(tree, true));
    console.log(coloredText);
};

export const createFile = (filePath, content = '') => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
};

export const createModuleStructure = (name) => {
    console.log('name', name[0], name[1], name[2], name[3], name[4]);
    const baseDir = path.join('src/apis', name[0]);
    // Create directories and files
    createFile(
        path.join(baseDir, 'dto', `create-${name[0]}.dto.ts`),
        createDto(name),
    );
    createFile(
        path.join(baseDir, 'dto', `update-${name[0]}.dto.ts`),
        updateDto(name),
    );
    createFile(
        path.join(baseDir, 'entities', `${name[0]}.entity.ts`),
        Entities(name),
    );
    createFile(
        path.join(baseDir, 'controllers', `${name[0]}.controller.admin.ts`),
        `${controllerAdmin(name)}`,
    );
    createFile(
        path.join(baseDir, 'controllers', `${name[0]}.controller.ts`),
        `${Controller(name)}`,
    );
    createFile(path.join(baseDir, `${name[0]}.service.ts`), `${Service(name)}`);

    createFile(path.join(baseDir, `${name[0]}.module.ts`), Module(name));
};
