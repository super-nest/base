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
    // Sử dụng biểu thức chính quy để kiểm tra chuỗi
    const regex = /^[a-zA-Z-]+$/;
    return regex.test(input);
}
export function generateStringVariations(input) {
    // Chia chuỗi thành các phần dựa trên dấu gạch ngang
    let parts = input.split('-');

    // Các biến thể của từng phần
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

    // Nếu không có dấu gạch ngang, chỉ viết hoa toàn bộ
    if (parts.length === 1) {
        upperCaseWithUnderscore = upperCase; // Không có dấu gạch ngang, chỉ viết hoa toàn bộ
    }

    // Trả về các biến thể
    return [
        lowerCase, // Dạng gốc: aav hoặc aav-ag
        camelCase, // Dạng aavAg hoặc aavAg
        capitalized, // Dạng Aav hoặc AavAg
        upperCase, // Dạng AAV hoặc AAVAG
        upperCaseWithUnderscore, // Dạng AAV hoặc AAV_AG
    ];
}

// Hàm để viết hoa ký tự đầu tiên của chuỗi
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export const logDirectoryStructure = (name) => {
    const baseDir = `./src/${name}`;
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
    const baseDir = path.join('src', name[0]);
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
