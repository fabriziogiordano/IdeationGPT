import chalk from "chalk";
import ora from 'ora';

export const log = console.log;
export const warning = chalk.bold.red;
export const bold = chalk.bold;
export const blue = chalk.blue;
export const green = chalk.green;
export const white = chalk.white;
export const spinner = ora;
