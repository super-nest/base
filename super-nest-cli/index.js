#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { exec } from 'child_process';
import {
    createModuleStructure,
    logDirectoryStructure,
    isValidString,
    generateStringVariations,
} from './utils/func.js';

const program = new Command();

program
    .command('g <type> <name>')
    .description('Generate new resource, module, service, or controller')
    .action((type, name) => {
        if (isValidString(name) === false) {
            console.log(
                chalk.red('Invalid name. Please use only letters and dashes.'),
            );
            return;
        }
        console.log(chalk.green(`Create ${type} with name: ${name}`));

        if (type === 'resource') {
            const handleName = generateStringVariations(name);
            createModuleStructure(handleName);
            logDirectoryStructure(handleName[0]);
        } else {
            const noSpecFlag = ' --no-spec';
            const commands = {
                service: `nest g service ${name}${noSpecFlag}`,
                controller: `nest g controller ${name}${noSpecFlag}`,
                module: `nest g module ${name}${noSpecFlag}`,
            };

            if (commands[type]) {
                exec(commands[type], (error, stdout, stderr) => {
                    if (error) {
                        console.log(chalk.red(`Error: ${error.message}`));
                        return;
                    }
                    if (stderr) {
                        console.log(chalk.red(`Error: ${stderr}`));
                        return;
                    }
                    console.log(chalk.blue(stdout));
                });
            } else {
                console.log(
                    chalk.red(
                        'Invalid type. Please choose either "resource" "module", "service", or "controller".',
                    ),
                );
            }
        }
    });

program
    .command('serve')
    .description('Run server')
    .action(() => {
        exec('npm run start:dev', (error, stdout, stderr) => {
            if (error) {
                console.log(chalk.red(`Error: ${error.message}`));
                return;
            }
            if (stderr) {
                console.log(chalk.red(`Error: ${stderr}`));
                return;
            }
            console.log(chalk.blue(stdout));
        });
    });

program.parse(process.argv);
